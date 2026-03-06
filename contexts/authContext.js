import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import i18next from 'i18next';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';
  const ACTIVE_USER_KEY = 'active_user';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [primaryUser, setPrimaryUser] = useState(null);
  const [childAccounts, setChildAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const isRemoteUrl = (url) => /^https?:\/\//i.test(url);
  const isLocalUri = (url) => /^(file|content|data):\/\//i.test(url);

  const makeAbsolute = (avatarPath) => {
    if (!avatarPath) return avatarPath;
    // If it's already a remote URL or a local file/data URI, return as-is.
    if (isRemoteUrl(avatarPath) || isLocalUri(avatarPath)) return avatarPath;
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return avatarPath.startsWith('/') ? `${base}${avatarPath}` : `${base}/${avatarPath}`;
  };

  const normalizePrimaryUser = (obj) => {
    if (!obj) return obj;
    const copy = { ...obj };
    if (copy.user && copy.user.avatar) {
      const avatar = typeof copy.user.avatar === 'string' && copy.user.avatar.trim() !== ''
        ? makeAbsolute(copy.user.avatar)
        : null;
      copy.user = { ...copy.user, avatar };
    }
    return copy;
  };

  const normalizeChild = (child) => {
    if (!child) return child;
    const avatar = typeof child.avatar === 'string' && child.avatar.trim() !== ''
      ? makeAbsolute(child.avatar)
      : null;
    return { ...child, avatar };
  };

  const updateChildAvatar = async (userId, avatar) => {
    setChildAccounts(prev => {
      if (!prev) return prev;
      return prev.map(child =>
        child.id === userId ? { ...child, avatar } : child
      );
    });

    try {
      const storedChildren = await AsyncStorage.getItem('child_accounts');
      const parsed = storedChildren ? JSON.parse(storedChildren) : [];
      const updated = (parsed || []).map(child =>
        child.id === userId ? { ...child, avatar } : child
      );
      await AsyncStorage.setItem('child_accounts', JSON.stringify(updated));
    } catch (e) {
      console.warn('updateChildAvatar storage write failed', e.message);
    }
  };

  // --- AUTH FETCH WRAPPER ---
  const authFetch = async (url, options = {}) => {
    const session = await refreshToken();
    const token = session?.token?.value;

    const defaultHeaders = {
      'Accept': 'application/json',
      'lang': i18next.language,
    };

    if (options.body && !(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  };

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('primary_user');
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        const userObject = parsedUser.data || parsedUser;
        const normalizedUser = normalizePrimaryUser(userObject);
        setPrimaryUser(normalizedUser);

        const storedChildren = await AsyncStorage.getItem('child_accounts');
        let parsedChildren = [];
        let normalizedChildren = [];
        if (storedChildren) {
          try {
            parsedChildren = JSON.parse(storedChildren);
            normalizedChildren = parsedChildren.map(normalizeChild);
            setChildAccounts(normalizedChildren);
          } catch (e) {
            setChildAccounts([]);
          }
        }

        // Load last active user (parent or a child) so we can restore impersonation after reload.
        const storedActive = await AsyncStorage.getItem(ACTIVE_USER_KEY);
        if (storedActive) {
          const activeId = storedActive;
          const matchedChild = (normalizedChildren || []).find(c => c.id === activeId);
          if (matchedChild) {
            // Always store the user object in the shape expected by `useAuth` consumers.
            setUser({ user: matchedChild, token: { value: normalizedUser?.token?.value } });
          } else {
            setUser(normalizedUser);
            await AsyncStorage.removeItem(ACTIVE_USER_KEY);
          }
        } else {
          setUser(normalizedUser);
        }

        const tokenValue = normalizedUser?.token?.value;
        const userId = normalizedUser?.user?.id;
        if (tokenValue && userId) {
          fetchChildren(tokenValue, userId);
        }
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };

    const minimumDisplayTime = new Promise(resolve => setTimeout(resolve, 2000));
    Promise.all([loadUserFromStorage(), minimumDisplayTime]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const refreshToken = async () => {
    if (!primaryUser?.token?.value) return primaryUser;
    try {
      const decodedToken = jwtDecode(primaryUser.token.value);
      const now = Date.now() / 1000;
      if (decodedToken.exp > now + 300) return primaryUser;

      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${primaryUser.token.value}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Refresh failed");

      const newUserState = normalizePrimaryUser(data.data || data);
      await AsyncStorage.setItem('primary_user', JSON.stringify(newUserState));
      setPrimaryUser(newUserState);
      return newUserState;
    } catch (error) {
      await logout();
      return null;
    }
  };

  const fetchChildren = async (token, userId) => {
    if (!token || !userId) return;
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}`, 'lang': i18next.language },
      });
      const data = await response.json();
      if (response.ok) {
        const normalized = (data.data || []).map(normalizeChild);

        // Merge with locally updated child avatars so we don't overwrite an in-memory local URI.
        const merged = normalized.map(child => {
          const existing = childAccounts.find(c => c.id === child.id);
          if (!existing) return child;
          const existingAvatar = existing.avatar;
          if (existingAvatar && isLocalUri(existingAvatar)) {
            return { ...child, avatar: existingAvatar };
          }
          return child;
        });

        setChildAccounts(merged);
        await AsyncStorage.setItem('child_accounts', JSON.stringify(merged));
      }
    } catch (e) { console.error("Fetch children failed", e); }
  };

  const login = async (userData) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json', 'lang': i18next.language },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      const normalized = normalizePrimaryUser(data.data);
      await AsyncStorage.setItem('primary_user', JSON.stringify(normalized));
      setPrimaryUser(normalized);
      setUser(normalized);
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
      await fetchChildren(normalized.token.value, normalized.user.id);
    } catch (error) { throw error; } finally { setIsAuthLoading(false); }
  };

  const setSession = async (sessionData) => {
    const userObject = sessionData.data || sessionData;
    const normalized = normalizePrimaryUser(userObject);
    await AsyncStorage.setItem('primary_user', JSON.stringify(normalized));
    setPrimaryUser(normalized);
    setUser(normalized);
    await AsyncStorage.removeItem(ACTIVE_USER_KEY);
    await fetchChildren(normalized.token.value, normalized.user.id);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('primary_user');
    await AsyncStorage.removeItem('child_accounts');
    setUser(null);
    setPrimaryUser(null);
    setChildAccounts([]);
  };

  const signup = async (userData) => {
    setIsAuthLoading(true);
    try {
      const { id: birthCertificateImage, parent_id, ...otherUserData } = userData;
      const formData = new FormData();

      for (const key in otherUserData) {
        if (otherUserData[key] != null) formData.append(key, otherUserData[key]);
      }

      let url = `${API_URL}/api/v1/auth/users`;
      if (parent_id) url += `?user_id=${parent_id}`;

      const headers = { "accept": "application/json" };
      if (parent_id && user?.token?.value) {
        headers['Authorization'] = `Bearer ${user.token.value}`;
      }

      const response = await fetch(url, { method: 'POST', body: formData, headers });
      const data = await response.json();

      if (!response.ok) throw new Error(data?.message || "Signup failed");

      if (!parent_id) {
        await setSession(data);
      } else {
        await fetchChildren(primaryUser.token.value, primaryUser.user.id);
      }
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (e) { throw e; }
  };

  const updateUserProfile = async (userId, formData) => {
    setIsAuthLoading(true);
    try {
      formData.append('_method', 'PUT');
      const response = await authFetch(`${API_URL}/api/v1/auth/users/${userId}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Update failed");

      let updatedUser = data?.data || data;

      // When server explicitly returns `avatar: null`, treat it as "avatar removed".
      // Otherwise, keep existing avatar when it isn't part of the response.
      if (Object.prototype.hasOwnProperty.call(updatedUser, 'avatar')) {
        updatedUser.avatar = updatedUser.avatar ? makeAbsolute(updatedUser.avatar) : null;
      }

      // Determine final avatar to keep (API > existing state) so we can sync child list too.
      const existingAvatar = user?.user?.avatar;
      const finalAvatar = updatedUser.avatar || existingAvatar || null;

      setUser(prev => {
        const currentAvatar = prev?.user?.avatar;
        const finalAvatarLocal = updatedUser.avatar || currentAvatar || null;
        return { ...prev, user: { ...prev?.user, ...updatedUser, avatar: finalAvatarLocal } };
      });

      // If updating a child account (not the primary user), keep the child list in sync.
      if (primaryUser?.user?.id !== userId) {
        await updateChildAvatar(userId, finalAvatar);
      }

      if (primaryUser?.user?.id === userId) {
        // Read the latest stored data (which setTempAvatar already wrote to AsyncStorage)
        const latestStored = await AsyncStorage.getItem('primary_user');
        const latestParsed = latestStored ? JSON.parse(latestStored) : null;
        const latestAvatar =
          latestParsed?.user?.avatar ||
          latestParsed?.data?.user?.avatar ||
          null;
        // Prefer: API real URL > temp URI already in AsyncStorage > old avatar in state
        const finalAvatar = updatedUser.avatar || latestAvatar || primaryUser?.user?.avatar || null;

        const mergedUser = { ...primaryUser.user, ...updatedUser, avatar: finalAvatar };
        const newPrimary = { ...primaryUser, user: mergedUser };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally { setIsAuthLoading(false); }
  };

  const deleteUserAvatar = async (userId) => {
    // Optimistic update: clear avatar immediately (but restore on error).
    const previousAvatar = user?.user?.avatar;
    setUser(prev => prev ? { ...prev, user: { ...prev.user, avatar: null } } : prev);

    if (primaryUser?.user?.id === userId) {
      const mergedUser = { ...primaryUser.user, avatar: null };
      const newPrimary = { ...primaryUser, user: mergedUser };
      setPrimaryUser(newPrimary);
      await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
    } else {
      await updateChildAvatar(userId, null);
    }

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      // backend should interpret this as "clear avatar"
      formData.append('avatar', '');
      formData.append('remove_avatar', '1');

      const result = await updateUserProfile(userId, formData);
      if (!result.success) throw new Error(result.error || 'Delete avatar failed');

      return { success: true };
    } catch (error) {
      // Restore previous avatar on failure.
      setUser(prev => prev ? { ...prev, user: { ...prev.user, avatar: previousAvatar } } : prev);

      if (primaryUser?.user?.id === userId) {
        const mergedUser = { ...primaryUser.user, avatar: previousAvatar };
        const newPrimary = { ...primaryUser, user: mergedUser };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      } else {
        await updateChildAvatar(userId, previousAvatar);
      }

      return { success: false, error: error.message };
    }
  };

  const setActiveAccount = async (account) => {
    if (!account) {
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
      if (primaryUser) setUser(primaryUser);
      return;
    }

    // If the child object doesn't include a token, use the parent's token for API calls.
    const tokenValue = account?.token?.value || account?.token || primaryUser?.token?.value;
    if (!tokenValue) return;

    const matchedChild = childAccounts.find(c => c.id === account.id);
    const childWithAvatar = matchedChild ? { ...matchedChild, ...account } : account;

    await AsyncStorage.setItem(ACTIVE_USER_KEY, `${account.id}`);

    // Show whatever we have immediately, then try to fetch the full profile if it is incomplete.
    setUser({ user: childWithAvatar, token: { value: tokenValue } });

    const needsFullProfile =
      !childWithAvatar.resource ||
      !childWithAvatar.resource?.birthdate ||
      childWithAvatar.avatar === '' ||
      childWithAvatar.avatar == null;

    if (needsFullProfile) {
      const full = await fetchUserProfile(account.id);
      if (full) {
        const normalized = normalizeChild(full);
        setUser({ user: normalized, token: { value: tokenValue } });
        await updateChildAvatar(account.id, normalized.avatar);

        const updatedChildren = (childAccounts || []).map(c =>
          c.id === account.id ? { ...c, ...normalized } : c
        );
        setChildAccounts(updatedChildren);
        await AsyncStorage.setItem('child_accounts', JSON.stringify(updatedChildren));
      }
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await authFetch(`${API_URL}/api/v1/auth/users/${userId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load user');
      const userData = data.data || data;
      return userData;
    } catch (error) {
      console.warn('fetchUserProfile failed', error.message);
      return null;
    }
  };

  const switchAccount = (account) => {
    setActiveAccount(account);
  };

  // FIX: Persist temp avatar URI to AsyncStorage so it survives app reload.
  // Previously only React state was updated, so on reload the avatar was lost
  // until the user signed out and back in.
  const setTempAvatar = async (userId, uri) => {
    // Update React state immediately for instant UI feedback
    setUser(prev =>
      prev?.user?.id === userId ? { ...prev, user: { ...prev.user, avatar: uri } } : prev
    );

    // Cache to child list (for switching back to a child account)
    if (primaryUser?.user?.id !== userId) {
      await updateChildAvatar(userId, uri);
    }

    // Also persist to AsyncStorage so the avatar survives a reload
    if (primaryUser?.user?.id === userId) {
      try {
        const mergedUser = { ...primaryUser.user, avatar: uri };
        const newPrimary = { ...primaryUser, user: mergedUser };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      } catch (e) {
        console.warn('setTempAvatar storage write failed', e.message);
      }
    }
  };

  const value = {
    user, primaryUser, children: childAccounts,
    isImpersonating: primaryUser && user && primaryUser.user.id !== user.user.id,
    isAuthenticated: !!primaryUser,
    isLoading, isAuthLoading,
    login, setSession, logout, signup, fetchChildren, forgotPassword,
    refreshToken, authFetch, updateUserProfile, deleteUserAvatar, switchAccount, setTempAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
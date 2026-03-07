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
    // Prefer using the current user's token when impersonating a child account.
    // Otherwise, refresh the primary user's token as before.
    const getAuthToken = async () => {
      if (user && primaryUser && user.user?.id !== primaryUser.user?.id && user.token?.value) {
        return user.token.value;
      }
      if (!primaryUser && user?.token?.value) {
        return user.token.value;
      }
      const session = await refreshToken();
      return session?.token?.value;
    };

    const token = await getAuthToken();

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
            // Use the child's token if available, otherwise use parent's token
            const childToken = matchedChild.token?.value || matchedChild.token;
            const childUser = { user: matchedChild, token: { value: childToken || normalizedUser?.token?.value } };
            setUser(childUser);

            // Refresh the child profile from the server (especially for `resource`).
            if (childToken) {
              try {
                const response = await fetch(`${API_URL}/api/v1/auth/me`, {
                  method: 'GET',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    lang: i18next.language,
                    Authorization: `Bearer ${childToken}`,
                  },
                });

                const data = await response.json();
                if (response.ok) {
                  const meData = data.data || data;
                  const serverAvatar = meData.avatar ? makeAbsolute(meData.avatar) : null;
                  const finalAvatar = isLocalUri(matchedChild.avatar)
                    ? matchedChild.avatar
                    : (serverAvatar || matchedChild.avatar);
                  const refreshedUser = { ...matchedChild, ...meData, avatar: finalAvatar };

                  setUser({ user: refreshedUser, token: { value: childToken } });

                  // Persist refreshed child profile
                  const updatedChildren = (normalizedChildren || []).map(child =>
                    child.id === refreshedUser.id ? { ...child, ...refreshedUser } : child
                  );
                  setChildAccounts(updatedChildren);
                  await AsyncStorage.setItem('child_accounts', JSON.stringify(updatedChildren));
                }
              } catch (e) {
                console.warn('Failed to refresh child profile on load:', e.message);
              }
            }
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
        const children = data.data || [];

        // For each child, use their token to fetch complete profile information
        const childrenWithFullData = await Promise.all(
          children.map(async (child) => {
            const normalized = normalizeChild(child);

            // If child has a token, try to fetch their complete profile
            if (child.token) {
              try {
                const profileResponse = await fetch(`${API_URL}/api/v1/auth/users/${child.id}`, {
                  headers: { 'Authorization': `Bearer ${child.token}`, 'lang': i18next.language },
                });
                
                // Check if response is JSON before parsing
                const contentType = profileResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const profileData = await profileResponse.json();

                  if (profileResponse.ok && profileData.data) {
                    // Merge the normalized child with full profile data
                    return {
                      ...normalized,
                      ...profileData.data,
                      token: child.token, // Keep the child's token
                      name: profileData.data.name || normalized.name || child.name // Ensure name is preserved
                    };
                  }
                } else {
                  console.warn(`Child ${child.id} profile response is not JSON, status: ${profileResponse.status}`);
                }
              } catch (error) {
                console.warn(`Failed to fetch full profile for child ${child.id} with child token:`, error.message);
              }
              
              // Fallback: try with parent token if child token failed
              try {
                console.log(`Trying fallback with parent token for child ${child.id}`);
                const profileResponse = await fetch(`${API_URL}/api/v1/auth/users/${child.id}`, {
                  headers: { 'Authorization': `Bearer ${token}`, 'lang': i18next.language },
                });
                
                const contentType = profileResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const profileData = await profileResponse.json();

                  if (profileResponse.ok && profileData.data) {
                    return {
                      ...normalized,
                      ...profileData.data,
                      token: child.token, // Keep the child's token even though we used parent token for fetch
                      name: profileData.data.name || normalized.name || child.name // Ensure name is preserved
                    };
                  }
                }
              } catch (fallbackError) {
                console.warn(`Fallback also failed for child ${child.id}:`, fallbackError.message);
              }
            }

            return normalized;
          })
        );

        // Merge with locally updated child avatars so we don't overwrite an in-memory local URI.
        const merged = childrenWithFullData.map(child => {
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

      // When impersonating a child account, the backend may only allow updates via /me.
      // Use /me for updates so we avoid 405/permission errors when using the child token.
      const endpoint = (primaryUser?.user?.id && user?.user?.id && primaryUser.user.id !== user.user.id && user.user.id === userId)
        ? `${API_URL}/api/v1/auth/me`
        : `${API_URL}/api/v1/auth/users/${userId}`;

      const response = await authFetch(endpoint, {
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
    } finally {
      setIsAuthLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const tokenValue = primaryUser?.token?.value || user?.token?.value;
      if (!tokenValue) return null;
      
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

  const setActiveAccount = async (account) => {
    if (!account) {
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
      if (primaryUser) {
        setUser(primaryUser);
      }
      return;
    }

    // Use the child's own token if available, otherwise fall back to parent's token
    const tokenValue = account?.token?.value || account?.token || primaryUser?.token?.value;
    if (!tokenValue) return;

    const matchedChild = childAccounts.find(c => c.id === account.id);
    const childWithAvatar = matchedChild ? { ...matchedChild, ...account } : account;

    await AsyncStorage.setItem(ACTIVE_USER_KEY, `${account.id}`);

    // When switching to a child account, refresh the profile from the /me endpoint
    // to ensure we have the latest data from the server.
    if (primaryUser?.user?.id !== account.id) {
      try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            lang: i18next.language,
            Authorization: `Bearer ${tokenValue}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          const meData = data.data || data;
          // Log the child "resource" payload for debugging
          console.log('Child /me resource:', meData.resource);

          const serverAvatar = meData.avatar ? makeAbsolute(meData.avatar) : null;
          const finalAvatar = isLocalUri(childWithAvatar.avatar)
            ? childWithAvatar.avatar
            : (serverAvatar || childWithAvatar.avatar);
          const finalUser = {
            ...childWithAvatar,
            ...meData,
            avatar: finalAvatar,
          };

          setUser({ user: finalUser, token: { value: tokenValue } });

          // Persist /me results in storage so the next app load uses the fresh server data.
          try {
            const storedChildren = await AsyncStorage.getItem('child_accounts');
            const parsed = storedChildren ? JSON.parse(storedChildren) : [];
            const updated = (parsed || []).map(child =>
              child.id === finalUser.id ? { ...child, ...finalUser } : child
            );
            await AsyncStorage.setItem('child_accounts', JSON.stringify(updated));
            setChildAccounts(updated);
          } catch (e) {
            console.warn('Failed to persist child profile after /me:', e.message);
          }

          return;
        }
      } catch (error) {
        console.warn('Failed to refresh /me after switching account:', error.message);
      }
    }

    // Fallback: use cached data if /me fails
    setUser({ user: childWithAvatar, token: { value: tokenValue } });
  };

  const switchAccount = (account) => {
    setActiveAccount(account);
  };

  const setTempAvatar = async (userId, uri) => {
    // Update React state immediately for instant UI feedback
    setUser(prev =>
      prev?.user?.id === userId ? { ...prev, user: { ...prev.user, avatar: uri } } : prev
    );

    // Always cache to child list (for switching back to a child account)
    await updateChildAvatar(userId, uri);

    // Also persist to AsyncStorage so avatar survives a reload
    try {
      if (primaryUser?.user?.id === userId) {
        // For primary user, update primary_user storage
        const mergedUser = { ...primaryUser.user, avatar: uri };
        const newPrimary = { ...primaryUser, user: mergedUser };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      } else {
        // For child user, update child_accounts storage
        const storedChildren = await AsyncStorage.getItem('child_accounts');
        const parsed = storedChildren ? JSON.parse(storedChildren) : [];
        const updated = (parsed || []).map(child =>
          child.id === userId ? { ...child, avatar: uri } : child
        );
        await AsyncStorage.setItem('child_accounts', JSON.stringify(updated));
        
        // Also update in-memory childAccounts state
        setChildAccounts(updated);
      }
    } catch (e) {
      console.warn('setTempAvatar storage write failed', e.message);
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
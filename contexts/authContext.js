import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import i18next from 'i18next';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [primaryUser, setPrimaryUser] = useState(null);
  const [childAccounts, setChildAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const makeAbsolute = (avatarPath) => {
    if (!avatarPath) return avatarPath;
    if (/^https?:\/\//.test(avatarPath)) return avatarPath;
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return avatarPath.startsWith('/') ? `${base}${avatarPath}` : `${base}/${avatarPath}`;
  };

  const normalizePrimaryUser = (obj) => {
    if (!obj) return obj;
    const copy = { ...obj };
    if (copy.user && copy.user.avatar) {
      copy.user = { ...copy.user, avatar: makeAbsolute(copy.user.avatar) };
    }
    return copy;
  };

  const normalizeChild = (child) => {
    if (!child) return child;
    if (child.avatar) {
      return { ...child, avatar: makeAbsolute(child.avatar) };
    }
    return child;
  };

  // --- UPDATED AUTH FETCH WRAPPER ---
  const authFetch = async (url, options = {}) => {
    const session = await refreshToken();
    const token = session?.token?.value;

    const defaultHeaders = {
      'Accept': 'application/json',
      'lang': i18next.language,
    };

    // CRITICAL FIX: 
    // Only set Content-Type to application/json if we are NOT sending FormData.
    // If it IS FormData, fetch must handle the boundary header automatically.
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
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const userObject = parsedUser.data || parsedUser;
          const normalizedUser = normalizePrimaryUser(userObject);
          setPrimaryUser(normalizedUser);
          setUser(normalizedUser);

          const storedChildren = await AsyncStorage.getItem('child_accounts');
          if (storedChildren) {
            try {
              const parsedChildren = JSON.parse(storedChildren);
              setChildAccounts(parsedChildren.map(normalizeChild));
            } catch (e) { setChildAccounts([]); }
          }
          fetchChildren(normalizedUser.token.value, normalizedUser.user.id);
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
        setChildAccounts(normalized);
        await AsyncStorage.setItem('child_accounts', JSON.stringify(normalized));
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
      await fetchChildren(normalized.token.value, normalized.user.id);
    } catch (error) { throw error; } finally { setIsAuthLoading(false); }
  };

  const setSession = async (sessionData) => {
    const userObject = sessionData.data || sessionData;
    const normalized = normalizePrimaryUser(userObject);
    await AsyncStorage.setItem('primary_user', JSON.stringify(normalized));
    setPrimaryUser(normalized);
    setUser(normalized);
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
      if (updatedUser.avatar) updatedUser.avatar = makeAbsolute(updatedUser.avatar);

      setUser(prev => ({ ...prev, user: { ...prev?.user, ...updatedUser } }));

      if (primaryUser?.user?.id === userId) {
        const newPrimary = { ...primaryUser, user: { ...primaryUser.user, ...updatedUser } };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally { setIsAuthLoading(false); }
  };

  const switchAccount = (account) => {
    if (!account) {
      if (primaryUser) setUser(primaryUser);
      return;
    }
    const token = account.token?.value || account.token;
    if (!token) return;
    setUser({ user: account, token: { value: token } });
  };

  const setTempAvatar = async (userId, uri) => {
    setUser(prev => (prev?.user?.id === userId ? { ...prev, user: { ...prev.user, avatar: uri } } : prev));
  };

  const value = {
    user, primaryUser, children: childAccounts,
    isImpersonating: primaryUser && user && primaryUser.user.id !== user.user.id,
    isAuthenticated: !!primaryUser,
    isLoading, isAuthLoading,
    login, setSession, logout, signup, fetchChildren, forgotPassword,
    refreshToken, authFetch, updateUserProfile, switchAccount, setTempAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import i18next from 'i18next';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';
const ACTIVE_USER_KEY = 'active_user';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [primaryUser, setPrimaryUser] = useState(null);
  const [childAccounts, setChildAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Refresh lock — prevents concurrent/cascading refresh calls
  const isRefreshing = useRef(false);

  // --- UTILITIES ---

  /**
   * Safely parse JSON and check content-type to handle 200 OK HTML responses
   */
  const safeParseJson = async (response) => {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const isRemoteUrl = (url) => /^https?:\/\//i.test(url);
  const isLocalUri = (url) => /^(file|content|data):\/\//i.test(url);

  const makeAbsolute = (avatarPath) => {
    if (!avatarPath) return avatarPath;
    if (isRemoteUrl(avatarPath) || isLocalUri(avatarPath)) return avatarPath;
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return avatarPath.startsWith('/') ? `${base}${avatarPath}` : `${base}/${avatarPath}`;
  };

  const normalizePrimaryUser = (obj) => {
    if (!obj) return obj;
    const copy = { ...obj };
    const userPart = copy.user || (copy.data && copy.data.user) || copy;
    if (userPart && userPart.avatar) {
      userPart.avatar = typeof userPart.avatar === 'string' && userPart.avatar.trim() !== ''
        ? makeAbsolute(userPart.avatar)
        : null;
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

  const isTokenExpired = (tokenValue) => {
    try {
      if (!tokenValue) return true;
      const decoded = jwtDecode(tokenValue);
      const now = Date.now() / 1000;
      return decoded.exp <= now + 300; // Expiring in 5 mins
    } catch (_e) {
      return true;
    }
  };

  const getBestPrimaryToken = async () => {
    const memToken = primaryUser?.token?.value;
    if (memToken && !isTokenExpired(memToken)) return memToken;

    try {
      const stored = await AsyncStorage.getItem('primary_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedToken = parsed?.token?.value || parsed?.data?.token?.value;
        if (storedToken && !isTokenExpired(storedToken)) return storedToken;
      }
    } catch (e) {
      console.warn('getBestPrimaryToken failed', e.message);
    }
    return null;
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem('primary_user');
    await AsyncStorage.removeItem('child_accounts');
    await AsyncStorage.removeItem(ACTIVE_USER_KEY);
    setUser(null);
    setPrimaryUser(null);
    setChildAccounts([]);
  };

  // --- SIMPLE REFRESH TOKEN ---

  const refreshToken = async () => {
    const tokenValue = user?.token?.value || user?.token;

    console.log('token here');
    
    
    if (!tokenValue) return null;
    if (!isTokenExpired(tokenValue)) return user;

    if (isRefreshing.current) return null;
    isRefreshing.current = true;

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValue}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
        
      const data = await safeParseJson(response);

      if (response.ok && data) {
        const refreshedData = data.data || data;
        const newUserState = normalizePrimaryUser({
          ...user,
          ...refreshedData,
          token: { value: refreshedData.token?.value || refreshedData.token }
        });
        
        setUser(newUserState);

        // If this is the primary user, update primary state and storage
        if (user?.user?.id === primaryUser?.user?.id) {
          setPrimaryUser(newUserState);
          await AsyncStorage.setItem('primary_user', JSON.stringify(newUserState));
        } else {
            // Update child in storage list
            const sc = await AsyncStorage.getItem('child_accounts');
            const parsed = sc ? JSON.parse(sc) : [];
            const updated = (parsed || []).map(child =>
              child.id === user.user.id ? { ...child, ...newUserState.user, token: newUserState.token } : child
            );
            await AsyncStorage.setItem('child_accounts', JSON.stringify(updated));
            setChildAccounts(updated.map(normalizeChild));
        }
        return newUserState;
      } else {
        if (response.status === 401) {
          console.error("Session expired during refresh. Logging out.");
          await logout();
        }
        return null;
      }
    } catch (error) {
      console.error("Refresh API Error:", error.message);
      return null;
    } finally {
      isRefreshing.current = false;
    }
  };

  // --- CORE AUTH FETCH ---

  const authFetch = async (url, options = {}, overrideToken = null, retryCount = 0) => {
    const MAX_RETRIES = 1;

    const getAuthToken = async () => {
      if (overrideToken) return overrideToken;
      const currentToken = user?.token?.value || user?.token;
      return currentToken || await getBestPrimaryToken();
    };

    const token = await getAuthToken();
    const defaultHeaders = {
      'Accept': 'application/json',
      'lang': i18next.language,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    // Only set Content-Type for non-FormData requests
    if (options.body && !(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const makeRequest = async (tokenOverride) => {
      const headers = { ...defaultHeaders, ...options.headers };
      if (tokenOverride) headers['Authorization'] = `Bearer ${tokenOverride}`;
      return fetch(url, { ...options, headers });
    };

    let response = await makeRequest();

    // Don't automatically refresh tokens during API calls
    // Let the user handle authentication issues manually

    return response;
  };

  // --- INITIAL LOAD ---

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('primary_user');
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        const normalizedUser = normalizePrimaryUser(parsedUser);
        setPrimaryUser(normalizedUser);
        setUser(normalizedUser);

        const storedChildren = await AsyncStorage.getItem('child_accounts');
        let normalizedChildren = [];
        if (storedChildren) {
          normalizedChildren = JSON.parse(storedChildren).map(normalizeChild);
          setChildAccounts(normalizedChildren);
        }

        const storedActive = await AsyncStorage.getItem(ACTIVE_USER_KEY);
        if (storedActive) {
          const matchedChild = normalizedChildren.find(c => c.id.toString() === storedActive.toString());
          if (matchedChild) {
            const childToken = matchedChild.token?.value || matchedChild.token;
            setUser({ user: matchedChild, token: { value: childToken || normalizedUser?.token?.value } });
          }
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    };
    init();
  }, []);

  // --- ACTIONS ---

  const fetchChildren = async (token, userId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}`, 'lang': i18next.language },
      });
      const data = await safeParseJson(response);
      if (response.ok && data) {
        const children = data.data || [];
        const normalized = children.map(normalizeChild);
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
      const data = await safeParseJson(response);
      if (!response.ok || !data) throw new Error(data?.message || "Login failed");

      const normalized = normalizePrimaryUser(data.data || data);
      await AsyncStorage.setItem('primary_user', JSON.stringify(normalized));
      setPrimaryUser(normalized);
      setUser(normalized);
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
      await fetchChildren(normalized.token.value, normalized.user.id);
    } finally { setIsAuthLoading(false); }
  };

  const logout = async () => { await clearSession(); };

  const signup = async (userData) => {
    setIsAuthLoading(true);
    try {
      const { parent_id, ...otherUserData } = userData;
      const formData = new FormData();
      Object.keys(otherUserData).forEach(k => { if (otherUserData[k] != null) formData.append(k, otherUserData[k]); });
      let url = `${API_URL}/api/v1/auth/users${parent_id ? `?user_id=${parent_id}` : ''}`;
      const headers = { "Accept": "application/json" };
      if (parent_id && user?.token?.value) headers['Authorization'] = `Bearer ${user.token.value}`;
      const response = await fetch(url, { method: 'POST', body: formData, headers });
      const data = await safeParseJson(response);
      if (!response.ok) throw new Error(data?.message || "Signup failed");
      if (parent_id) await fetchChildren(primaryUser.token.value, primaryUser.user.id);
      return data;
    } finally { setIsAuthLoading(false); }
  };

  const updateUserProfile = async (userId, formData) => {
    setIsAuthLoading(true);
    try {
      formData.append('_method', 'PUT');
      const response = await authFetch(`${API_URL}/api/v1/auth/users/${userId}`, { method: 'POST', body: formData });
      const data = await safeParseJson(response);
      if (!response.ok || !data) throw new Error(data?.message || "Update failed");
      
      let updated = data.data || data;
      if (updated.avatar) updated.avatar = makeAbsolute(updated.avatar);
      
      setUser(prev => ({ ...prev, user: { ...prev.user, ...updated } }));
      if (primaryUser?.user?.id === userId) {
        const newPrimary = { ...primaryUser, user: { ...primaryUser.user, ...updated } };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      } else {
        await updateChildAvatar(userId, updated.avatar);
      }
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; } finally { setIsAuthLoading(false); }
  };

  const deleteUserAvatar = async (userId) => {
    setIsAuthLoading(true);
    try {
      const response = await authFetch(`${API_URL}/api/v1/profile/avatar`, {
        method: 'DELETE',
      });
      
      const data = await safeParseJson(response);
      
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to delete avatar');
      }
      
      // Update user data to reflect avatar removal
      if (user?.user) {
        setUser(prev => ({
          ...prev,
          user: {
            ...prev.user,
            avatar: null
          }
        }));
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Delete avatar error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/v1/auth/me`);
      const data = await safeParseJson(response);
      if (!response.ok) return null;
      return data.data || data;
    } catch (e) { return null; }
  };

  const forgotPassword = async ({ email }) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/password/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'lang': i18next.language,
        },
        body: JSON.stringify({ email }),
      });
        console.log("response forget password ",response);
      const data = await safeParseJson(response);
      if (!response.ok || !data) {
        throw new Error(data?.message || 'Failed to send password reset email');
      }
      return data;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const verifyResetCode = async ({ email, code }) => {
  setIsAuthLoading(true);
  try {
    // Use JSON like the web, NOT FormData
    const response = await fetch(`${API_URL}/api/auth/password/verify-otp`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'lang': i18next.language,
      },
      body: JSON.stringify({
        email,
        otp: code, // Match web's field name
      }),
    });
    console.log("response verify code ",response);
    
    const data = await safeParseJson(response);
    console.log("data ",data);
    
    if (!response.ok || !data) {
      throw new Error(data?.message || 'Failed to verify reset code');
    }
    return data;
  } finally {
    setIsAuthLoading(false);
  }
};

const resetPassword = async ({ current_password, password, password_confirmation }) => {
  setIsAuthLoading(true);
  try {
    // Use JSON like the web - no email, token, or _method needed
    const response = await authFetch(`${API_URL}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password,
        password,
        password_confirmation,
      }),
    });
    
    const data = await safeParseJson(response);
    
    if (!response.ok || !data) {
      throw new Error(data?.message || 'Failed to change password');
    }
    return data;
  } finally {
    setIsAuthLoading(false);
  }
};
 const resetPasswordAfterCode = async ({ email, code, password, password_confirmation }) => {
  setIsAuthLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/api/auth/password/reset`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'lang': i18next.language,
      },
      body: JSON.stringify({
        email,
        otp: code,
        password,
        password_confirmation,
      }),
    });
    
    const data = await safeParseJson(response);
    
    if (!response.ok || !data) {
      throw new Error(data?.message || 'Failed to reset password');
    }
    
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  } finally {
    setIsAuthLoading(false);
  }
};

  const switchAccount = async (account) => {
    if (!account) {
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
      setUser(primaryUser);
      return;
    }
    const token = account.token?.value || account.token || primaryUser?.token?.value;
    await AsyncStorage.setItem(ACTIVE_USER_KEY, account.id.toString());
    
    try {
        const res = await authFetch(`${API_URL}/api/v1/auth/users/${account.id}`, {}, primaryUser?.token?.value);
        const data = await safeParseJson(res);
        if (res.ok && data) {
            const final = normalizeChild(data.data || data);
            setUser({ user: final, token: { value: token } });
            return;
        }
    } catch (e) {}
    
    setUser({ user: account, token: { value: token } });
  };

const setTempAvatar = async (userId, uri) => {
setUser(prev => prev?.user?.id === userId ? { ...prev, user: { ...prev.user, avatar: uri } } : prev);
await updateChildAvatar(userId, uri);
};

const value = {
user, primaryUser, children: childAccounts,
isImpersonating: primaryUser && user && primaryUser.user.id !== user.user.id,
isAuthenticated: !!primaryUser, isLoading, isAuthLoading,
login, logout, signup, refreshToken, authFetch, updateUserProfile, deleteUserAvatar, 
switchAccount, setTempAvatar, fetchCurrentUser, fetchChildren, forgotPassword, verifyResetCode, resetPassword, resetPasswordAfterCode,
setSession: async (data) => {
const norm = normalizePrimaryUser(data.data || data);
setPrimaryUser(norm); setUser(norm);
await AsyncStorage.setItem('primary_user', JSON.stringify(norm));
}
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
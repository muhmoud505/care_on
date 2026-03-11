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
  const refreshPromiseRef = useRef(null);

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

  /**
   * Checks if a JWT token is expired or expiring within the next 5 minutes.
   * Returns true if the token needs refreshing.
   */
  const isTokenExpired = (tokenValue) => {
    try {
      const decoded = jwtDecode(tokenValue);
      const now = Date.now() / 1000;
      return decoded.exp <= now + 300;
    } catch (_e) {
      // FIX 1: changed bare `catch` to `catch (_e)` — fixes SyntaxError in older Babel/Hermes
      // If we can't decode it, treat as expired so we attempt a refresh
      return true;
    }
  };

  /**
   * Gets the best available valid token for the primary user.
   * Falls back to AsyncStorage if in-memory token is expired/missing.
   */
  const getBestPrimaryToken = async () => {
    // 1. Try in-memory primary user token
    const memToken = primaryUser?.token?.value;
    if (memToken && !isTokenExpired(memToken)) return memToken;

    // 2. Fall back to AsyncStorage — covers the case where the refresh returned
    //    non-JSON (server hiccup) and we kept the old in-memory user, but a
    //    previous session stored a newer valid token on disk.
    try {
      const stored = await AsyncStorage.getItem('primary_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedToken = parsed?.token?.value || parsed?.data?.token?.value;
        if (storedToken) {
          if (!isTokenExpired(storedToken)) return storedToken;
          // If the stored token is expired, remove it to avoid retry loops.
          if (parsed.token) parsed.token.value = null;
          if (parsed.data?.token) parsed.data.token.value = null;
          await AsyncStorage.setItem('primary_user', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('getBestPrimaryToken: AsyncStorage read failed', e.message);
    }

    // 3. If nothing valid is found, return null.
    //    Returning an expired token causes repeated 401 loops.
    return null;
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem('primary_user');
    await AsyncStorage.removeItem('child_accounts');
    setUser(null);
    setPrimaryUser(null);
    setChildAccounts([]);
  };

  const authFetch = async (url, options = {}, overrideToken = null, retryCount = 0) => {
    const MAX_RETRIES = 1;

    const getAuthToken = async () => {
      if (overrideToken) return overrideToken;

      // Impersonating a child — use child's token
      if (user && primaryUser && user.user?.id !== primaryUser.user?.id && user.token?.value) {
        const childId = user.user.id;
        const refreshedChild = await refreshToken(childId);
        return refreshedChild?.token?.value || refreshedChild?.token || user.token.value;
      }

      if (!primaryUser && user?.token?.value) {
        return user.token.value;
      }

      // Primary user — try to get best available token, refresh if needed
      const session = await refreshToken();
      const refreshedToken = session?.token?.value;
      if (refreshedToken) return refreshedToken;

      // Refresh failed (non-JSON / server hiccup) — use best available stored token
      return await getBestPrimaryToken();
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

    const makeRequest = async () => {
      return fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      });
    };

    let response = await makeRequest();

    if (response.status === 401 && !overrideToken && retryCount < MAX_RETRIES) {
      console.log('Received 401, attempting token refresh and retry...');

      const userIdToRefresh = user?.user?.id !== primaryUser?.user?.id ? user.user.id : null;

      // Force-clear the refresh lock so we actually attempt a new refresh
      isRefreshing.current = false;
      refreshPromiseRef.current = null;

      const refreshed = await refreshToken(userIdToRefresh);
      const newToken = refreshed?.token?.value || refreshed?.token;

      if (newToken) {
        defaultHeaders['Authorization'] = `Bearer ${newToken}`;
        console.log('Retrying request with refreshed token...');
        response = await makeRequest();
      } else {
        // Refresh returned nothing useful (non-JSON hiccup) — try best stored token once
        const fallbackToken = await getBestPrimaryToken();
        if (fallbackToken && fallbackToken !== token) {
          defaultHeaders['Authorization'] = `Bearer ${fallbackToken}`;
          console.log('Retrying request with fallback stored token...');
          response = await makeRequest();
        }
      }
    }

    // FIX 3: Only clear session if we truly have no valid token left.
    // Previously any 401 after one retry would wipe the session aggressively.
    if (response.status === 401) {
      const lastResort = await getBestPrimaryToken();
      if (!lastResort) {
        console.warn('Unauthorized response after retry; clearing session.');
        await clearSession();
      }
    }

    return response;
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

        console.log('Auto-refreshing primary user token on startup...');
        await refreshToken();

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

        const storedActive = await AsyncStorage.getItem(ACTIVE_USER_KEY);
        if (storedActive) {
          const activeId = storedActive;
          const matchedChild = (normalizedChildren || []).find(c => c.id === activeId);
          if (matchedChild) {
            const childToken = matchedChild.token?.value || matchedChild.token;
            const childUser = { user: matchedChild, token: { value: childToken || normalizedUser?.token?.value } };
            setUser(childUser);

            if (childToken) {
              console.log('Auto-refreshing active child token on startup...');
              try {
                const response = await fetch(`${API_URL}/api/v1/auth/me`, {
                  headers: { 'Authorization': `Bearer ${childToken}`, 'lang': i18next.language },
                });

                const data = await response.json();
                if (response.ok) {
                  const meData = data.data || data;
                  const serverAvatar = meData.avatar ? makeAbsolute(meData.avatar) : null;
                  const childWithAvatar = childAccounts.find(c => c.id === matchedChild.id);
                  const finalUser = {
                    ...matchedChild,
                    ...meData,
                    avatar: serverAvatar || childWithAvatar?.avatar || matchedChild.avatar,
                    token: childToken,
                  };

                  setUser({ user: finalUser, token: { value: childToken } });

                  try {
                    const sc = await AsyncStorage.getItem('child_accounts');
                    const parsed = sc ? JSON.parse(sc) : [];
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
                console.warn('Failed to refresh /me after startup:', error.message);
              }
            }
          }
        }

        setUser({ user: normalizedUser.user, token: { value: normalizedUser.token?.value } });
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };

    const minimumDisplayTime = new Promise(resolve => setTimeout(resolve, 2000));
    Promise.all([loadUserFromStorage(), minimumDisplayTime]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const refreshToken = async (specificUserId = null) => {
    const targetUserId = specificUserId || primaryUser?.user?.id;
    const isRefreshingChild = specificUserId && primaryUser?.user?.id !== specificUserId;

    if (!targetUserId) return primaryUser;

    // Deduplicate concurrent primary refresh calls
    if (!isRefreshingChild) {
      if (isRefreshing.current) return refreshPromiseRef.current;
    }

    try {
      let currentUser, tokenValue;

      if (isRefreshingChild) {
        currentUser = childAccounts.find(child => child.id === specificUserId);
        tokenValue = currentUser?.token?.value || currentUser?.token;
        if (!tokenValue) {
          console.warn(`No token found for child ${specificUserId}`);
          return null;
        }
      } else {
        currentUser = primaryUser;
        tokenValue = primaryUser?.token?.value;
        if (!tokenValue) return primaryUser;
      }

      // Check if token actually needs refreshing
      if (!isTokenExpired(tokenValue)) return currentUser;

      console.log(`Refreshing token for ${isRefreshingChild ? 'child' : 'primary'} user ${targetUserId}`);

      if (!isRefreshingChild) {
        isRefreshing.current = true;
      }

      const doRefresh = async () => {
        const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenValue}`,
          },
        });

        // FIX 2: Don't trust the Content-Type header — some servers (e.g. Laravel behind
        // a proxy) return `text/html` or no content-type even when the body is valid JSON.
        // Instead, read as text and attempt JSON.parse ourselves.
        let data;
        try {
          const text = await response.text();
          data = JSON.parse(text);
        } catch (_e) {
          console.warn(`Token refresh returned non-JSON (status ${response.status}). Will try stored token.`);
          return null;
        }

        if (!response.ok) {
          if (response.status === 401) {
            console.error('Refresh token is invalid or expired. Logging out.');
            if (!isRefreshingChild) await logout();
          } else {
            console.error(`Token refresh failed (${response.status}):`, data?.message || 'Unknown error');
          }
          return null;
        }

        const refreshedUser = data.data || data;

        if (isRefreshingChild) {
          const updatedChildren = childAccounts.map(child =>
            child.id === specificUserId ? { ...child, ...refreshedUser } : child
          );
          await AsyncStorage.setItem('child_accounts', JSON.stringify(updatedChildren));
          setChildAccounts(updatedChildren);

          if (user?.user?.id === specificUserId) {
            setUser(prev => ({
              ...prev,
              user: { ...prev.user, ...refreshedUser },
              token: { value: refreshedUser.token?.value || refreshedUser.token },
            }));
          }

          return refreshedUser;
        } else {
          const newUserState = normalizePrimaryUser(refreshedUser);
          await AsyncStorage.setItem('primary_user', JSON.stringify(newUserState));
          setPrimaryUser(newUserState);
          return newUserState;
        }
      };

      if (!isRefreshingChild) {
        refreshPromiseRef.current = doRefresh().finally(() => {
          isRefreshing.current = false;
          refreshPromiseRef.current = null;
        });
        return refreshPromiseRef.current;
      }

      return await doRefresh();

    } catch (error) {
      console.error(`Token refresh error for ${isRefreshingChild ? 'child' : 'primary'} user ${targetUserId}:`, error.message);
      isRefreshing.current = false;
      refreshPromiseRef.current = null;
      // Do NOT logout on network/unexpected errors
      return isRefreshingChild ? null : primaryUser;
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

        const childrenWithFullData = await Promise.all(
          children.map(async (child) => {
            const normalized = normalizeChild(child);

            if (child.token) {
              try {
                const profileResponse = await fetch(`${API_URL}/api/v1/auth/users/${child.id}`, {
                  headers: { 'Authorization': `Bearer ${child.token}`, 'lang': i18next.language },
                });

                const contentType = profileResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const profileData = await profileResponse.json();
                  if (profileResponse.ok && profileData.data) {
                    return {
                      ...normalized,
                      ...profileData.data,
                      token: child.token,
                      name: profileData.data.name || normalized.name || child.name,
                    };
                  }
                } else {
                  console.warn(`Child ${child.id} profile response is not JSON, status: ${profileResponse.status}`);
                }
              } catch (error) {
                console.warn(`Failed to fetch full profile for child ${child.id} with child token:`, error.message);
              }

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
                      token: child.token,
                      name: profileData.data.name || normalized.name || child.name,
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
    await clearSession();
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

      if (parent_id) {
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

      const isChildUpdate =
        primaryUser?.user?.id &&
        user?.user?.id &&
        primaryUser.user.id !== user.user.id &&
        user.user.id === userId;

      const endpoint = `${API_URL}/api/v1/auth/users/${userId}`;
      const tokenForRequest = isChildUpdate ? (user.token?.value || null) : null;

      const response = await authFetch(endpoint, { method: 'POST', body: formData }, tokenForRequest);

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Update failed");

      let updatedUser = data?.data || data;

      if (Object.prototype.hasOwnProperty.call(updatedUser, 'avatar')) {
        updatedUser.avatar = updatedUser.avatar ? makeAbsolute(updatedUser.avatar) : null;
      }

      const existingAvatar = user?.user?.avatar;
      const finalAvatar = updatedUser.avatar ?? existingAvatar ?? null;

      setUser(prev => {
        const currentAvatar = prev?.user?.avatar;
        const finalAvatarLocal = updatedUser.avatar ?? currentAvatar ?? null;
        return { ...prev, user: { ...prev?.user, ...updatedUser, avatar: finalAvatarLocal } };
      });

      if (primaryUser?.user?.id !== userId) {
        await updateChildAvatar(userId, finalAvatar);
      }

      if (primaryUser?.user?.id === userId) {
        const latestStored = await AsyncStorage.getItem('primary_user');
        const latestParsed = latestStored ? JSON.parse(latestStored) : null;
        const latestAvatar = latestParsed?.user?.avatar || latestParsed?.data?.user?.avatar || null;
        const resolvedAvatar = updatedUser.avatar ?? latestAvatar ?? primaryUser?.user?.avatar ?? null;

        const mergedUser = { ...primaryUser.user, ...updatedUser, avatar: resolvedAvatar };
        const newPrimary = { ...primaryUser, user: mergedUser };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const deleteUserAvatar = async (userId) => {
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
      formData.append('avatar', '');
      formData.append('remove_avatar', '1');

      const result = await updateUserProfile(userId, formData);
      if (!result.success) throw new Error(result.error || 'Delete avatar failed');
      return { success: true };
    } catch (error) {
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

  const fetchUserProfile = async (userId) => {
    try {
      const isChildFetch =
        primaryUser?.user?.id &&
        user?.user?.id &&
        primaryUser.user.id !== user.user.id &&
        user.user.id === userId;

      const tokenValue = isChildFetch
        ? (user?.token?.value || primaryUser?.token?.value)
        : (primaryUser?.token?.value || user?.token?.value);

      if (!tokenValue) return null;

      const response = await authFetch(`${API_URL}/api/v1/auth/users/${userId}`, {}, isChildFetch ? tokenValue : null);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load user');
      return data.data || data;
    } catch (error) {
      console.warn('fetchUserProfile failed', error.message);
      return null;
    }
  };

  const setActiveAccount = async (account) => {
    if (!account) {
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
      if (primaryUser) setUser(primaryUser);
      return;
    }

    const tokenValue = account?.token?.value || account?.token || primaryUser?.token?.value;
    if (!tokenValue) return;

    const matchedChild = childAccounts.find(c => c.id === account.id);
    const childWithAvatar = matchedChild ? { ...matchedChild, ...account } : account;

    await AsyncStorage.setItem(ACTIVE_USER_KEY, `${account.id}`);

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
          const serverAvatar = meData.avatar ? makeAbsolute(meData.avatar) : null;
          const finalAvatar = isLocalUri(childWithAvatar.avatar)
            ? childWithAvatar.avatar
            : (serverAvatar || childWithAvatar.avatar);
          const finalUser = { ...childWithAvatar, ...meData, avatar: finalAvatar };

          setUser({ user: finalUser, token: { value: tokenValue } });

          try {
            const sc = await AsyncStorage.getItem('child_accounts');
            const parsed = sc ? JSON.parse(sc) : [];
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

    setUser({ user: childWithAvatar, token: { value: tokenValue } });
  };

  const switchAccount = (account) => setActiveAccount(account);

  const setTempAvatar = async (userId, uri) => {
    setUser(prev =>
      prev?.user?.id === userId ? { ...prev, user: { ...prev.user, avatar: uri } } : prev
    );

    await updateChildAvatar(userId, uri);

    try {
      if (primaryUser?.user?.id === userId) {
        const mergedUser = { ...primaryUser.user, avatar: uri };
        const newPrimary = { ...primaryUser, user: mergedUser };
        setPrimaryUser(newPrimary);
        await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary));
      } else {
        const sc = await AsyncStorage.getItem('child_accounts');
        const parsed = sc ? JSON.parse(sc) : [];
        const updated = (parsed || []).map(child =>
          child.id === userId ? { ...child, avatar: uri } : child
        );
        await AsyncStorage.setItem('child_accounts', JSON.stringify(updated));
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
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

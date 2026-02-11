import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import i18next from 'i18next';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // The *active* user (can be primary or child)
  const [primaryUser, setPrimaryUser] = useState(null); // The *logged in* parent user
  const [childAccounts, setChildAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Helper: convert relative avatar paths to absolute URLs using API_URL
  const makeAbsolute = (avatarPath) => {
    if (!avatarPath) return avatarPath;
    if (/^https?:\/\//.test(avatarPath)) return avatarPath;
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return avatarPath.startsWith('/') ? `${base}${avatarPath}` : `${base}/${avatarPath}`;
  };

  // Normalize a primary user object of shape { user: {...}, token: {...} }
  const normalizePrimaryUser = (obj) => {
    if (!obj) return obj;
    const copy = { ...obj };
    if (copy.user && copy.user.avatar) {
      copy.user = { ...copy.user, avatar: makeAbsolute(copy.user.avatar) };
    }
    return copy;
  };

  // Normalize a child user object that may have avatar at root
  const normalizeChild = (child) => {
    if (!child) return child;
    if (child.avatar) {
      return { ...child, avatar: makeAbsolute(child.avatar) };
    }
    return child;
  }; 
  
  useEffect(() => {
    // Log the API_URL on startup for easy debugging.
    console.log(`[AuthContext] API_URL is set to: ${API_URL}`);

    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('primary_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // The user object might be nested under a 'data' key.
          // We set the user state to the nested object to maintain a consistent structure.
          const userObject = parsedUser.data || parsedUser;
          const normalizedUser = normalizePrimaryUser(userObject);
          
          setPrimaryUser(normalizedUser); // This is the real user
          setUser(normalizedUser); // Initially, active user is the primary user
          console.log('[AuthContext] Loaded primary avatar:', normalizedUser.user?.avatar);
          
          // Also load any stored children
          const storedChildren = await AsyncStorage.getItem('child_accounts');
          if (storedChildren) {
            try {
              const parsedChildren = JSON.parse(storedChildren);
              const normalizedChildrenFromStorage = parsedChildren.map(normalizeChild);
              setChildAccounts(normalizedChildrenFromStorage);
              console.log('[AuthContext] Loaded stored children avatars:', normalizedChildrenFromStorage.map(c => c.avatar));
            } catch (e) {
              setChildAccounts([]);
            }
          }
          // Always fetch children using the consistent user object structure.
          fetchChildren(normalizedUser.token.value, normalizedUser.user.id);
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
      }
    };

    // This promise ensures the splash screen is shown for at least 2 seconds.
    const minimumDisplayTime = new Promise(resolve => setTimeout(resolve, 2000));

    // Wait for both the user data to be loaded and the minimum time to pass.
    Promise.all([loadUserFromStorage(), minimumDisplayTime]).finally(() => {
      setIsLoading(false);
    });
  }, []); // The fetchChildren dependency is managed inside the effect

  const refreshToken = async () => {
    // Always refresh based on the primary user session.
    if (!primaryUser?.token?.value) {
      return primaryUser; // Nothing to refresh
    }

    try {
      let decodedToken;
      try {
        decodedToken = jwtDecode(primaryUser.token.value);
      } catch (e) {
        console.error('Failed to decode token:', e);
        // If token is invalid, treat it as expired and log out.
        await logout();
        return null;
      }
      const now = Date.now() / 1000;
      const buffer = 300; // Refresh if token expires in the next 5 minutes (300 seconds)

      // If the token is not close to expiring, no need to refresh.
      if (decodedToken.exp > now + buffer) {
        return primaryUser;
      }

      console.log('Token is expiring soon, attempting to refresh...');
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${primaryUser.token.value}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to refresh token.');
      }

      // Assuming the refresh endpoint returns a new user object with a new token
      const newUserState = normalizePrimaryUser(responseData.data);
      await AsyncStorage.setItem('primary_user', JSON.stringify(newUserState));
      setPrimaryUser(newUserState);
      // If we are currently impersonating, keep the active user as-is; otherwise sync it.
      setUser(prev => (prev && prev.user && primaryUser && prev.user.id !== primaryUser.user.id ? prev : newUserState));
      console.log('Token refreshed successfully.');
      return newUserState;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, log the user out as the session is likely invalid.
      await logout();
      throw error; // Re-throw the error to be caught by the calling function
    }
  };

  const fetchChildren = async (token, userId) => {
    // The token is now passed directly. We can still use refreshToken to ensure it's not expired, but the primary check is if a token was passed.
    if (!token || !userId) {
    
      
      console.log("No token or userId provided, cannot fetch children.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'lang': i18next.language
        },
      });
      
      
  
      
      // Read the response body as text first to avoid JSON parsing errors on non-JSON responses.
      const responseText = await response.text();
      console.log('Response from /api/v1/auth/users:', responseText);
      let data;
      
      try {
        data = JSON.parse(responseText);
        console.log(data);
        
      } catch (e) {
        // The response was not valid JSON. We'll check response.ok and use the raw text in the error if needed.
        // If the response is not ok, the responseText itself is likely the error message.
        if (!response.ok) {
          throw new Error(responseText || 'Failed to fetch children');
        }
      }

      if (!response.ok) {
        // Use the parsed message if available, otherwise use the raw text or a generic error.
        const errorMessage = data?.message || responseText || 'Failed to fetch children';
        throw new Error(errorMessage);
      }
      
      // If data parsing failed but the response was 'ok', data might be undefined.
      const fetchedChildren = data?.data || []; // This is the list of children from the API

      // Normalize avatars and update state and storage with the fetched children
      const normalizedChildren = fetchedChildren.map(normalizeChild);
      setChildAccounts(normalizedChildren);
      console.log('[AuthContext] Fetched children avatars:', normalizedChildren.map(c => c.avatar));
      await AsyncStorage.setItem('child_accounts', JSON.stringify(normalizedChildren));
      
    } catch (error) {
      console.error("Failed to fetch children:", error);
      // Don't throw, as this might not be a critical failure
    }
  };

  const login = async (userData) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'lang': i18next.language
        },
      });
      console.log('hello from login');
      

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // JSON parsing failed
      }

      if (!response.ok) {
        const errorMessage = data?.message || `Server error: ${response.status}`;
        console.error("Login failed with non-OK response:", responseText);
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('Received an invalid or empty response from the server.');
      }

      // Store only the 'data' object as the primary user to maintain a consistent object structure.
      const normalized = normalizePrimaryUser(data.data);
      await AsyncStorage.setItem('primary_user', JSON.stringify(normalized));
      setPrimaryUser(normalized);
      setUser(normalized);
      console.log('[AuthContext] User logged in avatar:', normalized.user?.avatar);
      // After successful login, fetch the children associated with this user
      await fetchChildren(normalized.token.value, normalized.user.id);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // This function is for setting the session after a signup, not a form-based login
  const setSession = async (sessionData) => {
    // Normalize the session data. The signup response nests the user object under a 'data' key.
    // We want to store the nested object to be consistent with the login flow.
    const userObject = sessionData.data || sessionData;

    if (!userObject || !userObject.user || !userObject.token) {
      throw new Error("Invalid session data provided to setSession.");
    }
    // Store as the primary user
    const normalized = normalizePrimaryUser(userObject);
    await AsyncStorage.setItem('primary_user', JSON.stringify(normalized));
    setPrimaryUser(normalized);
    setUser(normalized);
    console.log('[AuthContext] Session set primary avatar:', normalized.user?.avatar);
    // After setting the new user, fetch their children (which should be an empty list)
    await fetchChildren(normalized.token.value, normalized.user.id);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('primary_user');
      await AsyncStorage.removeItem('child_accounts');
      setUser(null);
      setPrimaryUser(null);
      setChildAccounts([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const signup = async (userData) => {
    // userData is now a plain JavaScript object
    setIsAuthLoading(true);
    console.log(userData);
    
    try {
      // Separate the 'id' (birth certificate image) from the rest of the user data.
      const { id: birthCertificateImage, parent_id, ...otherUserData } = userData;
      
      // Create a FormData object to handle the image upload along with other data.
      const formData = new FormData();

      // Append all other key-value pairs to the formData object.
      // This ensures all fields, including the optional 'parent_id', are included.
      for (const key in otherUserData) {
        if (otherUserData[key] !== undefined && otherUserData[key] !== null) {
          formData.append(key, otherUserData[key]);
        }
      }

      // Construct the URL with 'id' and 'parent_id' (if it exists) as query parameters.
      let url = `${API_URL}/api/v1/auth/users`;
      if (parent_id) {
        url += `?user_id=${parent_id}`;
      }

      const headers = {
        // 'Content-Type': 'multipart/form-data' is set automatically by fetch for FormData.
        "accept": "application/json"
      };

      // If creating a child account, add the parent's auth token to the header.
      if (parent_id && user?.token?.value) {
        headers['Authorization'] = `Bearer ${user.token.value}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData, // Send the FormData object.
        headers: headers,
      });

      // Read the response body as text ONCE.
      const responseText = await response.text();
      
      let data;
      
      try {
        // Try to parse the text as JSON.
        data = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, 'data' will be undefined.
        // This is fine if we don't expect a JSON body on error.
      }

      if (!response.ok) {
        // Use the parsed data if available, otherwise throw a generic error.
        const errorMessage = data?.message || `Server error: ${response.status}`;
        console.error("Signup failed with non-OK response:", responseText);
        throw new Error(errorMessage);
      }

      if (!data) {
        // This handles cases where the response is OK but the body is not valid JSON.
        throw new Error('Received an invalid or empty response from the server.');
      }

      // Always return the response data so the calling component can use it (e.g., to get the child's token).
      return data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error; // Re-throw to be handled by the UI component
    } finally {
      setIsAuthLoading(false);
    }
  };

  const forgotPassword = async (payload) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/password/email`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
        console.log(data);
        
      } catch (e) { /* Ignore if not JSON */ }

      if (!response.ok) {
        const errorMessage = data?.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // No need to set user, just resolve successfully
      return data;
    } catch (error) {
      console.error("Forgot Password failed:", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const authFetch = async (url, options = {}) => {
    // 1. Ensure the token is fresh before making the request.
    // refreshToken will handle checking expiry and refreshing if needed.
    // If refresh fails, it will throw an error and log the user out.
    const currentUser = await refreshToken();
    const token = currentUser?.token?.value;

    if (!token) {
      throw new Error('Authentication token is not available.');
    }

    // 2. Prepare the headers. Check if the body is FormData.
    const isFormData = options.body instanceof FormData;

    const defaultHeaders = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'lang': i18next.language,
    };

    // Only set Content-Type if it's not FormData
    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Merge custom headers from options, allowing them to override defaults
    const finalOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // 3. Make the actual fetch call
    // We use the full URL passed in, assuming it's correctly constructed with BASE_URL
    return fetch(url, finalOptions);
  };

  const updateUserProfile = async (userId, formData) => {
    setIsAuthLoading(true);
    try {
      // Append _method=PUT to simulate PUT request with FormData
      formData.append('_method', 'PUT');

      const response = await authFetch(`${API_URL}/api/v1/auth/users/${userId}`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log('[AuthContext] updateUserProfile responseText:', responseText);
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Ignore JSON parse error
      }

      if (!response.ok) {
        const errorMessage = data?.message || responseText || 'Failed to update profile';
        throw new Error(errorMessage);
      }

      // Try to extract updated user data from a few common shapes
      let updatedUserData = data?.data || data;
      if (updatedUserData?.user) {
        // Some APIs nest the user under `data.user`
        updatedUserData = updatedUserData.user;
      }

      // If the response didn't include the updated user, refetch it explicitly
      if (!updatedUserData || Object.keys(updatedUserData).length === 0) {
        try {
          const fetchResp = await authFetch(`${API_URL}/api/v1/auth/users/${userId}`, { method: 'GET' });
          const fetchText = await fetchResp.text();
          console.log('[AuthContext] Refetch after update response:', fetchText);
          let fetchData;
          try {
            fetchData = JSON.parse(fetchText);
          } catch (e) {}
          const fetchedUser = fetchData?.data || fetchData?.user || fetchData;
          if (fetchedUser) {
            updatedUserData = fetchedUser;
          }
        } catch (e) {
          console.warn('[AuthContext] Failed to refetch user after update:', e.message);
        }
      }

      if (updatedUserData) {
        // If the avatar is a relative path, make it absolute
        if (updatedUserData.avatar) {
          updatedUserData = { ...updatedUserData, avatar: makeAbsolute(updatedUserData.avatar) };
        }
        console.log('[AuthContext] Updated user avatar (server):', updatedUserData.avatar);

        // Update the current user state
        setUser(prev => ({
          ...prev,
          user: { ...prev.user, ...updatedUserData }
        }));

        // Update primaryUser if the updated user is the primary user
        if (primaryUser?.user?.id === userId) {
          const newPrimaryUser = {
            ...primaryUser,
            user: { ...primaryUser.user, ...updatedUserData }
          };
          setPrimaryUser(newPrimaryUser);
          await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimaryUser));
        } else {
          // If it's a child account, update the childAccounts list
          const updatedChildren = childAccounts.map(child => 
            child.id === userId ? { ...child, ...updatedUserData } : child
          );
          setChildAccounts(updatedChildren);
          await AsyncStorage.setItem('child_accounts', JSON.stringify(updatedChildren));
        }
      }

      return data;
    } catch (error) {
      console.error("Update profile failed:", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const switchAccount = (accountToSwitchTo) => {
    // If no account is provided, switch back to the primary user.
    if (!accountToSwitchTo) {
      if (primaryUser) {
        setUser(primaryUser);
        console.log("Switched back to primary user:", primaryUser.user.name);
      }
      return;
    }

    // Switching to a child account.
    // CRITICAL ASSUMPTION: The child object (`accountToSwitchTo`) must have a `token` property.
    const childToken = accountToSwitchTo.token?.value || accountToSwitchTo.token;
    if (!childToken) {
      console.error("Cannot switch to child account: token is missing.", accountToSwitchTo);
      return;
    }

    // The structure of the 'user' state object is { user: {...}, token: {...} }.
    // We construct this object for the child.
    const childSession = {
      user: accountToSwitchTo,
      token: {
        value: childToken,
      },
    };

    // Set the active user state to the new child session.
    setUser(childSession);
    console.log("Switched to child account:", childSession.user.name);
  };

  // Allow components to set a temporary avatar while upload is in progress
  const setTempAvatar = async (userId, uri) => {
    setUser(prev => {
      if (!prev || !prev.user) return prev;
      if (prev.user.id === userId) {
        return { ...prev, user: { ...prev.user, avatar: uri } };
      }
      return prev;
    });

    if (primaryUser?.user?.id === userId) {
      const newPrimary = { ...primaryUser, user: { ...primaryUser.user, avatar: uri } };
      setPrimaryUser(newPrimary);
      try { await AsyncStorage.setItem('primary_user', JSON.stringify(newPrimary)); } catch (e) { console.warn('Failed to persist primary_user after temp avatar', e.message); }
    }

    const updatedChildren = childAccounts.map(c => (c.id === userId ? { ...c, avatar: uri } : c));
    setChildAccounts(updatedChildren);
    try { await AsyncStorage.setItem('child_accounts', JSON.stringify(updatedChildren)); } catch (e) { console.warn('Failed to persist child_accounts after temp avatar', e.message); }
  };

  // The value provided to consuming components
  const value = {
    user,
    primaryUser,
    children: childAccounts,
    // Helper boolean to easily check if we are impersonating a child account
    isImpersonating: primaryUser && user && primaryUser.user.id !== user.user.id,
    isAuthenticated: !!primaryUser, // Authentication status depends on the primary user
    isLoading,
    isAuthLoading,
    login,
    setSession,
    logout,
    signup,
    fetchChildren,
    forgotPassword,
    refreshToken, // Expose the refresh token function
    authFetch, // Expose the new authenticated fetch wrapper
    updateUserProfile,
    switchAccount,
    setTempAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create the useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/*
Data Structure Notes:

In AsyncStorage, we will now have:

1. 'primary_user': {
     "token": "primary_user_token",
     "user": { "id": 1, "name": "Parent Name", ... }
   }

2. 'child_accounts': [
     { "id": 10, "name": "Child One", "token": "child_one_token" },
     { "id": 11, "name": "Child Two", "token": "child_two_token" }
   ]
   (Note: The token is added during the child creation process in PasswordScreen)
*/
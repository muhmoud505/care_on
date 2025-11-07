import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [childAccounts, setChildAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('primary_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // The user object might be nested under a 'data' key.
          // We set the user state to the nested object to maintain a consistent structure.
          const userObject = parsedUser.data || parsedUser;
          
          setUser(userObject);
          ;
          
          // Also load any stored children
          const storedChildren = await AsyncStorage.getItem('child_accounts');
          if (storedChildren) {
            setChildAccounts(JSON.parse(storedChildren));
          }
          // Always fetch children using the consistent user object structure.
          fetchChildren(userObject);
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
    if (!user?.token?.value) {
      console.log('No user or token available to refresh.');
      return user; // Return current user state
    }

    try {
      let decodedToken;
      try {
        decodedToken = jwtDecode(user.token.value);
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
        return user;
      }

      console.log('Token is expiring soon, attempting to refresh...');
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${user.token.value}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to refresh token.');
      }

      // Assuming the refresh endpoint returns a new user object with a new token
      const newUserState = responseData.data;
      await AsyncStorage.setItem('primary_user', JSON.stringify(newUserState));
      setUser(newUserState);
      console.log('Token refreshed successfully.');
      return newUserState;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, log the user out as the session is likely invalid.
      await logout();
      throw error; // Re-throw the error to be caught by the calling function
    }
  };

  const fetchChildren = async (token) => {
    const currentUser = await refreshToken();
    const ut = currentUser?.token?.value;
    
    if (!ut) {
    
      
      console.log("No token provided, cannot fetch children.");
      return;
    }
    try {
      console.log(ut+' from try catch');
      
      const response = await fetch(`${API_URL}/api/v1/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${ut}`,
          'lang':'en'
        },
      });
      
      

      // Read the response body as text first to avoid JSON parsing errors on non-JSON responses.
      const responseText = await response.text();
      console.log('Response from /api/v1/auth/users:', responseText);
      let data;
      
      try {
        data = JSON.parse(responseText);
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
      const fetchedChildren = data?.data || [];

      // We need to store children with their tokens. The GET /users endpoint might not return tokens.
      // For now, we'll just store the user info. The logic in PasswordScreen handles new children with tokens.
      // A more robust solution might need to merge this list with the one in AsyncStorage that has tokens.
      setChildAccounts(fetchedChildren);
      
      await AsyncStorage.setItem('child_accounts', JSON.stringify(fetchedChildren));
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
          'lang':'en'
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
      await AsyncStorage.setItem('primary_user', JSON.stringify(data.data));
      setUser(data.data);
      // After successful login, fetch the children associated with this user
      await fetchChildren(data.data);
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
    await AsyncStorage.setItem('primary_user', JSON.stringify(userObject));
    setUser(userObject);
    // After setting the new user, fetch their children (which should be an empty list)
    await fetchChildren(sessionData);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('primary_user');
      await AsyncStorage.removeItem('child_accounts');
      setUser(null);
      setChildAccounts([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const signup = async (userData) => {
    // userData is now a plain JavaScript object
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/users`, {
        method: 'POST',
        body: JSON.stringify(userData), // Convert the object to a JSON string
        headers: {
          'Content-Type': 'application/json',
          "accept": "application/json"
        },
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
      const response = await fetch(`${API_URL}/api/auth/password/email`, {
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

  // The value provided to consuming components
  const value = {
    user,
    children: childAccounts,
    isAuthenticated: !!user, // Derived state
    isLoading,
    isAuthLoading,
    login,
    setSession,
    logout,
    signup,
    fetchChildren,
    forgotPassword,
    refreshToken, // Expose the refresh token function
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
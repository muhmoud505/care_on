import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
          setUser(parsedUser);
          // Also load any stored children
          const storedChildren = await AsyncStorage.getItem('child_accounts');
          if (storedChildren) {
            setChildAccounts(JSON.parse(storedChildren));
          }
          // Securely trigger a background refresh of children only if a token exists.
          if (parsedUser?.data?.token?.value) {
            console.log(parsedUser?.data?.token?.value);
            
            fetchChildren(parsedUser);
          }
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

  const fetchChildren = async (token) => {
    console.log('here iam');
    
    if (!token) {
    console.log('here iam2');
      
      console.log("No token provided, cannot fetch children.");
      return;
    }
    try {
      console.log('here iam 3');
      
      const response = await fetch(`${API_URL}/api/v1/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'lang':'en'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch children');
      }

      const data = await response.json();
      
      
      // Assuming the API returns an array of child user objects in `data.data`
      const fetchedChildren = data.data || [];

      // We need to store children with their tokens. The GET /users endpoint might not return tokens.
      // For now, we'll just store the user info. The logic in PasswordScreen handles new children with tokens.
      // A more robust solution might need to merge this list with the one in AsyncStorage that has tokens.
      setChildAccounts(fetchedChildren);
      console.log(fetchedChildren);
      
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

      // Store as the primary user
      await AsyncStorage.setItem('primary_user', JSON.stringify(data));
      setUser(data);
      // After successful login, fetch the children associated with this user
      await fetchChildren(data.token);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // This function is for setting the session after a signup, not a form-based login
  const setSession = async (sessionData) => {
    // sessionData should be { user: object, token: string }
    if (!sessionData || !sessionData.user || !sessionData.token) {
      throw new Error("Invalid session data provided to setSession.");
    }
    // Store as the primary user
    await AsyncStorage.setItem('primary_user', JSON.stringify(sessionData));
    setUser(sessionData);
    // After setting the new user, fetch their children (which should be an empty list)
    await fetchChildren(sessionData.token);
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
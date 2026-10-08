import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await authApi.getCurrentUser();
      setUser(data);
      setIsAuthenticated(true);
      setRole(data.role);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    setRole(data.user.role);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    setIsAuthenticated(true);
    setRole(data.user.role);
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    setRole(null);
  };

  const updateProfile = async (profileData) => {
    const data = await authApi.updateProfile(profileData);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        loading,
        login,
        register,
        logout,
        updateProfile,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

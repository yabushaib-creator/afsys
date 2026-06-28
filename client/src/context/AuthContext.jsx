import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('afsys_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    // Store token separately; store user profile without sensitive fields
    if (userData.token) {
      localStorage.setItem('afsys_token', userData.token);
    }
    const { token, ...profile } = userData;
    localStorage.setItem('afsys_user', JSON.stringify(profile));
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('afsys_user');
    localStorage.removeItem('afsys_token');
    setUser(null);
  }, []);

  const isAdmin = user?.user_admin_allow === 'Y';
  const canEdit = isAdmin;
  const allowedScreens = isAdmin
    ? null
    : (user?.user_allowed_screens || '').split(',').filter(Boolean);

  return (
    <AuthContext.Provider value={{ user, login, logout, canEdit, isAdmin, allowedScreens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

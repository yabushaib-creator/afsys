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
    localStorage.setItem('afsys_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('afsys_user');
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

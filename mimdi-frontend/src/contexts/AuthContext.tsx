'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Tipe data untuk paket
type Package = {
  id: string;
  name: string;
};

// Tipe data untuk pengguna
interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'ADMIN' | 'PARTNER';
  activePackage: Package | null;
  invitationQuota: number;
}

// Tipe data untuk context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const fetchUser = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Gagal mengambil data user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);


  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchUser(token);
    }
  }, [token, fetchUser]);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const refreshUser = useCallback(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token, fetchUser]);

  // --- PERUBAHAN: Implementasi "Refetch on Window Focus" ---
  useEffect(() => {
    const handleFocus = () => {
      console.log('Tab focused, refreshing user data...');
      refreshUser();
    };

    // Tambahkan event listener saat komponen dimuat
    window.addEventListener('focus', handleFocus);

    // Hapus event listener saat komponen dibongkar untuk mencegah memory leak
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshUser]); // Jalankan efek ini setiap kali fungsi refreshUser berubah


  useEffect(() => {
    if (isLoading) {
      return;
    }

    const authPages = ['/login', '/register', '/partners/register'];
    const isAuthPage = authPages.includes(pathname);

    if (user && isAuthPage) {
      console.log(`Redirecting logged-in user from auth page (${pathname}) to dashboard...`);
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin/users');
          break;
        case 'PARTNER':
          router.push('/partner/dashboard');
          break;
        case 'CLIENT':
          router.push('/user/dashboard');
          break;
        default:
          router.push('/login');
      }
    }

  }, [user, isLoading, router, pathname]);


  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


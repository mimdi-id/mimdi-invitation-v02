'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
      const fetchUser = async () => {
        try {
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Jika token tidak valid, logout
            logout();
          }
        } catch (error) {
          console.error('Gagal mengambil data user:', error);
          logout();
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // --- LOGIKA REDIRECT YANG LEBIH KUAT ---
  useEffect(() => {
    // Jika masih dalam proses loading, jangan lakukan apa-apa
    if (isLoading) {
      return;
    }

    const authPages = ['/login', '/register', '/partners/register'];
    const isAuthPage = authPages.includes(pathname);

    // Jika pengguna sudah login DAN mereka berada di halaman otentikasi...
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

  }, [user, isLoading, router, pathname]); // <-- Tambahkan isLoading sebagai dependensi


  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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


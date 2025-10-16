'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// --- UBAH TIPE DATA INI ---
// Tipe data untuk paket
type Package = {
  id: string;
  name: string;
};

// Tipe data untuk pengguna, sekarang menyertakan peran (role)
interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'ADMIN' | 'PARTNER'; // <-- Tambahkan ini
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
            logout();
          }
        } catch (error) {
          console.error('Gagal mengambil data user', error);
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

  // useEffect untuk menangani redirect setelah login berhasil
  useEffect(() => {
    if (token && user) {
      // Jika user adalah admin, arahkan ke dashboard admin
      if (user.role === 'ADMIN') {
        router.push('/admin/users');
      } else {
        // Jika bukan, arahkan ke dashboard klien
        router.push('/user/dashboard');
      }
    }
  }, [token, user, router]);


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


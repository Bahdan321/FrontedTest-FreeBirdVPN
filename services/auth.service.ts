import { jwtDecode } from 'jwt-decode';
import { setCookie, getCookie, removeCookie } from '@/utils/cookies';

export interface User {
  id: string;
  name: string;
  email: string;
  google_id: string;
  telegram_id: string;
}

interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role?: string;
  exp: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        // body: JSON.stringify({ email, password }),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Неверный email или пароль');
      }
      console.log("Response: ", response);

      const data: AuthResponse = await response.json();
      // console.log("Data user: ", data.user);
      this.setTokens(data.access_token, data.refresh_token);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<User> {
    try {
      const formData = new FormData();
      formData.append("username", "");
      formData.append("email", email);
      formData.append("password", password);
      formData.append("avatar_url", "123");
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username: "", avatar_url: "123" }),
        // body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при регистрации');
      }

      const data: AuthResponse = await response.json();
      this.setTokens(data.access_token, data.refresh_token);
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
    removeCookie('token');
    removeCookie('refreshToken');

    // If using localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();

      if (!token) {
        return null;
      }

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.logout();
          return null;
        }
      }

      // Decode token to get user info
      const decoded = jwtDecode<JwtPayload>(token);

      return {
        name: decoded.sub,
        email: decoded.email,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_URL}/jwt/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        // body: JSON.stringify({ token: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  }

  getAuthHeader(): Record<string, string> | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private setTokens(token: string, refreshToken: string): void {
    setCookie('token', token);
    setCookie('refreshToken', refreshToken);

    // Use localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private getToken(): string | null {
    const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    return token || null;
  }

  private getRefreshToken(): string | null {
    const refreshToken = getCookie('refreshToken') || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
    return refreshToken || null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;

      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

const authService = new AuthService();
export default authService;
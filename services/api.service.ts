import authService from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1929';

class ApiService {
  async get<T>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>('GET', endpoint, null, requireAuth);
  }

  async post<T>(endpoint: string, data: any, requireAuth = true): Promise<T> {
    return this.request<T>('POST', endpoint, data, requireAuth);
  }

  async put<T>(endpoint: string, data: any, requireAuth = true): Promise<T> {
    return this.request<T>('PUT', endpoint, data, requireAuth);
  }

  async delete<T>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>('DELETE', endpoint, null, requireAuth);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data: any = null,
    requireAuth = true
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const authHeader = authService.getAuthHeader() as Record<string, string>;
      Object.assign(headers, authHeader);
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await fetch(url, config);

      // Handle unauthorized errors (token expired)
      if (response.status === 401 && requireAuth) {
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          const newAuthHeader = authService.getAuthHeader() as Record<string, string>;
          headers.Authorization = newAuthHeader.Authorization;
          const retryConfig = {
            ...config,
            headers,
          };
          const retryResponse = await fetch(url, retryConfig);
          return this.handleResponse<T>(retryResponse);
        } else {
          // If refresh failed, redirect to login
          authService.logout();
          window.location.href = '/auth?tab=login';
          throw new Error('Session expired. Please login again.');
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const error = data.message || response.statusText;
      throw new Error(error);
    }

    return data as T;
  }
}

export const apiService = new ApiService();
export default apiService;
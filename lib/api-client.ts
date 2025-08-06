import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from "@/hooks/use-toast";

// Extend the InternalAxiosRequestConfig interface to include _retry
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: AxiosRequestConfig;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      timeout: 15000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const csrf = this.getCSRFToken();
        if (csrf) {
          config.headers['X-CSRF-TOKEN'] = csrf;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<any>) => {
        const originalRequest = error.config;

        // Handle token expired (401)
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.onRefreshed(newToken);

            // Update the original request with new token
            const newRequest: AxiosRequestConfig = {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                'X-CSRF-TOKEN': newToken
              }
            };

            return this.client(newRequest);
          } catch (refreshError) {
            // Redirect to login on refresh failure
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other error types
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }
  

  private handleError(error: any) {
    // Handle validation errors (400)
    if (error.response?.status === 400) {
      const validationErrors = error.response.data?.message || {};
      const errorMessages = Object.values(validationErrors).flat();

      toast({
        title: 'Validation Error',
        description: errorMessages.join(', ') || 'Please check your input',
        variant: 'destructive',
      });
    }

    // Handle network errors
    if (!error.response) {
      toast({
        title: 'Network Error',
        description: 'Unable to connect to server. Please check your connection.',
        variant: 'destructive',
      });
    }

    // Handle server errors (500+)
    if (error.response?.status >= 500) {
      toast({
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        variant: 'destructive',
      });
    }
  }

  private async refreshToken(): Promise<string> {
    try {
      await this.client.post('/auth/refresh', {}, {
        headers: {
          'X-CSRF-TOKEN': this.getCSRFRefreshToken() || '',
        },
        withCredentials: true,
      });

      const newToken = this.getCSRFToken() || '';
      if (!newToken) {
        throw new Error('Failed to get new CSRF token');
      }

      return newToken;
    } catch (error) {
      throw error;
    }
  }

  private onRefreshed(newToken: string) {
    this.failedQueue.forEach(pending => {
      const newConfig = {
        ...pending.config,
        headers: {
          ...pending.config.headers,
          'X-CSRF-TOKEN': newToken
        }
      };
      this.client(newConfig).then(pending.resolve).catch(pending.reject);
    });
    this.failedQueue = [];
  }

  private getCSRFToken(): string | null {
    return this.getCookie('csrf_access_token');
  }

  private getCSRFRefreshToken(): string | null {
    return this.getCookie('csrf_refresh_token');
  }

  private getCookie(name: string): string | null {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1] || null;
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new APIClient();
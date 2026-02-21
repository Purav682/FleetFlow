import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'manager' | 'dispatcher';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'dispatcher';
  token?: string;
}

// Auth API calls
export const authApi = {
  // Login
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    const { data } = response.data;
    
    // Store token and user in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  // Register
  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    const { data } = response.data;
    
    // Store token and user in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Update profile
  updateProfile: async (updates: Partial<User>) => {
    const response = await api.put('/auth/profile', updates);
    return response.data.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get stored user
  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};

// Vehicle API calls
export const vehicleApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/vehicles', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data.data;
  },

  create: async (data: any) => {
    const response = await api.post('/vehicles', data);
    return response.data.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/vehicles/stats');
    return response.data.data;
  },
};

// Driver API calls
export const driverApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/drivers', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data.data;
  },

  create: async (data: any) => {
    const response = await api.post('/drivers', data);
    return response.data.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/drivers/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/drivers/stats');
    return response.data.data;
  },
};

// Trip API calls
export const tripApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/trips', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/trips/${id}`);
    return response.data.data;
  },

  create: async (data: any) => {
    const response = await api.post('/trips', data);
    return response.data.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/trips/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  dispatch: async (id: string) => {
    const response = await api.patch(`/trips/${id}/dispatch`);
    return response.data.data;
  },

  complete: async (id: string, notes?: string) => {
    const response = await api.patch(`/trips/${id}/complete`, { notes });
    return response.data.data;
  },

  cancel: async (id: string, reason: string) => {
    const response = await api.patch(`/trips/${id}/cancel`, { reason });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/trips/stats');
    return response.data.data;
  },
};

// Dashboard API calls
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  getAnalytics: async (params?: any) => {
    const response = await api.get('/dashboard/analytics', { params });
    return response.data.data;
  },
};

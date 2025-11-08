import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string; phone?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

// Analysis API
export const analysisAPI = {
  analyze: async (data: {
    imageUrl: string;
    userNotes?: string;
    location?: { latitude: number; longitude: number };
  }) => {
    const response = await api.post('/analyze', data);
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (data: {
    message: string;
    analysisId?: string | null;
  }) => {
    const response = await api.post('/chat', data);
    return response.data;
  },
  
  getChatHistory: async (analysisId: string) => {
    const response = await api.get(`/chat/history/${analysisId}`);
    return response.data;
  },
  
  getChatSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },
};

// SOS API
export const sosAPI = {
  activateSOS: async (data: {
    imageUrl: string;
    conditionSummary: string;
    location: { latitude: number; longitude: number };
    contactWhatsapp?: string;
    contactEmail?: string;
  }) => {
    const response = await api.post('/sos', data);
    return response.data;
  },
};

// History API
export const historyAPI = {
  getHistory: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/history', {
      params: { page, limit },
    });
    return response.data;
  },

  getAnalysisById: async (id: string) => {
    const response = await api.get(`/history/${id}`);
    return response.data;
  },

  deleteAnalysis: async (id: string) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  },
};

import axios from 'axios';

const AGENTS_BASE_URL = process.env.AGENTS_SERVICE_URL || 'http://localhost:8000';

export interface AnalyzeRequestData {
  image_url: string;
  user_location?: {
    lat: number;
    lng: number;
  };
  user_notes?: string;
}

export interface ChatRequestData {
  message: string;
  history: Array<{
    role: string;
    content: string;
  }>;
  context?: any;
}

export interface SOSRequestData {
  image_url: string;
  condition_summary: string;
  location: {
    lat: number;
    lng: number;
  };
  contact_whatsapp?: string;
  contact_email?: string;
}

class AgentsService {
  private axiosInstance;
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: AGENTS_BASE_URL,
      timeout: 60000, // 60 seconds timeout for AI operations
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Agents service health check failed:', error);
      return false;
    }
  }
  
  async analyzeAnimal(data: AnalyzeRequestData): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/analyze', data);
      return response.data;
    } catch (error: any) {
      console.error('Analysis failed:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 'Failed to analyze image. Please try again.'
      );
    }
  }
  
  async chatWithWhisperer(data: ChatRequestData): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/chat', data);
      return response.data;
    } catch (error: any) {
      console.error('Chat failed:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 'Chat service unavailable. Please try again.'
      );
    }
  }
  
  async activateSOS(data: SOSRequestData): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/sos', data);
      return response.data;
    } catch (error: any) {
      console.error('SOS activation failed:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 'SOS service unavailable. Please try again.'
      );
    }
  }
}

export const agentsService = new AgentsService();

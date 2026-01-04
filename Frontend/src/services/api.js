import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding auth tokens or other headers
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed in the future
    // config.headers.Authorization = `Bearer ${token}`;
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling global error responses
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API] Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Product API methods
export const productAPI = {
  // Get all products
  getAll: () => api.get('/products'),
  
  // Get single product by ID
  getById: (id) => api.get(`/products/${id}`),
  
  // Create new product
  create: (productData) => api.post('/insertproduct', productData),
  
  // Update product
  update: (id, productData) => api.put(`/updateproduct/${id}`, productData),
  
  // Delete product
  delete: (id) => api.delete(`/deleteproduct/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;

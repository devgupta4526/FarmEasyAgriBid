const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(token),
        ...(fetchOptions.headers as Record<string, string> || {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(body.error || `HTTP ${res.status}`);
    }

    return res.json() as T;
  }

  get<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'GET', token });
  }

  post<T>(path: string, body: unknown, token?: string): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
  }

  patch<T>(path: string, body: unknown, token?: string): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    });
  }

  delete<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', token });
  }
}

export const api = new ApiClient(API_URL);

// Auth API
export const authApi = {
  register: (data: { email?: string; phone?: string; password: string; full_name: string; role: string; referral_code?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email?: string; phone?: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  logout: (token: string, refresh_token?: string) =>
    api.post('/auth/logout', { refresh_token }, token),
  me: (token: string) =>
    api.get('/auth/me', token),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

// Product API
export const productApi = {
  list: (params: Record<string, string>, token?: string) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/products?${qs}`, token);
  },
  get: (id: string, token?: string) => api.get(`/products/${id}`, token),
  create: (data: unknown, token: string) => api.post('/products', data, token),
  update: (id: string, data: unknown, token: string) => api.patch(`/products/${id}`, data, token),
  delete: (id: string, token: string) => api.delete(`/products/${id}`, token),
  like: (id: string, token: string) => api.post(`/products/${id}/like`, {}, token),
};

// Auction API
export const auctionApi = {
  list: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/auctions?${qs}`);
  },
  get: (id: string) => api.get(`/auctions/${id}`),
  create: (data: unknown, token: string) => api.post('/auctions', data, token),
  bid: (id: string, amount: number, token: string) => api.post(`/auctions/${id}/bid`, { amount }, token),
  autoBid: (id: string, max_amount: number, token: string) => api.post(`/auctions/${id}/auto-bid`, { max_amount }, token),
  buyNow: (id: string, token: string) => api.post(`/auctions/${id}/buy-now`, {}, token),
};

// Order API
export const orderApi = {
  list: (params: Record<string, string>, token: string) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/orders?${qs}`, token);
  },
  get: (id: string, token: string) => api.get(`/orders/${id}`, token),
  create: (data: unknown, token: string) => api.post('/orders', data, token),
  updateStatus: (id: string, status: string, token: string) =>
    api.patch(`/orders/${id}/status`, { status }, token),
};

// AI API
export const aiApi = {
  priceAdvisor: (data: unknown, token: string) => api.post('/ai/price-advisor', data, token),
  cropAdvisor: (data: unknown, token: string) => api.post('/ai/crop-advisor', data, token),
  diseaseAssistant: (data: unknown, token: string) => api.post('/ai/disease-assistant', data, token),
  marketForecast: (data: unknown, token: string) => api.post('/ai/market-forecast', data, token),
  chat: (data: { message: string; language?: string; context?: string }, token: string) =>
    api.post('/ai/chat', data, token),
};

// Chat API
export const chatApi = {
  getRooms: (token: string) => api.get('/chat/rooms', token),
  createRoom: (data: unknown, token: string) => api.post('/chat/rooms', data, token),
  getMessages: (roomId: string, token: string) => api.get(`/chat/rooms/${roomId}/messages`, token),
  sendMessage: (roomId: string, data: unknown, token: string) =>
    api.post(`/chat/rooms/${roomId}/messages`, data, token),
};

// Categories
export const categoryApi = {
  list: () => api.get('/categories'),
};

// Wishlist
export const wishlistApi = {
  list: (token: string) => api.get('/wishlist', token),
  add: (product_id: string, token: string) => api.post('/wishlist', { product_id }, token),
  remove: (product_id: string, token: string) => api.delete(`/wishlist/${product_id}`, token),
};

// Notifications
export const notificationApi = {
  list: (token: string) => api.get('/notifications', token),
  markRead: (id: string, token: string) => api.patch(`/notifications/${id}/read`, {}, token),
  markAllRead: (token: string) => api.patch('/notifications/read-all', {}, token),
};

// Admin
export const adminApi = {
  dashboard: (token: string) => api.get('/admin/dashboard', token),
  users: (params: Record<string, string>, token: string) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${qs}`, token);
  },
  updateUserStatus: (id: string, status: string, token: string) =>
    api.patch(`/admin/users/${id}/status`, { status }, token),
  pendingKyc: (token: string) => api.get('/admin/kyc', token),
  reviewKyc: (userId: string, decision: string, reason: string | undefined, token: string) =>
    api.patch(`/admin/kyc/${userId}`, { decision, reason }, token),
  auditLogs: (token: string) => api.get('/admin/audit-logs', token),
};

// Wallet
export const walletApi = {
  get: (token: string) => api.get('/wallet', token),
  transactions: (params: Record<string, string>, token: string) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/wallet/transactions?${qs}`, token);
  },
};

// Logistics
export const logisticsApi = {
  deliveries: (params: Record<string, string>, token: string) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/logistics/deliveries?${qs}`, token);
  },
  updateLocation: (id: string, latitude: number, longitude: number, token: string) =>
    api.patch(`/logistics/deliveries/${id}/location`, { latitude, longitude }, token),
  updateStatus: (id: string, status: string, notes?: string, token?: string) =>
    api.patch(`/logistics/deliveries/${id}/status`, { status, notes }, token),
};

// Reviews
export const reviewApi = {
  list: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/reviews?${qs}`);
  },
  create: (data: unknown, token: string) => api.post('/reviews', data, token),
};

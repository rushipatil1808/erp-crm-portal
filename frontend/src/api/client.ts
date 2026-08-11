// In development, Vite proxies /api -> localhost:5000
// In production (Vercel), VITE_API_BASE_URL points to Render backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1';

export class ApiError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(statusCode: number, message: string, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function buildCleanQuery(params: Record<string, any>): string {
  const cleanParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, val]) => {
    if (
      val !== undefined &&
      val !== null &&
      val !== '' &&
      val !== false &&
      val !== 'undefined' &&
      val !== 'null'
    ) {
      cleanParams[key] = String(val);
    }
  });
  return new URLSearchParams(cleanParams).toString();
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let displayMessage = data.message || 'An unexpected error occurred';

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const details = data.errors
        .map((e: any) => (e.field ? `${e.field}: ${e.message}` : e.message || String(e)))
        .join(' | ');
      displayMessage = `${displayMessage} (${details})`;
    }

    throw new ApiError(response.status, displayMessage, data.errors || []);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => apiFetch('/auth/me'),

  // Customers
  getCustomers: (params: { page?: number; limit?: number; search?: string; status?: string; type?: string } = {}) => {
    const query = buildCleanQuery(params);
    return apiFetch(`/customers?${query}`);
  },
  getCustomerById: (id: string) => apiFetch(`/customers/${id}`),
  createCustomer: (customerData: any) =>
    apiFetch('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    }),
  updateCustomer: (id: string, customerData: any) =>
    apiFetch(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    }),
  deleteCustomer: (id: string) =>
    apiFetch(`/customers/${id}`, {
      method: 'DELETE',
    }),
  addFollowUp: (customerId: string, followUpData: { note: string; nextFollowUpDate?: string }) =>
    apiFetch(`/customers/${customerId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(followUpData),
    }),

  // Products & Stock
  getProducts: (params: { page?: number; limit?: number; search?: string; category?: string; lowStock?: boolean } = {}) => {
    const queryParams: any = { ...params };
    if (params.lowStock === true) {
      queryParams.lowStock = 'true';
    } else {
      delete queryParams.lowStock;
    }
    const query = buildCleanQuery(queryParams);
    return apiFetch(`/products?${query}`);
  },
  getProductById: (id: string) => apiFetch(`/products/${id}`),
  createProduct: (productData: any) =>
    apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  updateProduct: (id: string, productData: any) =>
    apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
  deleteProduct: (id: string) =>
    apiFetch(`/products/${id}`, {
      method: 'DELETE',
    }),
  adjustStock: (id: string, stockData: { quantity: number; type: 'IN' | 'OUT'; reason: string }) =>
    apiFetch(`/products/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify(stockData),
    }),
  getStockMovements: () => apiFetch('/products/stock-movements/logs'),

  // Sales Challans
  getChallans: (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const query = buildCleanQuery(params);
    return apiFetch(`/challans?${query}`);
  },
  getChallanById: (id: string) => apiFetch(`/challans/${id}`),
  createChallan: (challanData: { customerId: string; status: 'DRAFT' | 'CONFIRMED'; items: Array<{ productId: string; quantity: number }> }) =>
    apiFetch('/challans', {
      method: 'POST',
      body: JSON.stringify(challanData),
    }),
  updateChallanStatus: (id: string, status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED') =>
    apiFetch(`/challans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteChallan: (id: string) =>
    apiFetch(`/challans/${id}`, {
      method: 'DELETE',
    }),
};

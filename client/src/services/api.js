const API_URL = process.env.REACT_APP_API_URL || '/api';

class API {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Cameras
  async getCameras(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/cameras${query ? `?${query}` : ''}`);
  }

  async getCamera(id) {
    return this.request(`/cameras/${id}`);
  }

  async createCamera(camera) {
    return this.request('/cameras', {
      method: 'POST',
      body: JSON.stringify(camera),
    });
  }

  async updateCamera(id, camera) {
    return this.request(`/cameras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(camera),
    });
  }

  async deleteCamera(id) {
    return this.request(`/cameras/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/customers${query ? `?${query}` : ''}`);
  }

  async getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(customer) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id, customer) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Rentals
  async getRentals(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/rentals${query ? `?${query}` : ''}`);
  }

  async getRental(id) {
    return this.request(`/rentals/${id}`);
  }

  async createRental(rental) {
    return this.request('/rentals', {
      method: 'POST',
      body: JSON.stringify(rental),
    });
  }

  async updateRental(id, rental) {
    return this.request(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rental),
    });
  }

  async returnRental(id, returnDate) {
    return this.request(`/rentals/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ actual_return_date: returnDate }),
    });
  }

  async deleteRental(id) {
    return this.request(`/rentals/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Availability
  async checkAvailability(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/availability?${queryString}`, {
      method: 'GET',
    });
  }
}

export default new API();

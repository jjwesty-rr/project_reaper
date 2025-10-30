// Flask API Client - connects to your Python backend
const API_URL = import.meta.env.VITE_API_URL || 'https://estate-backend-w2i5.onrender.com';

// Simple API client to replace Supabase
export const api = {
  // Create a new estate submission
  async createSubmission(data: any) {
    const response = await fetch(`${API_URL}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ADD THIS LINE
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create submission');
    }
    
    return response.json();
  },

  // Get all submissions
async getSubmissions() {
  const response = await fetch(`${API_URL}/api/submissions`, {
    credentials: 'include',  // ADD THIS LINE
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  
  return response.json();
},


  // Get a single submission by ID
  async getSubmission(id: number) {
    const response = await fetch(`${API_URL}/api/submissions/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch submission');
    }
    
    return response.json();
  },

  // Get attorneys (optionally filtered)
  async getAttorneys(filters?: { specialty?: string; state?: string }) {
    const params = new URLSearchParams();
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.state) params.append('state', filters.state);
    
    const url = `${API_URL}/api/attorneys${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch attorneys');
    }
    
    return response.json();
  },

// Create a new attorney
async createAttorney(data: any) {
  const response = await fetch(`${API_URL}/api/attorneys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // ADD THIS LINE
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create attorney');
  }
  
  return response.json();
},

  // Update a submission (assign attorney, change status, add notes)
  async updateSubmission(id: number, updates: any) {
    const response = await fetch(`${API_URL}/api/submissions/${id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // ADD THIS LINE
  body: JSON.stringify(updates),
});
    
    if (!response.ok) {
      throw new Error('Failed to update submission');
    }
    
    return response.json();
  },
 // Authentication methods
async register(data: { email: string; password: string; first_name?: string; last_name?: string; role?: string }) {
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for sessions
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for sessions
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/api/me`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  },

  // Get current user's submissions (NEW!)
async getMySubmissions() {
    const response = await fetch(`${API_URL}/api/my-submissions`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch your submissions');
    }
    
    return response.json();
  },

  // User Management (Super Admin Only)
  async getUsers() {
    const response = await fetch(`${API_URL}/api/users`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async updateUserRole(userId: number, role: string) {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
  },
// State Limits Management (Admin Only)
async getStateLimits() {
  const response = await fetch(`${API_URL}/api/state-limits`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch state limits');
  return response.json();
},

async createStateLimit(data: { state: string; limit_amount: number }) {
  const response = await fetch(`${API_URL}/api/state-limits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create state limit');
  }
  return response.json();
},

async updateStateLimit(id: number, data: { state?: string; limit_amount?: number }) {
  const response = await fetch(`${API_URL}/api/state-limits/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update state limit');
  }
  return response.json();
},

async deleteStateLimit(id: number) {
  const response = await fetch(`${API_URL}/api/state-limits/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete state limit');
  return response.json();
},

};


// For backwards compatibility with code that imports "supabase"
// We'll map it to our new API client
export const supabase = api;
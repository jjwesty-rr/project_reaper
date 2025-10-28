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
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create submission');
    }
    
    return response.json();
  },

  // Get all submissions
  async getSubmissions() {
    const response = await fetch(`${API_URL}/api/submissions`);
    
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
    const response = await fetch(url);
    
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
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update submission');
    }
    
    return response.json();
  },
  };

// For backwards compatibility with code that imports "supabase"
// We'll map it to our new API client
export const supabase = api;
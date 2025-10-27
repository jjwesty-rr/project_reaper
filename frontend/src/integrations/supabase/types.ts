// TypeScript types for our Flask API

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Submission {
  id: number;
  contact_email: string;
  contact_phone: string;
  relationship_to_deceased: string;
  decedent_first_name: string;
  decedent_last_name: string;
  decedent_date_of_death: string | null;
  decedent_state: string;
  estate_value: number;
  has_will: boolean;
  has_trust: boolean;
  has_disputes: boolean;
  referral_type: 'affidavit' | 'informal' | 'formal' | 'trust';
  status: string;
  created_at: string;
}

export interface Attorney {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  state: string;
  specialties: string[];
  is_active?: boolean;
  created_at?: string;
}

export interface CreateSubmissionRequest {
  contact_email: string;
  contact_phone: string;
  relationship_to_deceased: string;
  decedent_first_name: string;
  decedent_last_name: string;
  decedent_date_of_death: string;
  decedent_state: string;
  estate_value: number;
  has_will: boolean;
  has_trust: boolean;
  has_disputes: boolean;
}

export interface CreateSubmissionResponse {
  message: string;
  submission_id: number;
  referral_type: string;
}

export interface CreateAttorneyRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  state: string;
  specialties: string[];
}

// For backwards compatibility - placeholder Database type
export interface Database {
  public: {
    Tables: any;
  };
}
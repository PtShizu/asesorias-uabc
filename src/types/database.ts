export interface Profile {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface AdvisorSubject {
  advisor_id: string;
  subject_id: string;
}

export interface Availability {
  id: string;
  advisor_id: string;
  day_of_week: number; // 0-6 (Dom-Sab)
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}

export interface Appointment {
  id: string;
  advisor_id: string;
  guest_email: string;
  subject_id: string;
  start_at: string; // ISO string
  end_at: string; // ISO string
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Centralized core types used across the application.

export interface Transaction {
  id: string;
  type: string | null;
  description: string;
  amount: number;
  category: string | null;
  created_at: string | null;
}

export interface Goal {
  id: string;
  category: string;
  monthly_limit: number;
  current_amount: number | null;
  user_id?: string;
}

export interface Category {
  id: string;
  name: string;
  user_id?: string;
  created_at?: string | null;
}

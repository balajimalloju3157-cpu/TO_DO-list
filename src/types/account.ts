export interface UserAccount {
  id: string;
  full_name: string;
  email: string;
  role: string | null;
  created_at: string;
}

export interface CreateAccountInput {
  full_name: string;
  email: string;
  role?: string | null;
}

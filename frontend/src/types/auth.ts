export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

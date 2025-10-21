export interface User {
  email: string;
  username: string;
  name: string;
  token: string;
}

export interface AuthState {
  user: User;
}

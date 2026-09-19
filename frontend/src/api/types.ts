export interface User {
  userUuid: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

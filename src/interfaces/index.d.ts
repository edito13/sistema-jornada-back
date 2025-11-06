export interface JwtPayload {
  id: number;
}

export interface UserData {
  id: number;
  nome?: string;
  email: string;
  id_faculdade?: number;
  role: "admin" | "user";
}

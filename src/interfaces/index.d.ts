import { AuthRoles } from "../types";

export interface JwtPayload {
  id: number;
}

export interface UserData {
  id: number;
  nome?: string;
  email: string;
  role?: AuthRoles;
  id_faculdade?: number;
}

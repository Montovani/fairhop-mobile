import api from "./api";
import type { AuthTokens, LoginRequest, SignupRequest, JwtPayload } from "@/types";

export const authService = {
  async signup(data: SignupRequest): Promise<{ message: string }> {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>("/auth/login", data);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async verify(): Promise<JwtPayload> {
    const response = await api.get<JwtPayload>("/auth/verify");
    return response.data;
  },
};

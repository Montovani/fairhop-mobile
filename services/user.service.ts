import api from "./api";
import type { User, Fair, UpdateUserRequest, FairQueryParams } from "@/types";

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  async updateMe(data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>("/users/me", data);
    return response.data;
  },

  async deleteMe(): Promise<void> {
    await api.delete("/users/me");
  },

  async getSavedFairs(params?: FairQueryParams): Promise<Fair[]> {
    const response = await api.get<Fair[]>("/users/me/saved-fairs", { params });
    return response.data;
  },

  async saveFair(fairId: string): Promise<void> {
    await api.post(`/users/me/saved-fairs/${fairId}`);
  },

  async unsaveFair(fairId: string): Promise<void> {
    await api.delete(`/users/me/saved-fairs/${fairId}`);
  },
};

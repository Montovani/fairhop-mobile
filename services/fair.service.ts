import api from "./api";
import type { Fair, FairQueryParams } from "@/types";

export const fairService = {
  async getAll(params?: FairQueryParams): Promise<Fair[]> {
    const response = await api.get<Fair[]>("/fairs", { params });
    return response.data;
  },

  async getById(id: string): Promise<Fair> {
    const response = await api.get<Fair>(`/fairs/${id}`);
    return response.data;
  },
};

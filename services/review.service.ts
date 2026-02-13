import api from "./api";
import type { Review, CreateReviewRequest, UpdateReviewRequest } from "@/types";

export const reviewService = {
  async getByFair(fairId: string): Promise<Review[]> {
    const response = await api.get<Review[]>("/reviews", {
      params: { fair: fairId },
    });
    return response.data;
  },

  async create(data: CreateReviewRequest): Promise<Review> {
    const response = await api.post<Review>("/reviews", data);
    return response.data;
  },

  async update(id: string, data: UpdateReviewRequest): Promise<Review> {
    const response = await api.put<Review>(`/reviews/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  },
};

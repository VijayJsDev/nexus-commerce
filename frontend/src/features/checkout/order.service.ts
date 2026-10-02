/**
 * order.service.ts — API client service for placing and retrieving orders
 */

import { apiClient } from '@/lib/axios';
import type { CreateOrderPayload, OrderResponse } from '@/types/order.types';

export const orderService = {
  /**
   * Submits a new customer order to the backend API.
   * Triggers super admin email notification via Resend.
   */
  async createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    const response = await apiClient.post<OrderResponse>('/api/orders', payload);
    return response.data;
  },

  /**
   * Retrieves all orders (for super admin screens in future).
   */
  async getAllOrders(): Promise<OrderResponse[]> {
    const response = await apiClient.get<OrderResponse[]>('/api/orders');
    return response.data;
  },

  /**
   * Retrieves order by ID.
   */
  async getOrderById(id: string): Promise<OrderResponse> {
    const response = await apiClient.get<OrderResponse>(`/api/orders/${id}`);
    return response.data;
  },
};

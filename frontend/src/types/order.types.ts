/**
 * order.types.ts — Type definitions for Order placement & response
 */

export interface CreateOrderItemPayload {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderPayload {
  customerEmail: string;
  firstName: string;
  lastName: string;
  phone?: string;
  deliveryType: 'Ship' | 'Pickup';
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  pickupLocation?: string;
  billingSameAsShipping: boolean;
  billingAddress?: string;
  tipAmount: number;
  shippingFee: number;
  discountAmount: number;
  specialInstructions?: string;
  items: CreateOrderItemPayload[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  deliveryType: string;
  shippingAddress?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  pickupLocation?: string;
  billingSameAsShipping: boolean;
  billingAddress?: string;
  tipAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  specialInstructions?: string;
  status: string;
  createdAt: string;
  items: OrderItemResponse[];
}

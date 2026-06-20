import type { Order } from './order.entity';

export type OrderResponse = {
  id: string;
  category: string;
  city: string;
  phone: string;
  status: Order['status'];
  createdAt: string;
};

export type PhotographerOrderResponse = OrderResponse & {
  clientName: string;
};

export function toOrderResponse(order: Order): OrderResponse {
  return {
    id: order.id,
    category: order.category,
    city: order.city,
    phone: order.phone,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}

export function toPhotographerOrderResponse(
  order: Order,
): PhotographerOrderResponse {
  return {
    ...toOrderResponse(order),
    clientName: order.user?.name ?? 'Клиент',
  };
}

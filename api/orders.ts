import { apiFetch } from './client'

export type Order = {
  id: string
  category: string
  city: string
  phone: string
  status: 'open' | 'closed'
  createdAt: string
}

export type PhotographerOrder = Order & {
  clientName: string
}

export type CreateOrderPayload = {
  category: string
  city: string
  phone: string
}

export type OrderResponse = {
  order: Order
}

export type OrdersListResponse = {
  orders: Order[]
}

export type PhotographerOrdersListResponse = {
  orders: PhotographerOrder[]
}

export function createOrder(payload: CreateOrderPayload, accessToken: string) {
  return apiFetch<OrderResponse>('/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: payload,
  })
}

export function fetchMyOrders(accessToken: string) {
  return apiFetch<OrdersListResponse>('/orders/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function fetchMatchingOrders(accessToken: string) {
  return apiFetch<PhotographerOrdersListResponse>('/orders/matching', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function deleteOrder(orderId: string, accessToken: string) {
  return apiFetch<{ ok: boolean }>(`/orders/me/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

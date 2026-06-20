import { apiFetch } from './client'
import type { User } from '~/composables/useUser'

export type Subscription = {
  id: string
  photographer: User
  createdAt: string
}

export type SubscriptionsListResponse = {
  subscriptions: Subscription[]
}

export type SubscriptionResponse = {
  subscription: Subscription
}

export type SubscriptionStatusResponse = {
  subscribed: boolean
}

export type SubscribersCountResponse = {
  subscribersCount: number
}

export function fetchMySubscriptions(accessToken: string) {
  return apiFetch<SubscriptionsListResponse>('/subscriptions/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function fetchSubscribersCount(userId: string) {
  return apiFetch<SubscribersCountResponse>(`/subscriptions/count/${encodeURIComponent(userId)}`)
}

export function fetchSubscriptionStatus(photographerId: string, accessToken: string) {
  return apiFetch<SubscriptionStatusResponse>(`/subscriptions/status/${photographerId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function subscribeToPhotographer(photographerId: string, accessToken: string) {
  return apiFetch<SubscriptionResponse>(`/subscriptions/${photographerId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function unsubscribeFromPhotographer(photographerId: string, accessToken: string) {
  return apiFetch<{ ok: boolean }>(`/subscriptions/${photographerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

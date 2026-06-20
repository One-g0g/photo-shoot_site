import type { PublicUser } from '../auth/auth.types';
import { toPublicUser } from '../auth/auth.mapper';
import type { PhotographerSubscription } from './photographer-subscription.entity';

export type SubscriptionResponse = {
  id: string;
  photographer: PublicUser;
  createdAt: string;
};

export function toSubscriptionResponse(
  subscription: PhotographerSubscription,
): SubscriptionResponse {
  return {
    id: subscription.id,
    photographer: toPublicUser(subscription.photographer),
    createdAt: subscription.createdAt.toISOString(),
  };
}

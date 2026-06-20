import type { UserRole } from '../users/user.entity';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  profileBanner?: string;
  vkUrl?: string;
  telegramUrl?: string;
  contactEmail?: string;
  city?: string;
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
};

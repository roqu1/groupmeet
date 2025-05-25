import { Page } from './pagination';

export interface FriendRequest {
  requestId: number;
  senderId: number;
  senderUsername: string;
  senderFirstName: string;
  senderLastName: string;
  senderAvatarUrl: string | null;
  requestDate: string;
}

export type FriendRequestPage = Page<FriendRequest>;

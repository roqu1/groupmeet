import { Page } from './pagination';

export type SearchFriendshipStatus = 'NONE' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED';

export enum ProfileFriendshipStatus {
  NONE = 'NONE',
  SELF = 'SELF',
  FRIENDS = 'FRIENDS',
  REQUEST_SENT = 'REQUEST_SENT',
  REQUEST_RECEIVED = 'REQUEST_RECEIVED',
}

export type Gender = 'MALE' | 'FEMALE' | 'DIVERS';

export interface UserSearchResult {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  avatarUrl: string | null;
  location: string | null;
  interests: string[] | null;
  friendshipStatus: SearchFriendshipStatus;
}

export interface SearchUsersParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  genders?: Gender[];
  location?: string;
  minAge?: number | null;
  maxAge?: number | null;
  interests?: string[];
}

export type UserSearchPage = Page<UserSearchResult>;

export interface Achievement {
  name: string;
  description: string;
  iconName: string;
}

export interface FriendSummary {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  avatarUrl: string | null;
  location: string | null;
  age: number | null;
  aboutMe: string | null;
  interests: string[];
  achievements: Achievement[];
  friendshipStatusWithViewer: ProfileFriendshipStatus | null;
  relatedFriendshipId?: number | null;
  friendsCount: number;
  friendPreviews: FriendSummary[];
  pendingFriendRequestsCount?: number;
}

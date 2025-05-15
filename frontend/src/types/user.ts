import { Page } from './pagination';

export type FriendshipStatus = 'NONE' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED';

export type Gender = 'MALE' | 'FEMALE' | 'DIVERS';

export interface UserSearchResult {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  avatarUrl: string | null;
  location: string | null;
  age: number | null;
  interests: string[] | null;
  friendshipStatus: FriendshipStatus;
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

import { Page } from './pagination';

export interface GroupParticipant {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isOrganizer: boolean;
  gender?: Gender;
}

export type Gender = 'MALE' | 'FEMALE' | 'DIVERS';

export type GroupMembershipStatus = 'MEMBER' | 'NOT_MEMBER' | 'PENDING';

export interface GroupDetails {
  id: string;
  name: string;
  description: string;
  dateTime: string;
  location: string;
  address: string;
  tags: string[];
  organizer: GroupParticipant;
  participantsPreview: GroupParticipant[];
  totalParticipants: number;
  currentUserMembership: GroupMembershipStatus;
  isCurrentUserOrganizer: boolean;
}

export interface GroupParticipant {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isOrganizer: boolean;
  gender?: Gender;
}

export interface GroupParticipantsData {
  participantsPage: Page<GroupParticipant>;
  isCurrentUserOrganizer: boolean;
  groupName: string;
}

export interface FetchGroupParticipantsParams {
  groupId: string;
  page: number;
  size: number;
  searchTerm?: string;
}

export interface GroupParticipantActionResponse {
  message: string;
}

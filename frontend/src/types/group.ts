import { Page } from './pagination';

export type Gender = 'MALE' | 'FEMALE' | 'DIVERS';

export interface MeetingParticipantPreview {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isOrganizer: boolean;
}

export type CurrentUserMeetingMembershipStatus = 'MEMBER' | 'NOT_MEMBER';

export interface GroupDetails {
  id: number;
  title: string;
  description: string | null;
  dateTime: string;
  location: string | null;
  format: 'ONLINE' | 'OFFLINE';
  meetingTypeNames: string[];
  organizer: MeetingParticipantPreview;
  participantsPreview: MeetingParticipantPreview[];
  totalParticipants: number;
  maxParticipants: number | null;
  currentUserMembership: CurrentUserMeetingMembershipStatus;
  currentUserOrganizer: boolean;
  participantCount: number;
}

export interface GroupParticipant {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isOrganizer: boolean;
  gender: Gender;
  participationStatus: 'ACTIVE' | 'BLOCKED';
  pro: boolean;
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

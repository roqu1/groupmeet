import { Page } from './pagination';
export type MeetingFormat = 'ONLINE' | 'OFFLINE';

export interface MeetingCardData {
  id: number;
  title: string;
  description: string | null;
  format: MeetingFormat;
  meetingTypeNames: string[];
  location?: string | null;
  dateTime: string; // ISO String date
  participantCount: number;
  maxParticipants?: number | null;
  creatorUsername: string;
  createdAt?: string; // ISO String date
}

export interface MeetingCreationPayload {
  title: string;
  description?: string;
  format: MeetingFormat;
  meetingTypeNames: string[]; // Array of interest names
  location?: string;
  dateTime: string; // ISO String for date and time
  maxParticipants?: number;
}

export interface MeetingsSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  types?: string[];
  location?: string;
  format?: MeetingFormat | '';
  startDate?: string;
  endDate?: string;
}

export type MeetingsSearchPage = Page<MeetingCardData>;

export interface UserProfileMeeting {
  id: number;
  title: string;
  dateTime: string; // ISO String date
  location: string | null;
  format: MeetingFormat;
  meetingTypeNames: string[];
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export type UserProfileMeetingsPage = Page<UserProfileMeeting>;

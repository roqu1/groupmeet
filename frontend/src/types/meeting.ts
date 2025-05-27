import { Page } from './pagination';
export type MeetingFormat = 'ONLINE' | 'OFFLINE';

export interface MeetingCardData {
  id: number;
  title: string;
  description: string | null;
  format: MeetingFormat;
  meetingTypeName: string;
  location?: string | null;
  dateTime: string;
  participantCount: number;
  maxParticipants?: number | null;
  creatorUsername: string;
}

export interface MeetingCreationPayload {
  title: string;
  description?: string;
  format: MeetingFormat;
  meetingTypeName: string;
  location?: string;
  dateTime: string;
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

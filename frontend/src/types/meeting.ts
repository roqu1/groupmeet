import { Page } from './pagination';

export interface MeetingCardData {
  id: string;
  title: string;
  shortDescription: string;
  format: 'ONLINE' | 'OFFLINE';
  type: string;
  participantCount: number;
  maxParticipants?: number;
  imageUrl?: string | null;
}

export interface MeetingsSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  types?: string[];
  location?: string;
  format?: 'ONLINE' | 'OFFLINE' | '';
  startDate?: string;
  endDate?: string;
}

export type MeetingsSearchPage = Page<MeetingCardData>;

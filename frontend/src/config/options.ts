import { ComboboxOption } from '@/components/ui/comboBox';
import { Gender } from '@/types/user';
import { MeetingFormat } from '@/types/meeting';

export interface GenderOption {
  id: Gender;
  label: string;
}

export const GENDER_OPTIONS: readonly GenderOption[] = [
  { id: 'MALE', label: 'Männlich' },
  { id: 'FEMALE', label: 'Weiblich' },
  { id: 'DIVERS', label: 'Divers' },
] as const;

export const LOCATION_OPTIONS: readonly ComboboxOption[] = [
  { value: 'berlin', label: 'Berlin' },
  { value: 'hamburg', label: 'Hamburg' },
  { value: 'bremen', label: 'Bremen' },
  { value: 'munich', label: 'München' },
  { value: 'cologne', label: 'Köln' },
  { value: 'frankfurt', label: 'Frankfurt am Main' },
  { value: 'stuttgart', label: 'Stuttgart' },
  { value: 'düsseldorf', label: 'Düsseldorf' },
  { value: 'dortmund', label: 'Dortmund' },
  { value: 'essen', label: 'Essen' },
  { value: 'leipzig', label: 'Leipzig' },
  { value: 'dresden', label: 'Dresden' },
  { value: 'hanover', label: 'Hannover' },
  { value: 'nuremberg', label: 'Nürnberg' },
] as const;

export const MEETING_FORMAT_OPTIONS: readonly ComboboxOption[] = [
  { value: 'ALL_FORMATS_PLACEHOLDER', label: 'Alle Formate' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Vor Ort' },
] as const;

export const MEETING_FORMAT_CREATION_OPTIONS: readonly { value: MeetingFormat; label: string }[] = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Vor Ort' },
] as const;

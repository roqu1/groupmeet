import { ComboboxOption } from '@/components/ui/comboBox';
import { Gender } from '@/types/user';

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

import React from 'react';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxOption } from '@/components/ui/comboBox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import SimpleDatePicker from '@/components/ui/SimpleDatePicker';
import { Label } from '@/components/ui/label';
import { Loader2, RotateCcw } from 'lucide-react';
import { LOCATION_OPTIONS, MEETING_FORMAT_OPTIONS } from '@/config/options';
import { MeetingFormat } from '@/types/meeting';

export interface MeetingsFilterPanelProps {
  uiSelectedArt: string[];
  setUiSelectedArt: React.Dispatch<React.SetStateAction<string[]>>;
  uiSelectedLocation: string;
  setUiSelectedLocation: (value: string) => void;
  uiSelectedFormat: MeetingFormat | '';
  setUiSelectedFormat: (value: MeetingFormat | '') => void;
  uiStartDate?: Date;
  setUiStartDate: (date?: Date) => void;
  uiEndDate?: Date;
  setUiEndDate: (date?: Date) => void;
  interestOptions: MultiSelectOption[];
  isLoadingInterests: boolean;
  isErrorInterests: boolean;
  isUIDisabled: boolean;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const MeetingsFilterPanel: React.FC<MeetingsFilterPanelProps> = React.memo(
  ({
    uiSelectedArt,
    setUiSelectedArt,
    uiSelectedLocation,
    setUiSelectedLocation,
    uiSelectedFormat,
    setUiSelectedFormat,
    uiStartDate,
    setUiStartDate,
    uiEndDate,
    setUiEndDate,
    interestOptions,
    isLoadingInterests,
    isErrorInterests,
    isUIDisabled,
    onApplyFilters,
    onResetFilters,
  }) => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="filter-art">Art</Label>
          {isLoadingInterests ? (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Interessen werden geladen...
            </div>
          ) : isErrorInterests ? (
            <div className="text-sm text-destructive mt-1">Fehler beim Laden der Interessen.</div>
          ) : (
            <MultiSelect
              id="filter-art"
              options={interestOptions}
              selected={uiSelectedArt}
              onValueChange={setUiSelectedArt}
              placeholder="Art wählen..."
              disabled={isUIDisabled || isLoadingInterests}
              className="mt-1"
            />
          )}
        </div>
        <div>
          <Label htmlFor="filter-location">Ort</Label>
          <Combobox
            id="filter-location"
            options={LOCATION_OPTIONS as ComboboxOption[]}
            value={uiSelectedLocation}
            onSelect={setUiSelectedLocation}
            placeholder="Ort wählen..."
            emptyMessage="Kein Ort gefunden."
            disabled={isUIDisabled}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="filter-format">Format</Label>
          <Select
            value={uiSelectedFormat || 'ALL_FORMATS_PLACEHOLDER'}
            onValueChange={(value) => {
              if (value === 'ALL_FORMATS_PLACEHOLDER') {
                setUiSelectedFormat('');
              } else {
                setUiSelectedFormat(value as MeetingFormat);
              }
            }}
            disabled={isUIDisabled}
          >
            <SelectTrigger id="filter-format" className="mt-1">
              <SelectValue placeholder="Format wählen..." />
            </SelectTrigger>
            <SelectContent>
              {MEETING_FORMAT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <div>
            <Label htmlFor="filter-start-date" className="block text-sm font-medium mb-1">
              Startdatum
            </Label>
            <SimpleDatePicker
              id="filter-start-date"
              selectedDate={uiStartDate}
              onDateChange={setUiStartDate}
              disabled={isUIDisabled}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="filter-end-date" className="block text-sm font-medium mb-1">
              Enddatum
            </Label>
            <SimpleDatePicker
              id="filter-end-date"
              selectedDate={uiEndDate}
              onDateChange={setUiEndDate}
              disabled={isUIDisabled || (uiStartDate && uiEndDate && uiEndDate < uiStartDate)}
              min={uiStartDate ? uiStartDate.toISOString().split('T')[0] : undefined}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
          <Button onClick={onApplyFilters} className="flex-1" disabled={isUIDisabled}>
            {isUIDisabled && !isLoadingInterests && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Filter anwenden
          </Button>
          <Button
            onClick={onResetFilters}
            variant="outline"
            className="flex-1"
            disabled={isUIDisabled}
            title="Filter zurücksetzen"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Zurücksetzen
          </Button>
        </div>
      </div>
    );
  }
);
MeetingsFilterPanel.displayName = 'MeetingsFilterPanel';

export default MeetingsFilterPanel;

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, ComboboxOption } from '@/components/ui/comboBox';
import { GENDER_OPTIONS, LOCATION_OPTIONS, GenderOption } from '@/config/options';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { Loader2, RotateCcw } from 'lucide-react';
import { Gender } from '@/types/user';

export interface GenderSelection {
  MALE: boolean;
  FEMALE: boolean;
  DIVERS: boolean;
}

export interface FiltersPanelCoreContentProps {
  uiSelectedGenders: GenderSelection;
  handleGenderChange: (genderId: Gender, checked: boolean | 'indeterminate') => void;
  uiSelectedLocation: string;
  setUiSelectedLocation: (value: string) => void;
  uiSelectedInterests: string[];
  setUiSelectedInterests: React.Dispatch<React.SetStateAction<string[]>>;
  interestOptions: MultiSelectOption[];
  isLoadingInterests: boolean;
  isErrorInterests: boolean;
  isUIDisabled: boolean;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const UserSearchFiltersPanel: React.FC<FiltersPanelCoreContentProps> = React.memo(
  ({
    uiSelectedGenders,
    handleGenderChange,
    uiSelectedLocation,
    setUiSelectedLocation,
    uiSelectedInterests,
    setUiSelectedInterests,
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
          <label className="block text-sm font-medium mb-2">Geschlecht</label>
          <div className="flex items-center space-x-4 flex-wrap">
            {GENDER_OPTIONS.map((option: GenderOption) => (
              <div key={option.id} className="flex items-center space-x-2 mb-2 sm:mb-0">
                <Checkbox
                  id={`gender-${option.id.toLowerCase()}`}
                  checked={uiSelectedGenders[option.id]}
                  onCheckedChange={(checked) => handleGenderChange(option.id, checked)}
                  disabled={isUIDisabled}
                />
                <label
                  htmlFor={`gender-${option.id.toLowerCase()}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="location-combo" className="block text-sm font-medium mb-1">
            Ort
          </label>
          <Combobox
            options={LOCATION_OPTIONS as ComboboxOption[]}
            value={uiSelectedLocation}
            onSelect={setUiSelectedLocation}
            placeholder="Ort suchen oder wählen..."
            emptyMessage="Kein Ort gefunden."
            id="location-combo"
            disabled={isUIDisabled}
          />
        </div>
        <div>
          <label htmlFor="interests-select" className="block text-sm font-medium mb-1">
            Interessen
          </label>
          {isLoadingInterests ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Interessen werden geladen...
            </div>
          ) : isErrorInterests ? (
            <div className="text-sm text-destructive">Fehler beim Laden der Interessen.</div>
          ) : (
            <MultiSelect
              options={interestOptions}
              selected={uiSelectedInterests}
              onValueChange={setUiSelectedInterests}
              placeholder="Interessen wählen..."
              className="w-full"
              id="interests-select"
              disabled={isUIDisabled}
            />
          )}
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
UserSearchFiltersPanel.displayName = 'UserSearchFiltersPanel';

export default UserSearchFiltersPanel;

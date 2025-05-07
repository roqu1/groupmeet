import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, ComboboxOption } from '@/components/ui/comboBox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import UserSearchCard from '@/components/users/UserSearchCard';
import {
  Search,
  Loader2,
  AlertCircle,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useUserSearch } from '@/hooks/users/useUserSearch';
import { useSendFriendRequest } from '@/hooks/friend-requests/useSendFriendRequest';
import { SearchUsersParams, UserSearchResult, Gender } from '@/types/user';
import { cn } from '@/lib/utils';

const locationOptions: ComboboxOption[] = [
  { value: 'berlin', label: 'Berlin' },
  { value: 'hamburg', label: 'Hamburg' },
  { value: 'bremen', label: 'Bremen' },
  { value: 'munich', label: 'München' },
  { value: 'cologne', label: 'Köln' },
  { value: 'frankfurt', label: 'Frankfurt' },
];

const ageOptions: ComboboxOption[] = Array.from({ length: 83 }, (_, i) => ({
  value: (i + 18).toString(),
  label: (i + 18).toString(),
}));

const interestOptions: MultiSelectOption[] = [
  { value: 'sport', label: 'Sport' },
  { value: 'musik', label: 'Musik' },
  { value: 'reisen', label: 'Reisen' },
  { value: 'kochen', label: 'Kochen' },
  { value: 'filme', label: 'Filme' },
  { value: 'lesen', label: 'Lesen' },
  { value: 'technologie', label: 'Technologie' },
  { value: 'kunst', label: 'Kunst' },
];

const FILTERS_STORAGE_KEY = 'findFriendsFilters';
const DEFAULT_PAGE_SIZE = 5;
const MIN_CARD_HEIGHT_PX = 80;

interface GenderSelection {
  male: boolean;
  female: boolean;
  divers: boolean;
}

const FindFriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenders, setSelectedGenders] = useState<GenderSelection>({
    male: false,
    female: false,
    divers: false,
  });
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedMinAge, setSelectedMinAge] = useState<string>('');
  const [selectedMaxAge, setSelectedMaxAge] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [activeSearchParams, setActiveSearchParams] = useState<SearchUsersParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    data: searchData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useUserSearch(activeSearchParams, true);

  const searchResults = useMemo(() => searchData?.content ?? [], [searchData]);
  const paginationInfo = useMemo(
    () => ({
      currentPage: searchData?.number ?? 0,
      totalPages: searchData?.totalPages ?? 0,
      isFirst: searchData?.first ?? true,
      isLast: searchData?.last ?? true,
    }),
    [searchData]
  );

  const [actionInProgressUserId, setActionInProgressUserId] = useState<number | null>(null);
  const { mutate: sendFriendRequestMutate, isPending: isSendingRequest } = useSendFriendRequest(
    () => {
      setActionInProgressUserId(null);
    }
  );

  const initialUiFiltersState: {
    genders: GenderSelection;
    location: string;
    minAge: string;
    maxAge: string;
    interests: string[];
  } = {
    genders: { male: false, female: false, divers: false },
    location: '',
    minAge: '',
    maxAge: '',
    interests: [],
  };

  const triggerSearch = (
    currentUiFilters: Partial<typeof initialUiFiltersState>,
    currentSearchTerm: string,
    page: number = 0
  ) => {
    const {
      genders: uiGenders,
      location: uiLocation,
      minAge: uiMinAge,
      maxAge: uiMaxAge,
      interests: uiInterests,
    } = currentUiFilters;
    const activeGenders = uiGenders ?? selectedGenders;
    const activeLocation = uiLocation ?? selectedLocation;
    const activeMinAge = uiMinAge ?? selectedMinAge;
    const activeMaxAge = uiMaxAge ?? selectedMaxAge;
    const activeInterests = uiInterests ?? selectedInterests;

    const params: SearchUsersParams = {
      page: page,
      size: DEFAULT_PAGE_SIZE,
      searchTerm: currentSearchTerm.trim() || undefined,
      genders: (Object.keys(activeGenders) as Array<keyof GenderSelection>)
        .filter((key) => activeGenders[key])
        .map((key) => key.toUpperCase() as Gender),
      location: activeLocation || undefined,
      minAge: activeMinAge ? parseInt(activeMinAge, 10) : undefined,
      maxAge: activeMaxAge ? parseInt(activeMaxAge, 10) : undefined,
      interests: activeInterests.length > 0 ? activeInterests : undefined,
    };

    const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && !(Array.isArray(value) && value.length === 0)) {
        acc[key as keyof SearchUsersParams] = value;
      }
      return acc;
    }, {} as SearchUsersParams);

    console.log('Triggering search with cleaned params:', cleanedParams);
    setActiveSearchParams(cleanedParams);
  };

  useEffect(() => {
    console.log('EFFECT: Loading initial filters');
    const savedFiltersJson = localStorage.getItem(FILTERS_STORAGE_KEY);
    let filtersToApply = initialUiFiltersState;
    if (savedFiltersJson) {
      try {
        const parsedFilters = JSON.parse(savedFiltersJson);
        filtersToApply = {
          ...initialUiFiltersState,
          ...parsedFilters,
          genders: { ...initialUiFiltersState.genders, ...(parsedFilters.genders || {}) },
        };
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
        localStorage.removeItem(FILTERS_STORAGE_KEY);
      }
    }
    setSelectedGenders(filtersToApply.genders);
    setSelectedLocation(filtersToApply.location);
    setSelectedMinAge(filtersToApply.minAge);
    setSelectedMaxAge(filtersToApply.maxAge);
    setSelectedInterests(filtersToApply.interests);

    const initialSearchTerm = '';
    const initialGenders = (Object.keys(filtersToApply.genders) as Array<keyof GenderSelection>)
      .filter((key) => filtersToApply.genders[key])
      .map((key) => key.toUpperCase() as Gender);
    const initialParams: SearchUsersParams = {
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      searchTerm: initialSearchTerm || undefined,
      genders: initialGenders.length > 0 ? initialGenders : undefined,
      location: filtersToApply.location || undefined,
      minAge: filtersToApply.minAge ? parseInt(filtersToApply.minAge, 10) : undefined,
      maxAge: filtersToApply.maxAge ? parseInt(filtersToApply.maxAge, 10) : undefined,
      interests: filtersToApply.interests.length > 0 ? filtersToApply.interests : undefined,
    };

    const cleanedInitialParams = Object.entries(initialParams).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof SearchUsersParams] = value;
      }
      return acc;
    }, {} as SearchUsersParams);

    console.log('EFFECT: Setting initial activeSearchParams:', cleanedInitialParams);
    setActiveSearchParams(cleanedInitialParams);
  }, []);

  const handleGenderChange = (
    genderKey: keyof GenderSelection,
    checked: boolean | 'indeterminate'
  ) => {
    if (typeof checked === 'boolean') {
      setSelectedGenders((prev) => ({ ...prev, [genderKey]: checked }));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenders(initialUiFiltersState.genders);
    setSelectedLocation(initialUiFiltersState.location);
    setSelectedMinAge(initialUiFiltersState.minAge);
    setSelectedMaxAge(initialUiFiltersState.maxAge);
    setSelectedInterests(initialUiFiltersState.interests);
    localStorage.removeItem(FILTERS_STORAGE_KEY);
    triggerSearch(initialUiFiltersState, '', 0);
  };

  const handleSaveChangesAndSearch = () => {
    const filtersToSave = {
      genders: selectedGenders,
      location: selectedLocation,
      minAge: selectedMinAge,
      maxAge: selectedMaxAge,
      interests: selectedInterests,
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
    triggerSearch({}, searchTerm, 0);
    if (window.innerWidth < 1024) {
      setIsFiltersOpen(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < paginationInfo.totalPages) {
      setActiveSearchParams((prevParams: SearchUsersParams) => ({ ...prevParams, page: newPage }));
    }
  };

  const handleAddFriend = (userId: number) => {
    if (isSendingRequest && actionInProgressUserId === userId) return;
    setActionInProgressUserId(userId);
    sendFriendRequestMutate(userId);
  };

  const listMinHeight = DEFAULT_PAGE_SIZE * MIN_CARD_HEIGHT_PX;

  const FiltersPanelCoreContent = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Geschlecht</label>
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Checkbox
              id="gender-male"
              checked={selectedGenders.male}
              onCheckedChange={(checked) => handleGenderChange('male', checked)}
              disabled={isFetching}
            />
            <label htmlFor="gender-male" className="text-sm font-medium leading-none">
              Männlich
            </label>
          </div>
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Checkbox
              id="gender-female"
              checked={selectedGenders.female}
              onCheckedChange={(checked) => handleGenderChange('female', checked)}
              disabled={isFetching}
            />
            <label htmlFor="gender-female" className="text-sm font-medium leading-none">
              Weiblich
            </label>
          </div>
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Checkbox
              id="gender-divers"
              checked={selectedGenders.divers}
              onCheckedChange={(checked) => handleGenderChange('divers', checked)}
              disabled={isFetching}
            />
            <label htmlFor="gender-divers" className="text-sm font-medium leading-none">
              Divers
            </label>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="location-combo" className="block text-sm font-medium mb-1">
          Ort
        </label>
        <Combobox
          options={locationOptions}
          value={selectedLocation}
          onSelect={setSelectedLocation}
          placeholder="Ort suchen oder wählen..."
          emptyMessage="Kein Ort gefunden."
          id="location-combo"
          disabled={isFetching}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Alter</label>
        <div className="flex gap-2">
          <Select value={selectedMinAge} onValueChange={setSelectedMinAge} disabled={isFetching}>
            <SelectTrigger aria-label="Mindestalter">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {ageOptions.map((option) => (
                <SelectItem
                  key={`min-${option.value}`}
                  value={option.value}
                  disabled={
                    !!selectedMaxAge &&
                    selectedMaxAge !== '' &&
                    parseInt(option.value) > parseInt(selectedMaxAge)
                  }
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMaxAge} onValueChange={setSelectedMaxAge} disabled={isFetching}>
            <SelectTrigger aria-label="Maximalalter">
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              {ageOptions.map((option) => (
                <SelectItem
                  key={`max-${option.value}`}
                  value={option.value}
                  disabled={
                    !!selectedMinAge &&
                    selectedMinAge !== '' &&
                    parseInt(option.value) < parseInt(selectedMinAge)
                  }
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label htmlFor="interests-select" className="block text-sm font-medium mb-1">
          Interessen
        </label>
        <MultiSelect
          options={interestOptions}
          selected={selectedInterests}
          onValueChange={setSelectedInterests}
          placeholder="Interessen wählen..."
          className="w-full"
          id="interests-select"
          disabled={isFetching}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
        <Button onClick={handleSaveChangesAndSearch} className="flex-1" disabled={isFetching}>
          {isFetching && !isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{' '}
          Speichern & Suchen
        </Button>
        <Button
          onClick={handleResetFilters}
          variant="outline"
          className="flex-1"
          disabled={isFetching}
        >
          Filter zurücksetzen
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container-wrapper py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Finde neue Freunde</h1>
      <div className="flex flex-col gap-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Suchen nach Benutzername, Vorname, Nachname..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveChangesAndSearch()}
            disabled={isFetching}
          />
        </div>

        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-expanded={isFiltersOpen}
            aria-controls="filters-panel-mobile"
          >
            <div className="flex items-center">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filterung
            </div>
            {isFiltersOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {isFiltersOpen && (
            <div id="filters-panel-mobile" className="mt-4 p-4 border rounded-lg bg-card shadow-sm">
              <FiltersPanelCoreContent />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isError && (
              <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.'}
              </div>
            )}
            <div
              className={cn(
                'space-y-3 transition-opacity duration-300',
                isFetching && !isLoading ? 'opacity-60' : 'opacity-100'
              )}
              style={{ minHeight: `${listMinHeight}px` }}
            >
              {isLoading ? (
                <div
                  className="flex justify-center items-center pt-10"
                  style={{ height: `${listMinHeight}px` }}
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user: UserSearchResult) => (
                  <UserSearchCard
                    key={user.id}
                    user={user}
                    onAddFriend={handleAddFriend}
                    isAddingFriend={isSendingRequest && actionInProgressUserId === user.id}
                  />
                ))
              ) : !isError && !isLoading ? (
                <div
                  className="flex justify-center items-center pt-10 text-muted-foreground"
                  style={{ height: `${listMinHeight}px` }}
                >
                  Keine Benutzer gefunden. Ändern Sie die Filter oder den Suchbegriff.
                </div>
              ) : null}
            </div>
            {!isLoading && !isError && searchData && searchData.totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                      disabled={paginationInfo.isFirst || isFetching}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 py-2 text-sm font-medium">
                      Seite {paginationInfo.currentPage + 1} von {paginationInfo.totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                      disabled={paginationInfo.isLast || isFetching}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-[2.5rem] p-4 border rounded-lg bg-card shadow-sm">
              <h2 className="text-xl font-semibold border-b pb-3 mb-4">Filterung</h2>
              <FiltersPanelCoreContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindFriendsPage;

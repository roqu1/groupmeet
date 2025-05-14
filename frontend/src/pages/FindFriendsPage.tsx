import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { useDebounce } from '@/hooks/useDebounce';
import { useInterestOptions } from '@/hooks/options/useInterestOptions';
import UserSearchFiltersPanel, { GenderSelection } from '@/components/users/UserSearchFiltersPanel';

const DEFAULT_PAGE_SIZE = 5;

const initialUiFiltersState: {
  genders: GenderSelection;
  location: string;
  interests: string[];
  searchTerm: string;
} = {
  genders: { MALE: false, FEMALE: false, DIVERS: false },
  location: '',
  interests: [],
  searchTerm: '',
};

const buildActualSearchParams = (
  currentSearchTerm: string,
  currentGenders: GenderSelection,
  currentLocation: string,
  currentInterests: string[],
  currentPageForApi: number
): SearchUsersParams => {
  const params: SearchUsersParams = {
    page: currentPageForApi,
    size: DEFAULT_PAGE_SIZE,
    searchTerm: currentSearchTerm.trim() || undefined,
    genders: (Object.keys(currentGenders) as Array<keyof GenderSelection>)
      .filter((key) => currentGenders[key])
      .map((key) => key.toUpperCase() as Gender),
    location: currentLocation || undefined,
    interests: currentInterests.length > 0 ? currentInterests : undefined,
  };
  Object.keys(params).forEach((keyStr) => {
    const key = keyStr as keyof SearchUsersParams;
    if (
      params[key] === undefined ||
      (Array.isArray(params[key]) && (params[key] as unknown[]).length === 0)
    ) {
      delete params[key];
    }
  });
  return params;
};

const FindFriendsPage = () => {
  const [uiSearchTerm, setUiSearchTerm] = useState(initialUiFiltersState.searchTerm);
  const [uiSelectedGenders, setUiSelectedGenders] = useState<GenderSelection>(
    initialUiFiltersState.genders
  );
  const [uiSelectedLocation, setUiSelectedLocation] = useState<string>(
    initialUiFiltersState.location
  );
  const [uiSelectedInterests, setUiSelectedInterests] = useState<string[]>(
    initialUiFiltersState.interests
  );

  const debouncedUiSearchTerm = useDebounce(uiSearchTerm, 500);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [appliedSearchParams, setAppliedSearchParams] = useState<SearchUsersParams>(() => {
    return buildActualSearchParams(
      initialUiFiltersState.searchTerm,
      initialUiFiltersState.genders,
      initialUiFiltersState.location,
      initialUiFiltersState.interests,
      0
    );
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    data: searchData,
    isLoading: isLoadingSearchData,
    isFetching: isFetchingSearchData,
    isError: isErrorSearch,
    error: searchError,
  } = useUserSearch(appliedSearchParams, true);

  const {
    data: interestOptionsData,
    isLoading: isLoadingInterests,
    isError: isErrorInterests,
  } = useInterestOptions();
  const interestOptions = useMemo(() => interestOptionsData || [], [interestOptionsData]);

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

  useEffect(() => {
    if (interestOptions.length > 0 && uiSelectedInterests.length > 0) {
      const valid = uiSelectedInterests.filter((si) =>
        interestOptions.some((opt) => opt.value === si)
      );
      if (valid.length !== uiSelectedInterests.length) {
        setUiSelectedInterests(valid);
      }
    }
  }, [interestOptions, uiSelectedInterests]);

  useEffect(() => {
    const newDebouncedTrimmedSearchTerm = debouncedUiSearchTerm.trim();
    const currentAppliedSearchTerm = appliedSearchParams?.searchTerm || '';

    if (newDebouncedTrimmedSearchTerm !== currentAppliedSearchTerm) {
      const newParams = buildActualSearchParams(
        newDebouncedTrimmedSearchTerm,
        uiSelectedGenders,
        uiSelectedLocation,
        uiSelectedInterests,
        0
      );
      setAppliedSearchParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUiSearchTerm]);

  const handleGenderChange = useCallback((genderId: Gender, checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      setUiSelectedGenders((prev) => ({ ...prev, [genderId]: checked }));
    }
  }, []);

  const stableSetUiSelectedLocation = useCallback(
    (value: string) => setUiSelectedLocation(value),
    []
  );

  const handleApplyFiltersAndSearch = useCallback(() => {
    const newParams = buildActualSearchParams(
      uiSearchTerm,
      uiSelectedGenders,
      uiSelectedLocation,
      uiSelectedInterests,
      0
    );
    setAppliedSearchParams(newParams);
    if (window.innerWidth < 1024) setIsFiltersOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [uiSearchTerm, uiSelectedGenders, uiSelectedLocation, uiSelectedInterests]);

  const handleResetFilters = useCallback(() => {
    setUiSearchTerm(initialUiFiltersState.searchTerm);
    setUiSelectedGenders(initialUiFiltersState.genders);
    setUiSelectedLocation(initialUiFiltersState.location);
    setUiSelectedInterests(initialUiFiltersState.interests);

    const resetParams = buildActualSearchParams(
      initialUiFiltersState.searchTerm,
      initialUiFiltersState.genders,
      initialUiFiltersState.location,
      initialUiFiltersState.interests,
      0
    );
    setAppliedSearchParams(resetParams);
    if (window.innerWidth < 1024) setIsFiltersOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 0 &&
      newPage < (paginationInfo.totalPages || 1) &&
      newPage !== paginationInfo.currentPage
    ) {
      const newParams = buildActualSearchParams(
        uiSearchTerm,
        uiSelectedGenders,
        uiSelectedLocation,
        uiSelectedInterests,
        newPage
      );
      setAppliedSearchParams(newParams);
    }
  };

  const handleAddFriend = (userId: number) => {
    if (actionInProgressUserId === userId || isSendingRequest) return;
    setActionInProgressUserId(userId);
    sendFriendRequestMutate(userId);
  };

  const MIN_LIST_HEIGHT_REM = DEFAULT_PAGE_SIZE * 5;
  const listMinHeight = searchResults.length > 0 ? 'auto' : `${MIN_LIST_HEIGHT_REM}rem`;

  const isSearchInputDisabled = isLoadingSearchData || isLoadingInterests;
  const areOtherFiltersDisabled = isFetchingSearchData || isLoadingInterests;

  return (
    <div className="container-wrapper py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Finde neue Freunde</h1>
      <div className="flex flex-col gap-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Suchen nach Benutzername, Vorname, Nachname..."
            className="pl-9 w-full"
            value={uiSearchTerm}
            onChange={(e) => setUiSearchTerm(e.target.value)}
            disabled={isSearchInputDisabled}
          />
        </div>

        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-expanded={isFiltersOpen}
            aria-controls="filters-panel-mobile"
            disabled={areOtherFiltersDisabled}
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
              <UserSearchFiltersPanel
                uiSelectedGenders={uiSelectedGenders}
                handleGenderChange={handleGenderChange}
                uiSelectedLocation={uiSelectedLocation}
                setUiSelectedLocation={stableSetUiSelectedLocation}
                uiSelectedInterests={uiSelectedInterests}
                setUiSelectedInterests={setUiSelectedInterests}
                interestOptions={interestOptions}
                isLoadingInterests={isLoadingInterests}
                isErrorInterests={isErrorInterests}
                isUIDisabled={areOtherFiltersDisabled}
                onApplyFilters={handleApplyFiltersAndSearch}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isErrorSearch && !isLoadingSearchData && (
              <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                {searchError instanceof Error
                  ? searchError.message
                  : 'Ein unbekannter Fehler ist aufgetreten.'}
              </div>
            )}
            <div
              className={cn(
                'space-y-3 transition-opacity duration-300',
                isFetchingSearchData && !isLoadingSearchData ? 'opacity-60' : 'opacity-100'
              )}
              style={{ minHeight: listMinHeight }}
            >
              {isLoadingSearchData ? (
                <div
                  className="flex justify-center items-center pt-10"
                  style={{ height: listMinHeight }}
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
              ) : !isErrorSearch ? (
                <div
                  className="flex justify-center items-center pt-10 text-muted-foreground"
                  style={{ height: listMinHeight }}
                >
                  Keine Benutzer gefunden. Ändern Sie die Filter oder den Suchbegriff.
                </div>
              ) : null}
            </div>
            {!isLoadingSearchData && !isErrorSearch && searchData && searchData.totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                      disabled={paginationInfo.isFirst || isFetchingSearchData}
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
                      disabled={paginationInfo.isLast || isFetchingSearchData}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-[calc(theme(space.14)_+_1rem)] p-4 border rounded-lg bg-card shadow-sm">
              <h2 className="text-xl font-semibold border-b pb-3 mb-4">Filterung</h2>
              <UserSearchFiltersPanel
                uiSelectedGenders={uiSelectedGenders}
                handleGenderChange={handleGenderChange}
                uiSelectedLocation={uiSelectedLocation}
                setUiSelectedLocation={stableSetUiSelectedLocation}
                uiSelectedInterests={uiSelectedInterests}
                setUiSelectedInterests={setUiSelectedInterests}
                interestOptions={interestOptions}
                isLoadingInterests={isLoadingInterests}
                isErrorInterests={isErrorInterests}
                isUIDisabled={areOtherFiltersDisabled}
                onApplyFilters={handleApplyFiltersAndSearch}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindFriendsPage;

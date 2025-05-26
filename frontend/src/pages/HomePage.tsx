import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import CreateMeetingDialog from '@/components/meetings/CreateMeetingDialog';
import MeetingCard from '@/components/meetings/MeetingCard';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { MeetingsSearchParams, MeetingCardData, MeetingFormat } from '@/types/meeting';
import { useMeetingsSearch } from '@/hooks/meetings/useMeetingsSearch';
import MeetingsFilterPanel from '@/components/meetings/MeetingsFilterPanel';
import { useInterestOptions } from '@/hooks/options/useInterestOptions';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';

const DEFAULT_PAGE_SIZE = 6;
const MIN_CARD_LIST_HEIGHT_PX = 400;

const initialUiFiltersState: {
  art: string[];
  location: string;
  format: MeetingFormat | '';
  startDate?: Date;
  endDate?: Date;
} = {
  art: [],
  location: '',
  format: '',
  startDate: undefined,
  endDate: undefined,
};

const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HomePage = () => {
  const [uiSearchTerm, setUiSearchTerm] = useState('');
  const debouncedUiSearchTerm = useDebounce(uiSearchTerm, 500);

  const [uiSelectedArt, setUiSelectedArt] = useState<string[]>(initialUiFiltersState.art);
  const [uiSelectedLocation, setUiSelectedLocation] = useState<string>(
    initialUiFiltersState.location
  );
  const [uiSelectedFormat, setUiSelectedFormat] = useState<MeetingFormat | ''>(
    initialUiFiltersState.format
  );
  const [uiStartDate, setUiStartDate] = useState<Date | undefined>(initialUiFiltersState.startDate);
  const [uiEndDate, setUiEndDate] = useState<Date | undefined>(initialUiFiltersState.endDate);

  const [appliedSearchParams, setAppliedSearchParams] = useState<MeetingsSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  });

  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const initialLoadRef = useRef(true);

  const {
    data: meetingsPageData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useMeetingsSearch(appliedSearchParams, true);

  const {
    data: interestOptionsData,
    isLoading: isLoadingInterests,
    isError: isErrorInterests,
  } = useInterestOptions();
  const interestOptions = useMemo(() => interestOptionsData || [], [interestOptionsData]);

  const searchResults = useMemo(() => meetingsPageData?.content ?? [], [meetingsPageData]);
  const paginationInfo = useMemo(
    () => ({
      currentPage: meetingsPageData?.number ?? 0,
      totalPages: meetingsPageData?.totalPages ?? 0,
      isFirst: meetingsPageData?.first ?? true,
      isLast: meetingsPageData?.last ?? true,
    }),
    [meetingsPageData]
  );

  const buildAndSetAppliedSearchParams = useCallback(
    (
      page: number,
      searchTerm: string,
      art: string[],
      location: string,
      format: MeetingFormat | '',
      startDate?: Date,
      endDate?: Date
    ) => {
      const params: MeetingsSearchParams = {
        page,
        size: DEFAULT_PAGE_SIZE,
        searchTerm: searchTerm.trim() || undefined,
        types: art.length > 0 ? art : undefined,
        location: location || undefined,
        format: format || undefined,
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      };
      const cleanedParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)
        )
      ) as MeetingsSearchParams;
      setAppliedSearchParams(cleanedParams);
    },
    []
  );

  useEffect(() => {
    if (!initialLoadRef.current) {
      buildAndSetAppliedSearchParams(
        0,
        debouncedUiSearchTerm,
        uiSelectedArt,
        uiSelectedLocation,
        uiSelectedFormat,
        uiStartDate,
        uiEndDate
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUiSearchTerm]);

  useEffect(() => {
    if (initialLoadRef.current) {
      buildAndSetAppliedSearchParams(
        0,
        uiSearchTerm,
        uiSelectedArt,
        uiSelectedLocation,
        uiSelectedFormat,
        uiStartDate,
        uiEndDate
      );
      initialLoadRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = useCallback(() => {
    buildAndSetAppliedSearchParams(
      0,
      uiSearchTerm,
      uiSelectedArt,
      uiSelectedLocation,
      uiSelectedFormat,
      uiStartDate,
      uiEndDate
    );
    if (window.innerWidth < 1024) setIsFiltersPanelOpen(false);
  }, [
    buildAndSetAppliedSearchParams,
    uiSearchTerm,
    uiSelectedArt,
    uiSelectedLocation,
    uiSelectedFormat,
    uiStartDate,
    uiEndDate,
  ]);

  const handleResetFilters = useCallback(() => {
    setUiSearchTerm('');
    setUiSelectedArt(initialUiFiltersState.art);
    setUiSelectedLocation(initialUiFiltersState.location);
    setUiSelectedFormat(initialUiFiltersState.format);
    setUiStartDate(initialUiFiltersState.startDate);
    setUiEndDate(initialUiFiltersState.endDate);
    buildAndSetAppliedSearchParams(
      0,
      '',
      initialUiFiltersState.art,
      initialUiFiltersState.location,
      initialUiFiltersState.format,
      initialUiFiltersState.startDate,
      initialUiFiltersState.endDate
    );
    if (window.innerWidth < 1024) setIsFiltersPanelOpen(false);
  }, [buildAndSetAppliedSearchParams]);

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 0 &&
      newPage < (paginationInfo.totalPages || 1) &&
      newPage !== paginationInfo.currentPage
    ) {
      buildAndSetAppliedSearchParams(
        newPage,
        uiSearchTerm,
        uiSelectedArt,
        uiSelectedLocation,
        uiSelectedFormat,
        uiStartDate,
        uiEndDate
      );
    }
  };

  const isAnyFilterActive = useMemo(() => {
    return (
      uiSearchTerm.trim() !== '' ||
      uiSelectedArt.length > 0 ||
      uiSelectedLocation !== '' ||
      uiSelectedFormat !== '' ||
      uiStartDate !== undefined ||
      uiEndDate !== undefined
    );
  }, [uiSearchTerm, uiSelectedArt, uiSelectedLocation, uiSelectedFormat, uiStartDate, uiEndDate]);

  const stableSetUiSelectedLocation = useCallback(
    (value: string) => setUiSelectedLocation(value),
    []
  );
  const stableSetUiSelectedFormat = useCallback(
    (value: MeetingFormat | '') => setUiSelectedFormat(value),
    []
  );
  const stableSetUiStartDate = useCallback((date?: Date) => setUiStartDate(date), []);
  const stableSetUiEndDate = useCallback((date?: Date) => setUiEndDate(date), []);

  return (
    <div className="container-wrapper py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 lg:mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground text-center sm:text-left">
          Finde passende Meetings
        </h1>
        <CreateMeetingDialog />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>{' '}
            <Input
              type="search"
              placeholder="Meetings nach Titel oder Beschreibung suchen..."
              className="pl-9 w-full"
              value={uiSearchTerm}
              onChange={(e) => setUiSearchTerm(e.target.value)}
            />
          </div>
          <div className="lg:hidden">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between mb-4"
              onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
              aria-expanded={isFiltersPanelOpen}
              aria-controls="filters-panel-mobile"
              disabled={isFetching || isLoadingInterests}
            >
              <div className="flex items-center">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filterung
              </div>
              {isFiltersPanelOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {isFiltersPanelOpen && (
              <div id="filters-panel-mobile" className="p-4 border rounded-lg bg-card shadow-sm">
                <MeetingsFilterPanel
                  uiSelectedArt={uiSelectedArt}
                  setUiSelectedArt={setUiSelectedArt}
                  uiSelectedLocation={uiSelectedLocation}
                  setUiSelectedLocation={stableSetUiSelectedLocation}
                  uiSelectedFormat={uiSelectedFormat}
                  setUiSelectedFormat={stableSetUiSelectedFormat}
                  uiStartDate={uiStartDate}
                  setUiStartDate={stableSetUiStartDate}
                  uiEndDate={uiEndDate}
                  setUiEndDate={stableSetUiEndDate}
                  interestOptions={interestOptions}
                  isLoadingInterests={isLoadingInterests}
                  isErrorInterests={isErrorInterests}
                  isUIDisabled={isFetching || isLoadingInterests}
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters}
                />
              </div>
            )}
          </div>
          {isError && !isLoading && (
            <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.'}
            </div>
          )}
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px] transition-opacity duration-300',
              isFetching && !isLoading ? 'opacity-60' : 'opacity-100'
            )}
            style={{ minHeight: `${MIN_CARD_LIST_HEIGHT_PX}px` }}
          >
            {isLoading && !meetingsPageData ? (
              <div className="md:col-span-2 flex justify-center items-center pt-10 min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((meeting: MeetingCardData) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            ) : !isError && !isFetching ? (
              <div className="md:col-span-2 flex justify-center items-center pt-10 text-muted-foreground min-h-[300px] text-center">
                {isAnyFilterActive
                  ? 'Keine Meetings für die aktuellen Filter gefunden. Versuchen Sie, Ihre Suche anzupassen.'
                  : 'Derzeit sind keine Meetings verfügbar. Erstellen Sie das erste!'}
              </div>
            ) : null}
          </div>
          {!isLoading && !isError && meetingsPageData && meetingsPageData.totalPages > 1 && (
            <Pagination className="mt-8">
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
          <div className="sticky top-[calc(theme(space.14)_+_2rem)] p-4 border rounded-lg bg-card shadow-sm">
            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Filterung</h2>
            <MeetingsFilterPanel
              uiSelectedArt={uiSelectedArt}
              setUiSelectedArt={setUiSelectedArt}
              uiSelectedLocation={uiSelectedLocation}
              setUiSelectedLocation={stableSetUiSelectedLocation}
              uiSelectedFormat={uiSelectedFormat}
              setUiSelectedFormat={stableSetUiSelectedFormat}
              uiStartDate={uiStartDate}
              setUiStartDate={stableSetUiStartDate}
              uiEndDate={uiEndDate}
              setUiEndDate={stableSetUiEndDate}
              interestOptions={interestOptions}
              isLoadingInterests={isLoadingInterests}
              isErrorInterests={isErrorInterests}
              isUIDisabled={isFetching || isLoadingInterests}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;

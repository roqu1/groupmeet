import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
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
import { LOCATION_OPTIONS } from '@/config/options';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { MeetingsSearchParams, MeetingCardData } from '@/types/meeting';
import { useMeetingsSearch } from '@/hooks/meetings/useMeetingsSearch';

const artOptions: MultiSelectOption[] = [
  { value: 'sport', label: 'Sport' },
  { value: 'kunst', label: 'Kunst' },
  { value: 'musik', label: 'Musik' },
  { value: 'lernen', label: 'Lernen' },
  { value: 'technologie', label: 'Technologie' },
];
const formatOptions: ComboboxOption[] = [
  { value: 'OFFLINE', label: 'Vor Ort' },
  { value: 'ONLINE', label: 'Online' },
];

const DEFAULT_PAGE_SIZE = 10;
const MIN_CARD_LIST_HEIGHT_PX = 400;

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArt, setSelectedArt] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [activeSearchParams, setActiveSearchParams] = useState<MeetingsSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  });

  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const initialSearchDone = useRef(false);

  const {
    data: meetingsPageData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useMeetingsSearch(activeSearchParams);

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

  const initialUiFiltersState = useMemo(
    () => ({
      searchTerm: '',
      art: [],
      location: '',
      format: '',
      startDate: undefined,
      endDate: undefined,
    }),
    []
  );

  const triggerMeetingSearch = useCallback(
    (
      currentPage: number,
      currentSearchTerm: string,
      currentSelectedArt: string[],
      currentSelectedLocation: string,
      currentSelectedFormat: string,
      currentStartDate?: Date,
      currentEndDate?: Date
    ) => {
      const params: MeetingsSearchParams = {
        page: currentPage,
        size: DEFAULT_PAGE_SIZE,
        searchTerm: currentSearchTerm.trim() || undefined,
        types: currentSelectedArt.length > 0 ? currentSelectedArt : undefined,
        location: currentSelectedLocation || undefined,
        format: currentSelectedFormat
          ? (currentSelectedFormat.toUpperCase() as 'ONLINE' | 'OFFLINE')
          : undefined,
        startDate: currentStartDate ? currentStartDate.toISOString().split('T')[0] : undefined,
        endDate: currentEndDate ? currentEndDate.toISOString().split('T')[0] : undefined,
      };
      const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && !(Array.isArray(value) && value.length === 0)) {
          if (key === 'format' && value === '') {
            /*This condition is intentionally left blank because we do not want to add an empty format*/
          } else {
            acc[key as keyof MeetingsSearchParams] = value;
          }
        }
        return acc;
      }, {} as MeetingsSearchParams);
      setActiveSearchParams(cleanedParams);
    },
    [setActiveSearchParams]
  );

  const handleApplyFilters = () => {
    triggerMeetingSearch(
      0,
      searchTerm,
      selectedArt,
      selectedLocation,
      selectedFormat,
      startDate,
      endDate
    );
    if (window.innerWidth < 1024) setIsFiltersPanelOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm(initialUiFiltersState.searchTerm);
    setSelectedArt(initialUiFiltersState.art);
    setSelectedLocation(initialUiFiltersState.location);
    setSelectedFormat(initialUiFiltersState.format);
    setStartDate(initialUiFiltersState.startDate);
    setEndDate(initialUiFiltersState.endDate);
    triggerMeetingSearch(
      0,
      initialUiFiltersState.searchTerm,
      initialUiFiltersState.art,
      initialUiFiltersState.location,
      initialUiFiltersState.format,
      initialUiFiltersState.startDate,
      initialUiFiltersState.endDate
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < paginationInfo.totalPages) {
      setActiveSearchParams((prevParams) => ({ ...prevParams, page: newPage }));
    }
  };

  useEffect(() => {
    if (!initialSearchDone.current) {
      triggerMeetingSearch(
        0,
        initialUiFiltersState.searchTerm,
        initialUiFiltersState.art,
        initialUiFiltersState.location,
        initialUiFiltersState.format,
        initialUiFiltersState.startDate,
        initialUiFiltersState.endDate
      );
      initialSearchDone.current = true;
    }
  }, []);

  useEffect(() => {
    if (
      initialSearchDone.current &&
      searchTerm === '' &&
      activeSearchParams.searchTerm &&
      activeSearchParams.searchTerm !== ''
    ) {
      triggerMeetingSearch(
        0,
        '',
        selectedArt,
        selectedLocation,
        selectedFormat,
        startDate,
        endDate
      );
    }
  }, [
    searchTerm,
    selectedArt,
    selectedLocation,
    selectedFormat,
    startDate,
    endDate,
    triggerMeetingSearch,
    activeSearchParams.searchTerm,
  ]);

  const FiltersPanelContent = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="filter-art">Art</Label>
        <MultiSelect
          id="filter-art"
          options={artOptions}
          selected={selectedArt}
          onValueChange={setSelectedArt}
          placeholder="Art wählen..."
          disabled={isFetching}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="filter-location">Ort</Label>
        <Combobox
          id="filter-location"
          options={LOCATION_OPTIONS}
          value={selectedLocation}
          onSelect={setSelectedLocation}
          placeholder="Ort wählen..."
          disabled={isFetching}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="filter-format">Format</Label>
        <Select
          value={selectedFormat || 'ALL_FORMATS_PLACEHOLDER'}
          onValueChange={(value) => {
            if (value === 'ALL_FORMATS_PLACEHOLDER') {
              setSelectedFormat('');
            } else {
              setSelectedFormat(value);
            }
          }}
          disabled={isFetching}
        >
          <SelectTrigger id="filter-format" className="mt-1">
            <SelectValue placeholder="Format wählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_FORMATS_PLACEHOLDER">Alle Formate</SelectItem>
            {formatOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label htmlFor="filter-start-date" className="block text-sm font-medium mb-1">
            Start Datum
          </Label>
          <SimpleDatePicker
            id="filter-start-date"
            selectedDate={startDate}
            onDateChange={setStartDate}
            disabled={isFetching || (endDate ? !!(startDate && startDate > endDate) : false)}
          />
        </div>
        <div>
          <Label htmlFor="filter-end-date" className="block text-sm font-medium mb-1">
            End Datum
          </Label>
          <SimpleDatePicker
            id="filter-end-date"
            selectedDate={endDate}
            onDateChange={setEndDate}
            disabled={isFetching || (startDate ? !!(endDate && endDate < startDate) : false)}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
        <Button onClick={handleApplyFilters} className="flex-1" disabled={isFetching}>
          Speichern
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
      <div className="flex justify-between items-center mb-6 lg:mb-8">
        <h1 className="text-3xl font-bold text-foreground">Finde passende Meetings</h1>
        <CreateMeetingDialog formatOptions={formatOptions} artOptions={artOptions} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Meetings nach Titel oder Beschreibung suchen..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              disabled={isFetching}
            />
          </div>
          <div className="lg:hidden">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between mb-4"
              onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
              aria-expanded={isFiltersPanelOpen}
              aria-controls="filters-panel-mobile"
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
                <FiltersPanelContent />
              </div>
            )}
          </div>
          {isError && (
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
            {isLoading ? (
              <div className="md:col-span-2 flex justify-center items-center pt-10 min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((meeting: MeetingCardData) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            ) : !isError && !isLoading ? (
              <div className="md:col-span-2 flex justify-center items-center pt-10 text-muted-foreground min-h-[300px]">
                Keine Meetings gefunden. Ändern Sie die Filterkriterien.
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
          <div className="sticky top-[6.5rem] p-4 border rounded-lg bg-card shadow-sm">
            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Filterung</h2>
            <FiltersPanelContent />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;

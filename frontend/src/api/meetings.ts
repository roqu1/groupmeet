import { MeetingsSearchPage, MeetingsSearchParams, MeetingCardData } from '../types/meeting';

const DEFAULT_API_PAGE_SIZE = 10;

const ALL_MOCK_MEETINGS_DATA: MeetingCardData[] = [
  {
    id: 'm1',
    title: 'React Advanced Workshop',
    shortDescription:
      'Tiefere Einblicke in React Hooks und State Management. Längerer Text um Abschnitt zu testen.',
    format: 'ONLINE',
    type: 'Technologie',
    participantCount: 18,
    maxParticipants: 25,
  },
  {
    id: 'm2',
    title: 'Yoga am Morgen im Park',
    shortDescription: 'Starte den Tag entspannt mit einer Yoga-Session im Freien.',
    format: 'OFFLINE',
    type: 'Sport',
    participantCount: 12,
    maxParticipants: 20,
  },
  {
    id: 'm3',
    title: 'Aquarellmalerei für Anfänger',
    shortDescription: 'Entdecke deine kreative Seite und lerne die Grundlagen der Aquarelltechnik.',
    format: 'OFFLINE',
    type: 'Kunst',
    participantCount: 7,
    maxParticipants: 15,
  },
  {
    id: 'm4',
    title: 'Node.js Backend Konferenz Online',
    shortDescription:
      'Spannende Vorträge von internationalen Experten über serverseitiges JavaScript und neue Frameworks.',
    format: 'ONLINE',
    type: 'Technologie',
    participantCount: 150,
    maxParticipants: 300,
  },
  {
    id: 'm5',
    title: 'Fußballspiel im Bürgerpark',
    shortDescription:
      'Lockeres Kickchen für alle Fußballbegeisterten am Wochenende. Treffpunkt am Haupteingang.',
    format: 'OFFLINE',
    type: 'Sport',
    participantCount: 22,
    maxParticipants: 30,
  },
  {
    id: 'm6',
    title: 'Konzert: Indie-Band "The Devs"',
    shortDescription:
      'Live-Musik und gute Stimmung garantiert. Ein Muss für alle Fans guter Gitarrenriffs.',
    format: 'OFFLINE',
    type: 'Musik',
    participantCount: 88,
    maxParticipants: 150,
  },
  {
    id: 'm7',
    title: 'Online Spanisch lernen A1',
    shortDescription: 'Grundkurs Spanisch für Anfänger ohne Vorkenntnisse.',
    format: 'ONLINE',
    type: 'Lernen',
    participantCount: 15,
    maxParticipants: 20,
  },
  {
    id: 'm8',
    title: 'Fotografie-Workshop: Porträts',
    shortDescription: 'Lerne, ausdrucksstarke Porträts zu erstellen.',
    format: 'OFFLINE',
    type: 'Kunst',
    participantCount: 8,
    maxParticipants: 10,
  },
  {
    id: 'm9',
    title: 'Meditationsabend',
    shortDescription: 'Finde innere Ruhe und Ausgeglichenheit.',
    format: 'ONLINE',
    type: 'Gesundheit',
    participantCount: 30,
  },
  {
    id: 'm10',
    title: 'Brettspiel-Treff',
    shortDescription: 'Gemütlicher Abend mit spannenden Brettspielen.',
    format: 'OFFLINE',
    type: 'Spiele',
    participantCount: 10,
    maxParticipants: 16,
  },
  {
    id: 'm11',
    title: 'Webinar: Agile Methoden',
    shortDescription: 'Einführung in Scrum und Kanban für Projektmanagement.',
    format: 'ONLINE',
    type: 'Lernen',
    participantCount: 50,
  },
  {
    id: 'm12',
    title: 'Kunstausstellung: Moderne Skulpturen',
    shortDescription: 'Besuch der aktuellen Ausstellung lokaler Künstler.',
    format: 'OFFLINE',
    type: 'Kunst',
    participantCount: 13,
    maxParticipants: 25,
  },
];

const ALL_MOCK_MEETINGS_WITH_FILTER_DATA = ALL_MOCK_MEETINGS_DATA.map((meeting, index) => ({
  ...meeting,
  location:
    meeting.id === 'm2' || meeting.id === 'm5'
      ? 'Bremen'
      : meeting.id === 'm3' || meeting.id === 'm9'
        ? 'Hamburg'
        : meeting.id === 'm6'
          ? 'Berlin'
          : meeting.id === 'm8'
            ? 'München'
            : meeting.id === 'm10'
              ? 'Köln'
              : meeting.id === 'm12'
                ? 'Frankfurt'
                : ['Berlin', 'Hamburg', 'München'][index % 3],
}));

export const fetchMeetings = async (
  params: MeetingsSearchParams = {}
): Promise<MeetingsSearchPage> => {
  const {
    page = 0,
    size = DEFAULT_API_PAGE_SIZE,
    searchTerm = '',
    types = [],
    location = '',
    format,
    startDate,
    endDate,
  } = params;

  console.log(
    '[API STUB meetings] Calling fetchMeetings with params:',
    JSON.parse(JSON.stringify(params))
  );
  await new Promise((resolve) => setTimeout(resolve, 600));

  let filteredMeetings = ALL_MOCK_MEETINGS_WITH_FILTER_DATA;

  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.trim().toLowerCase();
    filteredMeetings = filteredMeetings.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerSearch) ||
        m.shortDescription.toLowerCase().includes(lowerSearch)
    );
  }
  if (types.length > 0) {
    const lowerTypes = types.map((t) => t.toLowerCase());
    filteredMeetings = filteredMeetings.filter((m) => lowerTypes.includes(m.type.toLowerCase()));
  }
  if (location) {
    filteredMeetings = filteredMeetings.filter(
      (m) => m.location?.toLowerCase() === location.toLowerCase()
    );
  }
  if (format) {
    filteredMeetings = filteredMeetings.filter((m) => m.format === format);
  }
  if (startDate)
    console.log(
      `[API STUB meetings] Filtering by startDate >= ${startDate} (not implemented in stub)`
    );
  if (endDate)
    console.log(`[API STUB meetings] Filtering by endDate <= ${endDate} (not implemented in stub)`);

  console.log(
    `[API STUB meetings] Filtered meetings count before pagination: ${filteredMeetings.length}`
  );

  const totalElements = filteredMeetings.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = page * size;
  const content: MeetingCardData[] = filteredMeetings
    .slice(startIndex, startIndex + size)
    .map((m) => ({
      id: m.id,
      title: m.title,
      shortDescription: m.shortDescription,
      format: m.format,
      type: m.type,
      participantCount: m.participantCount,
      maxParticipants: m.maxParticipants,
      imageUrl: m.imageUrl,
    }));

  const mockPage: MeetingsSearchPage = {
    content,
    totalPages,
    totalElements,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1 || totalPages === 0,
    empty: content.length === 0,
  };
  console.log(
    `[API STUB meetings] Returning page ${page + 1}/${totalPages}, items: ${content.length}`
  );
  return Promise.resolve(mockPage);
};

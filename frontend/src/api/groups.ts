import {
  GroupDetails,
  GroupParticipant,
  GroupMembershipStatus,
  GroupParticipantsData,
  FetchGroupParticipantsParams,
  GroupParticipantActionResponse,
  Gender,
} from '../types/group';
import { Page } from '../types/pagination';

const mockOrganizerBase: Omit<GroupParticipant, 'isOrganizer' | 'gender'> = {
  id: 103,
  username: 'react_fan',
  firstName: 'Lukas',
  lastName: 'Müller',
  avatarUrl: 'https://i.pravatar.cc/40?u=lukas',
};

const ALL_POSSIBLE_PARTICIPANTS_BASE: Omit<GroupParticipant, 'isOrganizer' | 'gender'>[] = [
  {
    id: 1,
    username: 'sergeip',
    firstName: 'Sergei',
    lastName: 'Pron',
    avatarUrl: 'https://i.pravatar.cc/40?u=sergei',
  },
  { id: 101, username: 'cool_cat', firstName: 'Felix', lastName: 'Meier', avatarUrl: null },
  {
    id: 102,
    username: 'js_guru',
    firstName: 'Anna',
    lastName: 'Schmidt',
    avatarUrl: 'https://i.pravatar.cc/40?u=anna',
  },
  {
    id: 103,
    username: 'react_fan',
    firstName: 'Lukas',
    lastName: 'Müller',
    avatarUrl: 'https://i.pravatar.cc/40?u=lukas',
  },
  {
    id: 104,
    username: 'test_user_4',
    firstName: 'Sophia',
    lastName: 'Weber',
    avatarUrl: 'https://i.pravatar.cc/40?u=sophia',
  },
  { id: 105, username: 'another_one', firstName: 'Max', lastName: 'Bauer', avatarUrl: null },
  {
    id: 106,
    username: 'db_expert',
    firstName: 'David',
    lastName: 'Wagner',
    avatarUrl: 'https://i.pravatar.cc/40?u=david',
  },
  {
    id: 107,
    username: 'css_wizard',
    firstName: 'Marie',
    lastName: 'Becker',
    avatarUrl: 'https://i.pravatar.cc/40?u=marie',
  },
  { id: 108, username: 'node_ninja', firstName: 'Jonas', lastName: 'Hoffmann', avatarUrl: null },
  {
    id: 109,
    username: 'ux_queen',
    firstName: 'Lea',
    lastName: 'Schäfer',
    avatarUrl: 'https://i.pravatar.cc/40?u=lea',
  },
  {
    id: 110,
    username: 'java_jedi',
    firstName: 'Finn',
    lastName: 'Koch',
    avatarUrl: 'https://i.pravatar.cc/40?u=finn',
  },
  {
    id: 111,
    username: 'pythonista',
    firstName: 'Mia',
    lastName: 'Fischer',
    avatarUrl: 'https://i.pravatar.cc/40?u=mia',
  },
  { id: 112, username: 'docker_dan', firstName: 'Leon', lastName: 'Schneider', avatarUrl: null },
  {
    id: 113,
    username: 'cloud_carla',
    firstName: 'Clara',
    lastName: 'Meyer',
    avatarUrl: 'https://i.pravatar.cc/40?u=clara',
  },
  { id: 201, username: 'search_user_1', firstName: 'Hans', lastName: 'Zimmer', avatarUrl: null },
  {
    id: 202,
    username: 'tester_abc',
    firstName: 'Petra',
    lastName: 'Pan',
    avatarUrl: 'https://i.pravatar.cc/40?u=petra',
  },
  { id: 203, username: 'user203', firstName: 'User', lastName: 'Three', avatarUrl: null },
  {
    id: 204,
    username: 'user204',
    firstName: 'User',
    lastName: 'Four',
    avatarUrl: 'https://i.pravatar.cc/40?u=user204',
  },
  { id: 205, username: 'user205', firstName: 'User', lastName: 'Five', avatarUrl: null },
];

const mockGroupMembershipDB: Record<string, GroupMembershipStatus> = {
  '123': 'MEMBER',
  abc: 'NOT_MEMBER',
};

const MOCK_CURRENT_USER_ID = 103;

const createFullParticipant = (
  baseParticipant: Omit<GroupParticipant, 'isOrganizer' | 'gender'>,
  organizerIdForThisGroup: number
): GroupParticipant => {
  let gender: Gender;
  if (baseParticipant.id % 4 === 0) {
    gender = 'DIVERS';
  } else if (baseParticipant.id % 2 === 0) {
    gender = 'FEMALE';
  } else {
    gender = 'MALE';
  }

  return {
    ...baseParticipant,
    gender: gender,
    isOrganizer: baseParticipant.id === organizerIdForThisGroup,
  };
};

export const fetchGroupDetails = async (groupId: string): Promise<GroupDetails> => {
  console.log(`[API STUB] fetchGroupDetails called for ID: ${groupId}`);
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (groupId === 'error')
    throw new Error(`Gruppe mit ID "${groupId}" konnte nicht geladen werden (simulierter Fehler).`);
  if (groupId === 'notfound') throw new Error(`Gruppe mit ID "${groupId}" nicht gefunden.`);

  const actualOrganizerBaseData =
    groupId === '123' || groupId === 'abc' ? mockOrganizerBase : ALL_POSSIBLE_PARTICIPANTS_BASE[0];
  const actualOrganizer = createFullParticipant(
    actualOrganizerBaseData,
    actualOrganizerBaseData.id
  );
  actualOrganizer.isOrganizer = true;

  const isCurrentUserActualOrganizer = actualOrganizer.id === MOCK_CURRENT_USER_ID;
  let membershipStatus = mockGroupMembershipDB[groupId];
  if (isCurrentUserActualOrganizer) {
    membershipStatus = 'MEMBER';
  } else if (mockGroupMembershipDB[groupId] === undefined) {
    membershipStatus = 'NOT_MEMBER';
  }
  console.log(
    `[API STUB] For groupId ${groupId}, current user (${MOCK_CURRENT_USER_ID}) membership is: ${membershipStatus}, isCurrentUserActualOrganizer: ${isCurrentUserActualOrganizer}`
  );

  const groupParticipantsForPreview = ALL_POSSIBLE_PARTICIPANTS_BASE.filter(
    (p) => p.id !== 201 && p.id !== 202
  )
    .slice(0, 6)
    .map((p) => createFullParticipant(p, actualOrganizer.id));

  const groupData: GroupDetails = {
    id: groupId,
    name: `Tech Meetup #${groupId}`,
    description: `Willkommen beim Tech Meetup #${groupId}! Thema heute: Neueste Entwicklungen in der Web-Technologie.`,
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Innovationszentrum TechPark',
    address: 'Silicon Allee 1, 10115 Berlin',
    tags: ['WebDev', 'TypeScript', 'React', 'Node.js'],
    organizer: actualOrganizer,
    participantsPreview: groupParticipantsForPreview,
    totalParticipants: ALL_POSSIBLE_PARTICIPANTS_BASE.length - 5,
    currentUserMembership: membershipStatus,
    isCurrentUserOrganizer: isCurrentUserActualOrganizer,
  };
  return Promise.resolve(groupData);
};

export const fetchGroupParticipants = async ({
  groupId,
  page = 0,
  size = 10,
  searchTerm = '',
}: FetchGroupParticipantsParams): Promise<GroupParticipantsData> => {
  console.log(
    `[API STUB] Fetching participants for group ID: ${groupId}, page: ${page}, size: ${size}`
  );
  await new Promise((resolve) => setTimeout(resolve, 750));

  const actualOrganizerBaseData =
    groupId === '123' || groupId === 'abc' ? mockOrganizerBase : ALL_POSSIBLE_PARTICIPANTS_BASE[0];
  const isCurrentUserActualOrganizer = actualOrganizerBaseData.id === MOCK_CURRENT_USER_ID;
  const groupName = `Tech Meetup #${groupId}`;

  let allGroupParticipants: GroupParticipant[] = ALL_POSSIBLE_PARTICIPANTS_BASE.filter(
    (p) => p.id !== 205
  ).map((p) => createFullParticipant(p, actualOrganizerBaseData.id));

  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.trim().toLowerCase();
    console.log(`[API STUB] Applying searchTerm filter for participants: "${lowerSearch}"`);
    allGroupParticipants = allGroupParticipants.filter(
      (p) =>
        p.username.toLowerCase().includes(lowerSearch) ||
        p.firstName.toLowerCase().includes(lowerSearch) ||
        p.lastName.toLowerCase().includes(lowerSearch)
    );
  }

  const totalElements = allGroupParticipants.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = page * size;
  const content = allGroupParticipants.slice(startIndex, startIndex + size);

  const participantsPage: Page<GroupParticipant> = {
    content,
    totalPages,
    totalElements,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1 || totalPages === 0,
    empty: content.length === 0,
  };

  return Promise.resolve({
    participantsPage,
    isCurrentUserOrganizer: isCurrentUserActualOrganizer,
    groupName,
  });
};

export const joinGroup = async (groupId: string): Promise<{ message: string }> => {
  console.log(`[API STUB] Joining group ID: ${groupId}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  mockGroupMembershipDB[groupId] = 'MEMBER';
  console.log(`[API STUB] Group ${groupId} membership status in mock DB updated to MEMBER.`);
  return Promise.resolve({ message: 'Erfolgreich der Gruppe beigetreten!' });
};

export const leaveGroup = async (groupId: string): Promise<{ message: string }> => {
  console.log(`[API STUB] Leaving group ID: ${groupId}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  mockGroupMembershipDB[groupId] = 'NOT_MEMBER';
  console.log(`[API STUB] Group ${groupId} membership status in mock DB updated to NOT_MEMBER.`);
  return Promise.resolve({ message: 'Gruppe erfolgreich verlassen!' });
};

export const blockGroupParticipant = async (
  groupId: string,
  userId: number
): Promise<GroupParticipantActionResponse> => {
  console.log(`[API STUB] Blocking participant ID: ${userId} from group ID: ${groupId}`);
  await new Promise((resolve) => setTimeout(resolve, 700));
  return Promise.resolve({
    message: `Benutzer ${userId} erfolgreich für Gruppe ${groupId} gesperrt (simuliert).`,
  });
};

export const removeGroupParticipant = async (
  groupId: string,
  userId: number
): Promise<GroupParticipantActionResponse> => {
  console.log(`[API STUB] Removing participant ID: ${userId} from group ID: ${groupId}`);
  await new Promise((resolve) => setTimeout(resolve, 700));
  return Promise.resolve({
    message: `Benutzer ${userId} erfolgreich aus Gruppe ${groupId} entfernt (simuliert).`,
  });
};

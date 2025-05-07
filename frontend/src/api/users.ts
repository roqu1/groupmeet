// import { API_CONFIG } from '../config/api';
import {
  UserSearchPage,
  SearchUsersParams,
  UserSearchResult,
  FriendshipStatus,
  Gender,
} from '../types/user';
import { Friend } from '../types/friend';

const createMockUserSearchResult = (friend: Friend, index: number): UserSearchResult => {
  let status: FriendshipStatus = 'NONE';
  if (friend.id === 102 || friend.id === 103) status = 'FRIENDS';
  else if (friend.id === 106) status = 'REQUEST_SENT';
  else if (friend.id === 109) status = 'REQUEST_RECEIVED';

  let mockGender: Gender;
  const genderRoll = index % 4;
  if (genderRoll === 0) mockGender = 'MALE';
  else if (genderRoll === 1) mockGender = 'FEMALE';
  else if (genderRoll === 2) mockGender = 'DIVERS';
  else mockGender = 'MALE';

  return {
    id: friend.id,
    username: friend.username,
    firstName: friend.firstName,
    lastName: friend.lastName,
    avatarUrl: friend.avatarUrl,
    gender: mockGender,
    location: index % 3 === 0 ? 'Berlin' : index % 3 === 1 ? 'Hamburg' : null,
    age: 20 + (index % 15),
    interests: index % 4 === 0 ? ['sport', 'musik'] : index % 4 === 1 ? ['reisen'] : [],
    friendshipStatus: status,
  };
};

const MOCK_BASE_USERS: Friend[] = [
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
];

export const searchUsers = async (params: SearchUsersParams = {}): Promise<UserSearchPage> => {
  const {
    page = 0,
    size = 5,
    searchTerm = '',
    genders = [],
    location = '',
    minAge = null,
    maxAge = null,
    interests = [],
  } = params;

  await new Promise((resolve) => setTimeout(resolve, 700));

  let filteredMockUsers = MOCK_BASE_USERS.map(createMockUserSearchResult);
  console.log(`[API STUB] Initial mock users count: ${filteredMockUsers.length}`);

  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.trim().toLowerCase();
    console.log(`[API STUB] Applying searchTerm filter: "${lowerSearch}"`);
    const beforeCount = filteredMockUsers.length;
    filteredMockUsers = filteredMockUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerSearch) ||
        user.firstName.toLowerCase().includes(lowerSearch) ||
        user.lastName.toLowerCase().includes(lowerSearch)
    );
    console.log(
      `[API STUB] Users after searchTerm: ${filteredMockUsers.length} (was ${beforeCount})`
    );
  } else {
    console.log(`[API STUB] No valid searchTerm, skipping searchTerm filter.`);
  }

  if (genders && genders.length > 0) {
    const beforeCount = filteredMockUsers.length;
    filteredMockUsers = filteredMockUsers.filter((user) => genders.includes(user.gender));
    console.log(
      `[API STUB] Users after gender filter (${genders.join(', ')}): ${filteredMockUsers.length} (was ${beforeCount})`
    );
  }

  if (location.trim()) {
    const lowerLocation = location.trim().toLowerCase();
    const beforeCount = filteredMockUsers.length;
    filteredMockUsers = filteredMockUsers.filter(
      (user) => user.location?.toLowerCase() === lowerLocation
    );
    console.log(
      `[API STUB] Users after location filter ("${lowerLocation}"): ${filteredMockUsers.length} (was ${beforeCount})`
    );
  }

  if (minAge !== null && minAge !== undefined) {
    const beforeCount = filteredMockUsers.length;
    filteredMockUsers = filteredMockUsers.filter((user) => user.age !== null && user.age >= minAge);
    console.log(
      `[API STUB] Users after minAge filter (>=${minAge}): ${filteredMockUsers.length} (was ${beforeCount})`
    );
  }

  if (maxAge !== null && maxAge !== undefined) {
    const beforeCount = filteredMockUsers.length;
    filteredMockUsers = filteredMockUsers.filter((user) => user.age !== null && user.age <= maxAge);
    console.log(
      `[API STUB] Users after maxAge filter (<=${maxAge}): ${filteredMockUsers.length} (was ${beforeCount})`
    );
  }

  if (interests && interests.length > 0) {
    const beforeCount = filteredMockUsers.length;
    filteredMockUsers = filteredMockUsers.filter(
      (user) =>
        user.interests && user.interests.some((interest: string) => interests.includes(interest))
    );
    console.log(
      `[API STUB] Users after interests filter (${interests.join(', ')}): ${filteredMockUsers.length} (was ${beforeCount})`
    );
  }

  console.log(
    `[API STUB] Final filtered users count before pagination: ${filteredMockUsers.length}`
  );

  const totalElements = filteredMockUsers.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = filteredMockUsers.slice(startIndex, endIndex);
  const isFirst = page === 0;
  const isLast = page >= totalPages - 1 || totalPages === 0;
  const isEmpty = content.length === 0;

  console.log(`[API STUB] Returning page ${page + 1}/${totalPages}, items: ${content.length}`);

  const mockPage: UserSearchPage = {
    content,
    totalPages,
    totalElements,
    size,
    number: page,
    first: isFirst,
    last: isLast,
    empty: isEmpty,
  };
  return Promise.resolve(mockPage);
};

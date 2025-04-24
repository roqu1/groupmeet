import { API_CONFIG } from '../config/api';
import { Friend } from '../types/friend';
import { FriendsPage } from '../types/pagination';

interface FetchFriendsParams {
  page: number;
  size: number;
}

/**
 * Stub for fetching a paginated list of the current user's friends.
 * In the future, will make a GET request to API_CONFIG.endpoints.friends
 * with query parameters ?page={page}&size={size}
 * @param {FetchFriendsParams} params Parameters for pagination ({ page, size }).
 * @returns {Promise<FriendsPage>} A promise resolving with a page of friends and pagination info.
 */
export const fetchFriends = async ({
  page = 0,
  size = 10,
}: FetchFriendsParams): Promise<FriendsPage> => {
  const url = `${API_CONFIG.endpoints.friends}?page=${page}&size=${size}`;
  console.log(`[API STUB] Calling fetchFriends (GET ${url})`);

  // --- STUB ---
  await new Promise((resolve) => setTimeout(resolve, 500));

  const allMockFriends: Friend[] = [
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
  ];

  const totalElements = allMockFriends.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = allMockFriends.slice(startIndex, endIndex);
  const isFirst = page === 0;
  const isLast = page >= totalPages - 1;
  const isEmpty = content.length === 0;

  const mockPage: FriendsPage = {
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

  /*
  // Example of a real implementation using fetch:
  const response = await fetch(`${API_CONFIG.baseUrl}${url}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
  });
  if (!response.ok) { // ... error handling ... }
  const data: FriendsPage = await response.json();
  return data;
  */
};

export const removeFriend = async (friendId: number): Promise<void> => {
  const endpoint = API_CONFIG.endpoints.friendById(friendId);
  console.log(`[API STUB] Calling removeFriend (DELETE ${endpoint}) for ID: ${friendId}`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`[API STUB] Friend with ID ${friendId} successfully removed (simulated).`);
  return Promise.resolve();
};

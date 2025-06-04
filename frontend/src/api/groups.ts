import {
  GroupDetails,
  GroupParticipant,
  GroupParticipantsData,
  FetchGroupParticipantsParams,
  GroupParticipantActionResponse,
} from '../types/group';
import { Page } from '../types/pagination';
import { API_CONFIG } from '../config/api';
import { getCookie } from '@/utils/cookies';
import { UpdateGroupData } from '../hooks/groups/useUpdateGroup';

export const fetchGroupDetails = async (groupId: string): Promise<GroupDetails> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.meetingDetails(groupId)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response from group details' }));
    throw {
      message: errorData.message || `Error fetching group details: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  const data: GroupDetails = await response.json();
  return data;
};

export const fetchGroupParticipants = async ({
  groupId,
  page = 0,
  size = 10,
  searchTerm = '',
}: FetchGroupParticipantsParams): Promise<GroupParticipantsData> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  if (searchTerm.trim()) {
    queryParams.append('searchTerm', searchTerm.trim());
  }

  const participantsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.meetingParticipants(groupId)}?${queryParams.toString()}`;

  const participantsResponse = await fetch(participantsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!participantsResponse.ok) {
    const errorData = await participantsResponse
      .json()
      .catch(() => ({ message: 'Failed to parse error' }));
    throw {
      message:
        errorData.message || `Error fetching participants: ${participantsResponse.statusText}`,
      statusCode: participantsResponse.status,
    };
  }

  const backendResponse: {
    participantsPage: Page<GroupParticipant>;
    currentUserOrganizer: boolean;
    groupName: string;
  } = await participantsResponse.json();

  const rawParticipants = backendResponse.participantsPage?.content;

  if (!backendResponse.participantsPage || !Array.isArray(rawParticipants)) {
    console.error(
      'Invalid participantsPage or participantsPage.content structure received from backend:',
      backendResponse.participantsPage
    );
    const emptyPage: Page<GroupParticipant> = {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      first: true,
      last: true,
      empty: true,
    };
    return {
      participantsPage: emptyPage,
      isCurrentUserOrganizer: backendResponse.currentUserOrganizer ?? false,
      groupName: backendResponse.groupName ?? 'Gruppe',
    };
  }

  const convertedParticipants: GroupParticipant[] = rawParticipants.map(
    (participant: GroupParticipant) => ({
      id: participant.id,
      username: participant.username,
      firstName: participant.firstName,
      lastName: participant.lastName,
      avatarUrl: participant.avatarUrl,
      isOrganizer: participant.isOrganizer,
      gender: participant.gender,
      participationStatus: participant.participationStatus as 'ACTIVE' | 'BLOCKED',
      pro: participant.pro,
    })
  );

  const convertedPage: Page<GroupParticipant> = {
    ...backendResponse.participantsPage,
    content: convertedParticipants,
  };

  return {
    participantsPage: convertedPage,
    isCurrentUserOrganizer: backendResponse.currentUserOrganizer,
    groupName: backendResponse.groupName,
  };
};

export const joinGroup = async (groupId: string): Promise<{ message: string }> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.joinMeeting(groupId)}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
    throw {
      message: errorData.message || `Error joining group: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  return response.json();
};

export const leaveGroup = async (groupId: string): Promise<{ message: string }> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaveMeeting(groupId)}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
    throw {
      message: errorData.message || `Error leaving group: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  return response.json();
};

export const blockMeetingParticipantApi = async (
  meetingId: string,
  userId: number
): Promise<GroupParticipantActionResponse> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.blockMeetingParticipant(meetingId, userId)}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
    throw {
      message: errorData.message || `Fehler beim Sperren des Teilnehmers: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  return response.json();
};

export const unblockMeetingParticipantApi = async (
  meetingId: string,
  userId: number
): Promise<GroupParticipantActionResponse> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.blockMeetingParticipant(meetingId, userId)}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
    throw {
      message:
        errorData.message || `Fehler beim Entsperren des Teilnehmers: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  return response.json();
};

export const removeGroupParticipant = async (
  groupId: string,
  userId: number
): Promise<GroupParticipantActionResponse> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.removeMeetingParticipant(groupId, userId)}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
    throw {
      message: errorData.message || `Error removing participant: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  return response.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateGroupApi = async (groupId: string, groupData: UpdateGroupData): Promise<any> => {
  // Format dateTime if provided
  let isoDateTime;
  if (groupData.dateTime) {
    const date = new Date(groupData.dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    isoDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  const formattedData = {
    ...groupData,
    dateTime: isoDateTime,
    meetingTypeNames: groupData.meetingTypeNames,
    meetingTypeIds: undefined,
  };

  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.meetingDetails(groupId)}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(formattedData),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message: errorData.message || `Error updating group: ${response.statusText}`,
      statusCode: response.status,
      validationErrors: errorData.errors,
    };
  }

  return response.json();
};

export const deleteMeetingApi = async (meetingId: string): Promise<void> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.deleteMeeting(meetingId)}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 204) {
      return;
    }
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
    throw {
      message: errorData.message || `Error deleting meeting: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  if (response.status === 204) {
    return;
  }
};

//import { API_CONFIG } from '../config/api';

interface SendFriendRequestResponse {
  message: string;
}

/**
 * STUB for sending a friend request to a user.
 * In the future, will make a POST request to a backend endpoint (e.g., API_CONFIG.endpoints.sendFriendRequest(userId))
 * @param {number} userId The ID of the user to send a friend request to.
 * @returns {Promise<SendFriendRequestResponse>} A promise resolving with the API response.
 */
export const sendFriendRequest = async (userId: number): Promise<SendFriendRequestResponse> => {
  // TODO:
  // const endpoint = API_CONFIG.endpoints.sendFriendRequest(userId);

  await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 105) {
        console.warn(
          `[API STUB] Failed to send friend request to user ID: ${userId} (simulated error)`
        );
        reject(new Error('Benutzer kann keine Freundschaftsanfragen empfangen.'));
      } else {
        console.log(
          `[API STUB] Friend request successfully sent to user ID: ${userId} (simulated)`
        );
        resolve({ message: 'Freundschaftsanfrage erfolgreich gesendet!' });
      }
    }, 1000);
  });

  return { message: 'Freundschaftsanfrage erfolgreich gesendet!' };
};

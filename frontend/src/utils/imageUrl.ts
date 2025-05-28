import { API_CONFIG } from '@/config/api';

/**
 * Constructs the full URL for an avatar image.
 * If the provided avatarPath is already a full URL, it's returned as is.
 * Otherwise, it prepends the backend base URL.
 * @param avatarPath The path or full URL of the avatar from the backend.
 * @returns The full URL for the avatar, or undefined if avatarPath is null/undefined.
 */
export const getFullAvatarUrl = (avatarPath: string | null | undefined): string | undefined => {
  if (!avatarPath) {
    return undefined;
  }
  if (
    avatarPath.startsWith('http://') ||
    avatarPath.startsWith('https://') ||
    avatarPath.startsWith('blob:')
  ) {
    return avatarPath;
  }
  return `${API_CONFIG.baseUrl}${avatarPath}`;
};

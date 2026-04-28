const FALLBACK_URL = 'https://blursocial.codiac.online';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || FALLBACK_URL;

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || FALLBACK_URL;

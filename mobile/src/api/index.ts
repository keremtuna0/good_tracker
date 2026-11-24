import { ApiClient } from './client';

// On a real phone use the computer's LAN address, never localhost.
export const api = new ApiClient(
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
);

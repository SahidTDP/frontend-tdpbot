import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to extract data from axios response
export const fetcher = async (url: string) => {
  console.log(`[API] Fetching: ${url}`);
  try {
    const response = await api.get(url);
    console.log(`[API] Success ${url}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[API] Error fetching ${url}:`, error);
    throw error;
  }
};

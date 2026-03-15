const DEFAULT_BACKEND_ORIGIN = 'https://obliq-backend-1.onrender.com';

export const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  DEFAULT_BACKEND_ORIGIN;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

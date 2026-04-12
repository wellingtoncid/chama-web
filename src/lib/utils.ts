import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_BASE}/${cleanPath}`;
}

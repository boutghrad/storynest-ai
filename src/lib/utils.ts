import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number for display (e.g., 1200 → "1.2K")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/**
 * Truncate text to a maximum length, adding an ellipsis
 */
export function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Estimate reading time for a story (based on ~150 words/min for children)
 */
export function getReadingTime(text: string): number {
  const wordsPerMinute = 150;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
}

/**
 * Get a human-readable label for an age group
 */
export function getAgeGroupLabel(ageGroup: string): string {
  const labels: Record<string, string> = {
    "2-4": "Toddlers (2–4)",
    "4-6": "Early Readers (4–6)",
    "6-8": "Young Readers (6–8)",
    "8-10": "Growing Readers (8–10)",
    "10-12": "Pre-Teens (10–12)",
  };
  return labels[ageGroup] ?? ageGroup;
}

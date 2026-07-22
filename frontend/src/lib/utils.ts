/**
 * utils.ts — cn() class name helper
 *
 * Combines two utilities that solve two different problems:
 *
 *   clsx()      — Conditionally joins class names
 *                 clsx('px-4', isLarge && 'text-lg', { 'opacity-50': disabled })
 *                 → "px-4 text-lg opacity-50"
 *
 *   twMerge()   — Resolves Tailwind class conflicts
 *                 twMerge('p-2 text-sm', 'p-4')  → "text-sm p-4"  (p-2 removed)
 *                 Without twMerge, both p-2 and p-4 would be in the class string,
 *                 and CSS specificity (not order) would determine which wins.
 *
 * Used in every component variant:
 *   <Button className={cn('px-4 py-2', variant === 'ghost' && 'bg-transparent', className)} />
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

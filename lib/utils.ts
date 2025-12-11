import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VEHICLE_CAPACITY } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate if moving an order would exceed vehicle capacity
 */
export function wouldExceedCapacity(
  orderCubes: number,
  targetTripCurrentVolume: number
): { exceeds: boolean; overage: number } {
  const newVolume = targetTripCurrentVolume + orderCubes;
  const exceeds = newVolume > VEHICLE_CAPACITY;
  const overage = exceeds ? newVolume - VEHICLE_CAPACITY : 0;
  return { exceeds, overage };
}

/**
 * Calculate capacity usage percentage
 */
export function calculateCapacityUsage(volume: number,capacity: number): number {
  return Math.round((volume / capacity) * 100);
}

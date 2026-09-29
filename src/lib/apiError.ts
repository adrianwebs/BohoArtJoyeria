import { NextResponse } from 'next/server';
import { StoreError } from './storeService';

/** Maps thrown errors to a JSON response; StoreErrors carry a user-facing message and status. */
export function apiError(error: unknown, fallback: string) {
  if (error instanceof StoreError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

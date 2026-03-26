'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: Send to Sentry
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 dark:bg-gray-950">
      <div className="w-full max-w-lg rounded-lg bg-white/70 p-8 shadow-lg backdrop-blur-md dark:bg-gray-900/70">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            An unexpected error occurred. We apologise for the inconvenience.
          </p>
        </div>

        <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            {error.message || 'An unknown error occurred'}
          </p>
          {error.digest && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="sm:justify-centre flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="text-centre rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 dark:bg-gray-950">
      <div className="w-full max-w-lg rounded-lg bg-white/70 p-8 text-center shadow-lg backdrop-blur-md dark:bg-gray-900/70">
        <div
          aria-hidden="true"
          className="mb-2 text-8xl font-bold text-gray-500 dark:text-gray-500"
        >
          404
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Page not found
        </h1>
        <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

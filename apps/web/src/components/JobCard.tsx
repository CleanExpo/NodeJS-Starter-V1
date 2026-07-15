'use client';

import { motion } from 'framer-motion';
import { formatDateAU, formatCurrencyAUD, formatPhoneAU } from '../lib/australian-context';

/**
 * JobCard Component
 *
 * Australian-first water damage restoration job card.
 * Demonstrates:
 * - en-AU spelling (colour, organisation)
 * - DD/MM/YYYY date format
 * - AUD currency with GST
 * - Australian phone format (04XX XXX XXX)
 * - Australian address format (Street, Suburb STATE POSTCODE)
 * - 2025-2026 design aesthetic (Bento grid, glassmorphism)
 * - AI-generated custom icons (NO Lucide)
 * - Micro-interactions
 */

interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  suburb: string;
  state: 'QLD' | 'NSW' | 'VIC' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';
  postcode: string;
  jobType: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  gst: number;
  scheduledDate: Date | null;
  createdAt: Date;
}

// AI-generated custom icons (NO Lucide!)
function WaterDropIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

// Status colour mapping (en-AU spelling!)
const statusStyles = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-primary-50 text-primary-700 border-primary-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function JobCard({ job }: { job: Job }) {
  const total = job.amount + job.gst;

  return (
    <motion.div
      className="glass-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      {/* Header with job type and status */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 rounded-lg p-3">
            <WaterDropIcon className="text-primary-600 h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.jobType}</h3>
            <p className="text-sm text-gray-600">Job #{job.id}</p>
          </div>
        </div>
        <span
          className={`rounded-lg border px-3 py-1 text-sm font-medium ${statusStyles[job.status]}`}
        >
          {statusLabels[job.status]}
        </span>
      </div>

      {/* Customer information */}
      <div className="mb-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{job.customerName}</p>
          <div className="mt-1 flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            <a
              href={`tel:${job.customerPhone}`}
              className="text-primary-600 hover:text-primary-700 text-sm transition-colors"
            >
              {formatPhoneAU(job.customerPhone)}
            </a>
          </div>
        </div>

        {/* Australian address format: Street, Suburb STATE POSTCODE */}
        <div className="flex items-start gap-2">
          <LocationIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
          <p className="text-sm text-gray-600">
            {job.address}, {job.suburb} {job.state} {job.postcode}
          </p>
        </div>
      </div>

      {/* Scheduled date (DD/MM/YYYY format) */}
      {job.scheduledDate && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
          <CalendarIcon className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs font-medium text-blue-600">Scheduled</p>
            <p className="text-sm text-blue-900">{formatDateAU(job.scheduledDate)}</p>
          </div>
        </div>
      )}

      {/* Pricing with GST (Australian) */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium text-gray-900">{formatCurrencyAUD(job.amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">GST (10%)</span>
            <span className="font-medium text-gray-900">{formatCurrencyAUD(job.gst)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base">
            <span className="font-semibold text-gray-900">Total (inc. GST)</span>
            <span className="text-primary-600 font-bold">{formatCurrencyAUD(total)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons with micro-interactions */}
      <div className="mt-4 flex gap-2">
        <motion.button
          className="bg-primary-600 hover:bg-primary-700 flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
        </motion.button>
        <motion.button
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Contact
        </motion.button>
      </div>

      {/* Footer with creation date */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">Created {formatDateAU(job.createdAt)}</p>
      </div>
    </motion.div>
  );
}

// Example usage with sample data
export function JobCardExample() {
  const sampleJob: Job = {
    id: 'JOB-2025-0142',
    customerName: 'Sarah Thompson',
    customerPhone: '0412345678',
    address: '42 Queen Street',
    suburb: 'Brisbane City',
    state: 'QLD',
    postcode: '4000',
    jobType: 'Water Damage Restoration',
    status: 'scheduled',
    amount: 2500.0,
    gst: 250.0, // 10% GST (Australian)
    scheduledDate: new Date('2025-01-08'),
    createdAt: new Date('2025-01-05'),
  };

  return (
    <div className="max-w-md">
      <JobCard job={sampleJob} />
    </div>
  );
}

/**
 * Live Contractor Availability Demo Page
 *
 * Demonstrates full-stack integration:
 * - Next.js 15 frontend
 * - FastAPI backend
 * - Australian context throughout
 * - Real-time data fetching
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ContractorAvailabilityLive } from '@/components/contractor-availability-live';
import { contractorAPI } from '@/lib/api/contractors';
import type { Contractor } from '@/types/contractor';

export default function LiveDemoPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);

  // Fetch contractors list
  useEffect(() => {
    async function fetchContractors() {
      try {
        setLoading(true);
        setError(null);
        const response = await contractorAPI.list({ pageSize: 10 });
        setContractors(response.contractors);

        // Auto-select first contractor if available
        if (response.contractors.length > 0) {
          setSelectedContractorId(response.contractors[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contractors');
      } finally {
        setLoading(false);
      }
    }

    fetchContractors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Template notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            ⚠ Template feature — Contractor API not yet configured
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Implement{' '}
            <code className="rounded bg-amber-100 px-1">
              apps/backend/src/api/routes/_templates/contractors.py
            </code>{' '}
            and register it in <code className="rounded bg-amber-100 px-1">main.py</code> to
            activate this demo.
          </p>
        </div>

        {/* Header */}
        <div className="rounded-lg border border-white/20 bg-white/70 p-6 shadow-[0_10px_15px_rgba(13,148,136,0.1)] backdrop-blur-md">
          <h1 className="font-heading mb-2 text-4xl font-bold text-gray-900">
            Live Contractor Availability
          </h1>
          <p className="mb-4 text-gray-600">
            Real-time data from FastAPI backend with Australian context
          </p>

          {/* Architecture Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              Next.js 15
            </span>
            <span className="bg-success/10 text-success rounded-full px-3 py-1 text-sm font-medium">
              FastAPI
            </span>
            <span className="bg-warning/10 text-warning rounded-full px-3 py-1 text-sm font-medium">
              Australian-first
            </span>
            <span className="bg-info/10 text-info rounded-full px-3 py-1 text-sm font-medium">
              Full-stack Integration
            </span>
          </div>
        </div>

        {/* Contractor Selector */}
        {loading ? (
          <div className="rounded-lg border border-white/20 bg-white/70 p-6 backdrop-blur-md">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="h-10 rounded bg-gray-200"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-error/10 border-error/20 rounded-lg border p-6">
            <p className="text-error font-medium">Failed to load contractors</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
            <p className="mt-3 text-xs text-gray-500">
              Make sure the FastAPI backend is running on http://localhost:8000
            </p>
          </div>
        ) : contractors.length === 0 ? (
          <div className="bg-warning/10 border-warning/20 rounded-lg border p-6">
            <p className="text-warning font-medium">No contractors found</p>
            <p className="mt-1 text-sm text-gray-600">
              Create some contractors using the API or seed the database
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-white/20 bg-white/70 p-6 shadow-[0_10px_15px_rgba(13,148,136,0.1)] backdrop-blur-md">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Contractor
            </label>
            <select
              value={selectedContractorId || ''}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
            >
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name} - {contractor.mobile}
                  {contractor.specialisation && ` (${contractor.specialisation})`}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {contractors.length} contractor{contractors.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}

        {/* Live Component */}
        {selectedContractorId && <ContractorAvailabilityLive contractorId={selectedContractorId} />}

        {/* API Info */}
        <div className="rounded-lg border border-white/20 bg-white/70 p-6 shadow-[0_10px_15px_rgba(13,148,136,0.1)] backdrop-blur-md">
          <h2 className="font-heading mb-3 text-xl font-semibold text-gray-900">
            API Configuration
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Backend URL:</span>{' '}
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              </code>
            </p>
            <p>
              <span className="font-medium">Endpoint:</span>{' '}
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">GET /api/contractors/</code>
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Configure backend URL in{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5">.env.local</code>
            </p>
          </div>
        </div>

        {/* Feature Checklist */}
        <div className="rounded-lg border border-white/20 bg-white/70 p-6 shadow-[0_10px_15px_rgba(13,148,136,0.1)] backdrop-blur-md">
          <h2 className="font-heading mb-4 text-xl font-semibold text-gray-900">
            Integration Features ✓
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              'Real-time API data fetching',
              'Loading states with skeleton UI',
              'Error handling with retry',
              'Australian date format (DD/MM/YYYY)',
              'Australian time format (12-hour am/pm)',
              'Australian mobile format (04XX XXX XXX)',
              'Australian ABN format (XX XXX XXX XXX)',
              'Brisbane locations (QLD suburbs)',
              'AEST timezone handling',
              'Bento grid layout (2025-2026)',
              'Glassmorphism design',
              'NO Lucide icons (emoji/custom)',
              'TypeScript type safety',
              'Pydantic model alignment',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

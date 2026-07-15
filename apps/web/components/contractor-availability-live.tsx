/**
 * Live Contractor Availability Component (API-Connected)
 *
 * This component fetches real data from the FastAPI backend.
 * Features:
 * - Real-time data from backend API
 * - Loading and error states
 * - Australian context (DD/MM/YYYY, AEST, Brisbane)
 * - Bento grid + glassmorphism design
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { contractorAPI } from '@/lib/api/contractors';
import type { Contractor, AvailabilitySlot } from '@/types/contractor';

interface ContractorAvailabilityLiveProps {
  contractorId: string;
  className?: string;
}

export const ContractorAvailabilityLive = React.forwardRef<
  HTMLDivElement,
  ContractorAvailabilityLiveProps
>(({ contractorId, className }, ref) => {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch contractor data from API
  useEffect(() => {
    let mounted = true;

    async function fetchContractor() {
      try {
        setLoading(true);
        setError(null);
        const data = await contractorAPI.get(contractorId);
        if (mounted) {
          setContractor(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load contractor');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchContractor();

    return () => {
      mounted = false;
    };
  }, [contractorId]);

  // Format date to Australian standard (DD/MM/YYYY)
  const formatAustralianDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time to Australian standard (12-hour with am/pm)
  const formatAustralianTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes}${period}`;
  };

  // Convert API date string (ISO 8601) to Date object
  const parseAPIDate = (dateString: string): Date => {
    return new Date(dateString);
  };

  // Get status colour (using Australian spelling!)
  const getStatusColour = (status: AvailabilitySlot['status']) => {
    switch (status) {
      case 'available':
        return 'bg-success/10 border-success/20 text-success';
      case 'booked':
        return 'bg-gray-100 border-gray-200 text-gray-500';
      case 'tentative':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'unavailable':
        return 'bg-error/10 border-error/20 text-error';
    }
  };

  // Get next 7 days
  const getNextWeek = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: Date): AvailabilitySlot[] => {
    if (!contractor?.availabilitySlots) return [];

    return contractor.availabilitySlots.filter((slot) => {
      const slotDate = parseAPIDate(slot.date);
      return slotDate.toDateString() === date.toDateString();
    });
  };

  // Loading state
  if (loading) {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg',
          'bg-white/70 backdrop-blur-md',
          'border border-white/20',
          'shadow-[0_10px_15px_rgba(13,148,136,0.1)]',
          'p-6',
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">Loading contractor availability...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg',
          'bg-white/70 backdrop-blur-md',
          'border-error/20 border',
          'shadow-[0_10px_15px_rgba(239,68,68,0.1)]',
          'p-6',
          className
        )}
      >
        <div className="py-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h3 className="font-heading text-error mb-2 text-lg font-semibold">
            Failed to Load Contractor
          </h3>
          <p className="mb-4 text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-error hover:bg-error/90 rounded-lg px-4 py-2 text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No contractor found
  if (!contractor) {
    return null;
  }

  const nextWeek = getNextWeek();

  return (
    <div
      ref={ref}
      className={cn(
        // Bento grid card - 2025-2026 aesthetic
        'relative overflow-hidden rounded-lg',
        // Glassmorphism effect
        'bg-white/70 backdrop-blur-md',
        'border border-white/20',
        // Soft coloured shadow (NEVER pure black)
        'shadow-[0_10px_15px_rgba(13,148,136,0.1)]',
        'p-6',
        className
      )}
    >
      {/* Header with contractor details */}
      <div className="mb-6">
        <h2 className="font-heading mb-2 text-2xl font-bold text-gray-900">{contractor.name}</h2>
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <p>
            <span className="font-medium">Mobile:</span> {contractor.mobile}
          </p>
          {contractor.abn && (
            <p>
              <span className="font-medium">ABN:</span> {contractor.abn}
            </p>
          )}
          {contractor.email && (
            <p>
              <span className="font-medium">Email:</span> {contractor.email}
            </p>
          )}
          {contractor.specialisation && (
            <p className="text-primary mt-1 font-medium">{contractor.specialisation}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            All times in AEST (Australian Eastern Standard Time)
          </p>
        </div>
      </div>

      {/* Calendar Grid - Bento style */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-semibold text-gray-800">Next 7 Days</h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {nextWeek.map((date, index) => {
            const slots = getSlotsForDate(date);
            const hasAvailability = slots.some((s) => s.status === 'available');
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  // Bento card
                  'relative rounded-lg border p-4 transition-all',
                  'hover:scale-[1.02] hover:shadow-md',
                  // Glassmorphism on hover
                  'hover:bg-white/80 hover:backdrop-blur-lg',
                  isToday && 'ring-primary ring-2 ring-offset-2',
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'bg-primary/5 border-primary'
                    : 'border-gray-200 bg-white/50',
                  !hasAvailability && 'opacity-60'
                )}
              >
                <div className="text-left">
                  {/* Australian date format */}
                  <div className="font-heading font-semibold text-gray-900">
                    {formatAustralianDate(date)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {date.toLocaleDateString('en-AU', { weekday: 'short' })}
                    {isToday && ' (Today)'}
                  </div>

                  {/* Availability count */}
                  <div className="mt-3">
                    {slots.length === 0 ? (
                      <span className="text-xs text-gray-400">No slots</span>
                    ) : (
                      <span className="text-primary text-xs font-medium">
                        {slots.filter((s) => s.status === 'available').length} available
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date slots */}
      {selectedDate && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="font-heading mb-4 text-lg font-semibold text-gray-800">
            Available Times - {formatAustralianDate(selectedDate)}
          </h3>

          <div className="space-y-3">
            {getSlotsForDate(selectedDate).map((slot) => (
              <div
                key={slot.id}
                className={cn(
                  'rounded-lg border p-4',
                  'flex items-center justify-between',
                  getStatusColour(slot.status)
                )}
              >
                <div>
                  <div className="font-medium">
                    {formatAustralianTime(slot.startTime)} - {formatAustralianTime(slot.endTime)}
                  </div>
                  <div className="mt-1 text-sm">
                    {slot.location.suburb}, {slot.location.state}
                    {slot.location.postcode && ` ${slot.location.postcode}`}
                  </div>
                  {slot.notes && <div className="mt-1 text-xs text-gray-500">{slot.notes}</div>}
                </div>
                <div className="text-sm font-medium capitalize">{slot.status}</div>
              </div>
            ))}

            {getSlotsForDate(selectedDate).length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                No availability for this date
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer with Australian context */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">
          📍 Serving Greater Brisbane area • All prices in AUD (GST incl.)
        </p>
      </div>
    </div>
  );
});

ContractorAvailabilityLive.displayName = 'ContractorAvailabilityLive';

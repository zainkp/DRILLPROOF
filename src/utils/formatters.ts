import { HazardType, PriorityLevel, ActionStatus, InspectionStatus, DrillStatus } from '../types';

export function formatHazardName(hazard: HazardType): string {
  const map: Record<HazardType, string> = {
    fire: 'Fire & Smoke',
    earthquake: 'Earthquake',
    flood: 'Flood / Water Ingress',
    severe_weather: 'Severe Weather',
    chemical: 'Chemical / Hazardous Material',
    medical: 'Medical Emergency',
    electrical: 'Electrical Hazard',
    security: 'Security Evacuation',
  };
  return map[hazard] || hazard;
}

export function formatPriority(priority: PriorityLevel): { label: string; bg: string; text: string; border: string } {
  switch (priority) {
    case 'critical':
      return { label: 'Critical', bg: 'bg-red-50 text-red-700', text: 'text-red-700', border: 'border-red-200' };
    case 'high':
      return { label: 'High', bg: 'bg-orange-50 text-orange-700', text: 'text-orange-700', border: 'border-orange-200' };
    case 'medium':
      return { label: 'Medium', bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' };
    case 'low':
      return { label: 'Low', bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' };
  }
}

export function formatActionStatus(status: ActionStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'open':
      return { label: 'Open', bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700' };
    case 'in_progress':
      return { label: 'In Progress', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' };
    case 'resolved':
      return { label: 'Remediated (Awaiting Sign-off)', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' };
    case 'verified':
      return { label: 'Resolved & Verified', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' };
  }
}

export function formatInspectionStatus(status: InspectionStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'pass':
      return { label: 'Pass', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' };
    case 'needs_attention':
      return { label: 'Needs Attention', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' };
    case 'not_checked':
      return { label: 'Not Checked', bg: 'bg-gray-100 text-gray-700 border-gray-200', text: 'text-gray-600' };
  }
}

export function formatDrillStatus(status: DrillStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'planned':
      return { label: 'Scheduled', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' };
    case 'in_progress':
      return { label: 'In Progress', bg: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', text: 'text-amber-700' };
    case 'completed':
      return { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-gray-100 text-gray-700 border-gray-200', text: 'text-gray-500' };
  }
}

export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatDateString(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

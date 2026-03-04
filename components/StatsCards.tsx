"use client";

interface StatsCardsProps {
  offered: number;
  oa: number;
  interviewing: number;
}

export function StatsCards({ offered, oa, interviewing }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Offered</p>
        <p className="mt-1 text-2xl font-semibold text-green-600">{offered}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-500">OA</p>
        <p className="mt-1 text-2xl font-semibold text-amber-600">{oa}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Interviewing</p>
        <p className="mt-1 text-2xl font-semibold text-blue-600">
          {interviewing}
        </p>
      </div>
    </div>
  );
}

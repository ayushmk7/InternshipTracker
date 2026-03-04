"use client";

interface FiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Filters({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: FiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        <option value="offered">Offered</option>
        <option value="oa">OA</option>
        <option value="interviewing">Interviewing</option>
      </select>
      <input
        type="search"
        placeholder="Search company or subject..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-xs"
      />
    </div>
  );
}

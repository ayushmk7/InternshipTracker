"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import type { Application, ApplicationStatus } from "@/types";
import { ApplicationDetail } from "./ApplicationDetail";

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles = {
    offered: "bg-green-100 text-green-800",
    oa: "bg-amber-100 text-amber-800",
    interviewing: "bg-blue-100 text-blue-800",
  };
  const label = {
    offered: "Offered",
    oa: "OA",
    interviewing: "Interviewing",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

interface SpreadsheetTableProps {
  applications: Application[];
  onUpdateStatus?: (id: string, status: ApplicationStatus) => void;
}

export function SpreadsheetTable({
  applications,
  onUpdateStatus,
}: SpreadsheetTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "received_at", desc: true },
  ]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const columns = useMemo<ColumnDef<Application>[]>(
    () => [
      {
        accessorKey: "company_name",
        header: "Company",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "role_title",
        header: "Role",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue() as ApplicationStatus} />
        ),
      },
      {
        accessorKey: "sender_email",
        header: "Sender",
        cell: ({ getValue }) => {
          const v = getValue() as string | null | undefined;
          return (
            <span className="truncate max-w-[180px] block" title={v ?? ""}>
              {v ?? "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ getValue }) => {
          const v = getValue() as string | null | undefined;
          return (
            <span className="truncate max-w-[240px] block" title={v ?? ""}>
              {v ?? "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "received_at",
        header: "Received",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          if (!val) return "—";
          try {
            const d = new Date(val);
            return d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          } catch {
            return val;
          }
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: applications,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelectedApplication(row.original)}
                className="cursor-pointer hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-4 py-3 text-sm text-gray-900"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No applications yet. Forward internship emails to your AgentMail
            inbox to get started.
          </div>
        )}
      </div>

      {selectedApplication && (
        <ApplicationDetail
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import type { Application, ApplicationStatus } from "@/types";

interface ApplicationDetailProps {
  application: Application;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: ApplicationStatus) => void;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "offered", label: "Offered" },
  { value: "oa", label: "OA" },
  { value: "interviewing", label: "Interviewing" },
];

export function ApplicationDetail({
  application,
  onClose,
  onUpdateStatus,
}: ApplicationDetailProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [saving, setSaving] = useState(false);

  async function handleSaveStatus() {
    if (status === application.status || !onUpdateStatus) return;
    setSaving(true);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onUpdateStatus(application.id, status);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const receivedDate = application.received_at
    ? new Date(application.received_at).toLocaleString()
    : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Application details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-500">Company</span>
              <p className="text-gray-900">{application.company_name ?? "—"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Role</span>
              <p className="text-gray-900">{application.role_title ?? "—"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Status</span>
              {onUpdateStatus ? (
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ApplicationStatus)
                  }
                  className="mt-0.5 block w-full rounded border border-gray-300 text-sm"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">{application.status}</p>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-500">Received</span>
              <p className="text-gray-900">{receivedDate}</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">Subject</span>
            <p className="text-gray-900">{application.subject ?? "—"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">Sender</span>
            <p className="text-gray-900 break-all">
              {application.sender_email ?? "—"}
            </p>
          </div>
          {application.email_body_preview && (
            <div>
              <span className="font-medium text-gray-500 text-sm">
                Email preview
              </span>
              <pre className="mt-1 whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm text-gray-700 max-h-48 overflow-y-auto">
                {application.email_body_preview}
              </pre>
            </div>
          )}
        </div>
        {onUpdateStatus && status !== application.status && (
          <div className="border-t border-gray-200 px-4 py-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={saving}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save status"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

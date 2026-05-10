// src/pages/admin/AuditLogs.jsx
import { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../../services/api";

// ── Event badge colors ────────────────────────────────────────────────────────
const EVENT_META = {
  LOGIN_SUCCESS: {
    label: "Login Success",
    color: "bg-green-100 text-green-800",
  },
  LOGIN_FAILED: { label: "Login Failed", color: "bg-red-100 text-red-800" },
  LOGIN_LOCKED: {
    label: "Account Locked",
    color: "bg-orange-100 text-orange-800",
  },
  LOGOUT: { label: "Logout", color: "bg-gray-100 text-gray-700" },
  GOOGLE_LOGIN_SUCCESS: {
    label: "Google Login",
    color: "bg-blue-100 text-blue-800",
  },
  PASSWORD_RESET_REQUESTED: {
    label: "Password Reset Requested",
    color: "bg-yellow-100 text-yellow-800",
  },
  PASSWORD_RESET_COMPLETED: {
    label: "Password Reset Done",
    color: "bg-purple-100 text-purple-800",
  },
  TENANT_REGISTERED: {
    label: "Tenant Registered",
    color: "bg-cyan-100 text-cyan-800",
  },
  TENANT_APPROVED: {
    label: "Tenant Approved",
    color: "bg-green-100 text-green-800",
  },
  TENANT_BLOCKED: { label: "Tenant Blocked", color: "bg-red-100 text-red-800" },
  TENANT_INACTIVE: {
    label: "Tenant Inactive",
    color: "bg-orange-100 text-orange-800",
  },
  TENANT_DELETED: { label: "Tenant Deleted", color: "bg-red-200 text-red-900" },
};

function EventBadge({ event }) {
  const meta = EVENT_META[event] || {
    label: event,
    color: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}
    >
      {meta.label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterEvent, setFilterEvent] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [limit, setLimit] = useState(100);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit });
      if (filterEvent) params.set("event", filterEvent);
      if (filterEmail.trim()) params.set("email", filterEmail.trim());

      const res = await axiosInstance.get(`/admin/audit-logs?${params}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }, [filterEvent, filterEmail, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track login, password reset, and tenant activity across the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Events</option>
          {Object.entries(EVENT_META).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filter by email..."
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={200}>Last 200</option>
          <option value={500}>Last 500</option>
        </select>

        <button
          onClick={fetchLogs}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Summary chips */}
      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          Showing{" "}
          <span className="font-semibold text-gray-700">{logs.length}</span>{" "}
          entries
          {filterEvent && (
            <>
              {" "}
              filtered by <EventBadge event={filterEvent} />
            </>
          )}
          {filterEmail && (
            <>
              {" "}
              for <span className="font-semibold">{filterEmail}</span>
            </>
          )}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Event
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Loading audit logs...
                  </td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No audit logs found.
                  </td>
                </tr>
              )}
              {!loading &&
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <EventBadge event={log.event} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {log.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {log.role ? (
                        <span className="capitalize text-gray-600">
                          {log.role}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {log.ip || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {log.meta && Object.keys(log.meta).length > 0 ? (
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {JSON.stringify(log.meta)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

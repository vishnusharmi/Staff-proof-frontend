import React, { useState, useEffect } from "react";
import { Search, AlertTriangle } from "lucide-react";

const staticBlacklist = [
  {
    id: 1,
    employee_name: "John Doe",
    staffproof_id: "SP12345",
    reported_by: "Acme Corp",
    reason: "Unauthorized access to sensitive data",
    report_date: "2025-01-15T10:00:00Z",
    status: "Pending",
    is_visible: true,
  },
  {
    id: 2,
    employee_name: "Jane Smith",
    staffproof_id: "SP67890",
    reported_by: "Tech Solutions",
    reason: "Frequent absenteeism",
    report_date: "2025-02-20T14:30:00Z",
    status: "Approved",
    is_visible: true,
  },
  {
    id: 3,
    employee_name: "Michael Brown",
    staffproof_id: "SP11223",
    reported_by: "Global Inc",
    reason: "Policy violation",
    report_date: "2025-03-10T09:15:00Z",
    status: "Rejected",
    is_visible: false,
  },
  {
    id: 4,
    employee_name: "Emily Davis",
    staffproof_id: "SP44556",
    reported_by: "Acme Corp",
    reason: "Theft of company property",
    report_date: "2025-04-05T16:45:00Z",
    status: "Approved",
    is_visible: false,
  },
  {
    id: 5,
    employee_name: "David Wilson",
    staffproof_id: "SP78901",
    reported_by: "Tech Solutions",
    reason: "Inappropriate behavior",
    report_date: "2025-05-01T11:20:00Z",
    status: "Pending",
    is_visible: true,
  },
];

const staticEmployers = [
  { id: 1, name: "Acme Corp" },
  { id: 2, name: "Tech Solutions" },
  { id: 3, name: "Global Inc" },
];

const BlacklistManagement = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [search, setSearch] = useState("");
  const [reportedByFilter, setReportedByFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  const loadData = () => {
    setLoading(true);
    try {
      setBlacklist(staticBlacklist);
      setEmployers(staticEmployers);
    } catch (err) {
      setError("Failed to load blacklist data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = (action, id, name) => {
    setBlacklist((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status:
                action.toLowerCase() === "approve"
                  ? "Approved"
                  : action.toLowerCase() === "reject"
                  ? "Rejected"
                  : entry.status,
            }
          : entry
      )
    );
  };
  

  const filteredBlacklist = blacklist.filter((item) => {
    const matchesSearch =
      item.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      item.staffproof_id.toLowerCase().includes(search.toLowerCase());
    const matchesReporter = reportedByFilter
      ? item.reported_by === reportedByFilter
      : true;
    return matchesSearch && matchesReporter;
  });

  const paginatedBlacklist = filteredBlacklist.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-teal-800">
            Blacklist Management
          </h1>
          {loading && (
            <div className="flex items-center text-teal-600">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-teal-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                  placeholder="Search by name or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-teal-700 mb-1">
                Reported By
              </label>
              <select
                className="w-full px-3 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                value={reportedByFilter}
                onChange={(e) => setReportedByFilter(e.target.value)}
              >
                <option value="">All Employers</option>
                {employers.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-teal-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-teal-100">
              <thead className="bg-teal-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase">
                    StaffProof ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-teal-100">
                {paginatedBlacklist.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-teal-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-teal-800">
                      {entry.employee_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-teal-700">
                      {entry.staffproof_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-teal-700">
                      {entry.reported_by}
                    </td>
                    <td className="px-6 py-4 text-sm text-teal-700">
                      {entry.reason}
                    </td>
                    <td className="px-6 py-4 text-sm text-teal-700">
                      {new Date(entry.report_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        className="text-sm font-medium border rounded px-2 py-1 disabled:opacity-50"
                        value={entry.status}
                        disabled={entry.status !== "Pending"}
                        onChange={(e) => {
                          const selected = e.target.value;
                          handleAction(
                            selected === "Approved" ? "approve" : "reject",
                            entry.id,
                            entry.employee_name
                          );
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-teal-50 border-t border-teal-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-teal-700">
                Showing {paginatedBlacklist.length} of{" "}
                {filteredBlacklist.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 text-sm text-teal-700 bg-white border border-teal-200 rounded-md hover:bg-teal-100 disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-sm text-teal-700">
                  Page {page} of{" "}
                  {Math.ceil(filteredBlacklist.length / itemsPerPage)}
                </span>
                <button
                  className="px-3 py-1 text-sm text-teal-700 bg-white border border-teal-200 rounded-md hover:bg-teal-100 disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={
                    page === Math.ceil(filteredBlacklist.length / itemsPerPage)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
          <div className="flex items-start">
            <AlertTriangle className="flex-shrink-0 w-5 h-5 text-teal-600 mt-1" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-teal-800">
                Privacy Assurance
              </h3>
              <p className="mt-1 text-sm text-teal-700">
                Blacklist information is strictly confidential and only
                accessible to verified employers. Employees cannot view their
                blacklist status through any platform features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlacklistManagement;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Static data
const staticEmployers = [
  {
    id: "EMP001",
    name: "TechCorp Inc.",
    email: "contact@techcorp.com",
    registration_date: "2025-01-10T09:00:00Z",
    kyc_status: "Pending",
  },
  {
    id: "EMP002",
    name: "Global Solutions Ltd.",
    email: "info@globalsolutions.com",
    registration_date: "2025-02-15T14:30:00Z",
    kyc_status: "Verified",
  },
  {
    id: "EMP003",
    name: "Innovate LLC",
    email: "support@innovatellc.com",
    registration_date: "2025-03-20T11:45:00Z",
    kyc_status: "Rejected",
  },
  {
    id: "EMP004",
    name: "Future Enterprises",
    email: "admin@futureenterprises.com",
    registration_date: "2025-04-05T16:20:00Z",
    kyc_status: "Pending",
  },
  {
    id: "EMP005",
    name: "Visionary Co.",
    email: "hr@visionaryco.com",
    registration_date: "2025-05-01T10:10:00Z",
    kyc_status: "Verified",
  },
];

const EmployerManagement = () => {
  const [employers, setEmployers] = useState([]);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const loadEmployers = () => {
    setLoading(true);
    try {
      let filteredEmployers = staticEmployers;
      if (search) {
        filteredEmployers = filteredEmployers.filter(
          (employer) =>
            employer.name.toLowerCase().includes(search.toLowerCase()) ||
            employer.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (kycFilter) {
        filteredEmployers = filteredEmployers.filter(
          (employer) => employer.kyc_status === kycFilter
        );
      }
      setEmployers(filteredEmployers);
    } catch (err) {
      setError("Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployers();
  }, [search, kycFilter]);

  const handleApprove = (id, name) => {
    setLoading(true);
    setError(null);
    try {
      setEmployers((prev) =>
        prev.map((employer) =>
          employer.id === id
            ? { ...employer, kyc_status: "Verified" }
            : employer
        )
      );
      alert(`Approved ${name}`);
    } catch (err) {
      setError(`Failed to approve ${name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (id, name) => {
    setLoading(true);
    setError(null);
    try {
      setEmployers((prev) =>
        prev.map((employer) =>
          employer.id === id
            ? { ...employer, kyc_status: "Rejected" }
            : employer
        )
      );
      alert(`Rejected ${name}`);
    } catch (err) {
      setError(`Failed to reject ${name}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployers = employers;
  const paginatedEmployers = filteredEmployers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading && !employers.length)
    return <div className="p-4">Loading...</div>;
  if (error && !employers.length)
    return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-6 p-4">
      {loading && <div className="p-2 text-blue-600">Processing...</div>}
      {error && <div className="p-2 text-red-600">{error}</div>}
      <h1 className="text-2xl font-bold">Employer Management</h1>

      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full py-2 pl-4 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by company name, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
            >
              <option value="">All KYC Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Company Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Registration Date
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                KYC Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEmployers.map((employer) => (
              <tr key={employer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {employer.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {employer.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {employer.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(employer.registration_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {employer.kyc_status}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() =>
                      navigate(`/admin/employerDetails`)
                    }
                    disabled={loading}
                  >
                    View
                  </button>
                  <span className="px-1 text-gray-300">|</span>
                  <button
                    className="text-green-600 hover:text-green-900"
                    onClick={() => handleApprove(employer.id, employer.name)}
                    disabled={employer.kyc_status === "Verified" || loading}
                  >
                    Approve
                  </button>
                  <span className="px-1 text-gray-300">|</span>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleReject(employer.id, employer.name)}
                    disabled={employer.kyc_status === "Rejected" || loading}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(page - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(page * itemsPerPage, filteredEmployers.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredEmployers.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate">
                <button
                  className="px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Previous
                </button>
                {Array.from(
                  {
                    length: Math.ceil(filteredEmployers.length / itemsPerPage),
                  },
                  (_, i) => (
                    <button
                      key={i + 1}
                      className={`px-4 py-2 text-sm font-medium ${
                        page === i + 1
                          ? "text-blue-600 border-blue-500 bg-blue-50"
                          : "text-gray-500 border-gray-300 bg-white"
                      } hover:bg-gray-50`}
                      onClick={() => setPage(i + 1)}
                      disabled={loading}
                    >
                      {i + 1}
                    </button>
                  )
                )}
                <button
                  className="px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                  onClick={() => setPage(page + 1)}
                  disabled={
                    page ===
                      Math.ceil(filteredEmployers.length / itemsPerPage) ||
                    loading
                  }
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerManagement;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility } from "react-icons/md";
import { fetchEmployers, updateEmployerKYC } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const EmployerManagement = () => {
  const [employers, setEmployers] = useState([]);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployers, setTotalEmployers] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const loadEmployers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEmployers({
        page,
        limit: itemsPerPage,
        search,
        kycStatus: kycFilter
      });
      setEmployers(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalEmployers(response.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEmployers();
    }
  }, [user, page, search, kycFilter]);

  const handleApprove = async (id, name) => {
    setLoading(true);
    setError(null);
    try {
      await updateEmployerKYC(id, { kyc_status: "Verified" });
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

  const handleReject = async (id, name) => {
    setLoading(true);
    setError(null);
    try {
      await updateEmployerKYC(id, { kyc_status: "Rejected" });
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
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                View
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                KYC Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employers.map((employer) => (
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
                  {new Date(employer.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                    onClick={() => navigate(`/super-admin/employer-details/${employer.id}`)}
                  >
                    <MdVisibility className="mr-1" /> View
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  {employer.kyc_status === "Pending" ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                        onClick={() => handleApprove(employer.id, employer.name)}
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button
                        className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                        onClick={() => handleReject(employer.id, employer.name)}
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${{
                        Verified: 'bg-green-100 text-green-800',
                        Pending: 'bg-yellow-100 text-yellow-800',
                        Rejected: 'bg-red-100 text-red-800',
                      }[employer.kyc_status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {employer.kyc_status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerManagement;

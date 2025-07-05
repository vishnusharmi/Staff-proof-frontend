import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Eye,
  Upload,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchVerifierEmployeeCases, updateVerifierCaseStatus } from "../../../components/api/api";

const EmployeesCaseDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedCases, setAssignedCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5
  });
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Load employee cases from API
  useEffect(() => {
    const loadEmployeeCases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page: currentPage,
          limit: itemsPerPage
        };

        const response = await fetchVerifierEmployeeCases(params);
        setAssignedCases(response.data?.cases || []);
        setPagination(response.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 5
        });
      } catch (err) {
        console.error('Error loading employee cases:', err);
        setError(err.response?.data?.message || 'Failed to load employee cases');
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeCases();
  }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const updateCaseStatus = async (caseId, newStatus) => {
    try {
      await updateVerifierCaseStatus(caseId, { status: newStatus });
      
      // Update local state
      setAssignedCases((prev) =>
        prev.map((case_) =>
          case_.id === caseId
            ? {
                ...case_,
                status: newStatus,
                profileStatus: getProfileStatusFromStatus(newStatus),
              }
            : case_
        )
      );
    } catch (err) {
      console.error('Error updating case status:', err);
      setError(err.response?.data?.message || 'Failed to update case status');
    }
  };

  const getProfileStatusFromStatus = (status) => {
    switch (status) {
      case "verified":
        return "Completed";
      case "flagged":
        return "Flagged";
      case "rejected":
        return "Rejected";
      default:
        return "In Progress";
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pagination.totalPages);
      } else if (currentPage >= pagination.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = pagination.totalPages - 3; i <= pagination.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pagination.totalPages);
      }
    }
    
    return pages;
  };

  const toggleDropdown = (caseId) => {
    setOpenDropdown(openDropdown === caseId ? null : caseId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-100";
      case "flagged":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "new":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "flagged":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "submitted":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employee Verification Cases
              </h1>
              <p className="text-gray-600">
                Manage and track employee verification progress
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="verified">Verified</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedCases.map((case_) => (
                  <tr key={case_.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {case_.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">{case_.id}</div>
                        <div className="text-sm text-gray-500">{case_.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          case_.status
                        )}`}
                      >
                        {case_.profileStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                          case_.priority
                        )}`}
                      >
                        {case_.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {Object.entries(case_.documents).map(([docType, status]) => (
                          <div key={docType} className="flex items-center" title={`${docType}: ${status}`}>
                            {getDocumentStatusIcon(status)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(case_.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => toggleDropdown(case_.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdown === case_.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedCase(case_);
                                  setShowNotes(true);
                                  closeDropdown();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <MessageSquare className="w-4 h-4 inline mr-2" />
                                Add Notes
                              </button>
                              <button
                                onClick={() => {
                                  updateCaseStatus(case_.id, "verified");
                                  closeDropdown();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                              >
                                <CheckCircle className="w-4 h-4 inline mr-2" />
                                Mark Verified
                              </button>
                              <button
                                onClick={() => {
                                  updateCaseStatus(case_.id, "flagged");
                                  closeDropdown();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100"
                              >
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                Flag Case
                              </button>
                              <button
                                onClick={() => {
                                  updateCaseStatus(case_.id, "rejected");
                                  closeDropdown();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                <XCircle className="w-4 h-4 inline mr-2" />
                                Reject Case
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {assignedCases.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employee cases found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of{" "}
                  {pagination.totalItems} results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesCaseDetails;

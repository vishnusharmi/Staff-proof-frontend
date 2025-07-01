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
// import { NavLink } from "react-router";

// Mock backend data
const mockData = {
  verifier: {
    name: "Sarah Johnson",
    id: "VER_001",
  },
  stats: {
    totalAssigned: 24,
    casesVerified: 18,
    casesFlagged: 4,
    averageVerificationTime: "2.5 hours",
  },
  assignedCases: [
    {
      id: "SP_001234",
      employeeName: "Rahul Sharma",
      profileStatus: "In Progress",
      assignedDate: "2025-06-08",
      status: "new",
      priority: "medium",
      documents: {
        resume: "submitted",
        govtId: "submitted",
        payslips: "submitted",
        experienceLetters: "submitted",
        educationalCerts: "pending",
      },
    },
    {
      id: "SP_001235",
      employeeName: "Priya Patel",
      profileStatus: "Completed",
      assignedDate: "2025-06-07",
      status: "verified",
      priority: "low",
      documents: {
        resume: "verified",
        govtId: "verified",
        payslips: "verified",
        experienceLetters: "verified",
        educationalCerts: "verified",
      },
    },
    {
      id: "SP_001236",
      employeeName: "Amit Kumar",
      profileStatus: "Flagged",
      assignedDate: "2025-06-09",
      status: "flagged",
      priority: "high",
      documents: {
        resume: "flagged",
        govtId: "verified",
        payslips: "flagged",
        experienceLetters: "incomplete",
        educationalCerts: "submitted",
      },
    },
    {
      id: "SP_001237",
      employeeName: "Sneha Reddy",
      profileStatus: "In Progress",
      assignedDate: "2025-06-10",
      status: "in_progress",
      priority: "medium",
      documents: {
        resume: "submitted",
        govtId: "verified",
        payslips: "submitted",
        experienceLetters: "submitted",
        educationalCerts: "submitted",
      },
    },
  ],
};

const EmployeesCaseDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedCases, setAssignedCases] = useState(mockData.assignedCases);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Mock backend functions
  const fetchAssignedCases = () => {
    // Simulate API call
    return mockData.assignedCases;
  };

  const updateCaseStatus = (caseId, newStatus) => {
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

  const filteredCases = assignedCases.filter((case_) => {
    const matchesSearch =
      case_.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCases = filteredCases.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Dropdown handlers
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
        return "text-green-600 bg-green-50";
      case "flagged":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "in_progress":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "incomplete":
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employees Case Management
              </h1>
              {/* <p className="text-sm text-gray-500">
                Verifier ID: {mockData.verifier.id}
              </p> */}
            </div>
            {/* <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Session expires in:{" "}
                <span className="font-medium text-red-600">12:45</span>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Stats Section */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Assigned Cases
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockData.stats.totalAssigned}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Cases Verified
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockData.stats.casesVerified}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Cases Flagged
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockData.stats.casesFlagged}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Avg. Verification Time
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockData.stats.averageVerificationTime}
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by StaffProof ID or Employee Name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="verified">Verified</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases List */}
        <div className="space-y-4">
          {currentCases.map((case_) => (
            <div
              key={case_.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(
                case_.priority
              )}`}
            >
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {case_.employeeName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          StaffProof ID: {case_.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned: {case_.assignedDate}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          case_.status
                        )}`}
                      >
                        {case_.profileStatus}
                      </div>
                    </div>

                    {/* Document Status */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Document Status:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(case_.documents).map(
                          ([docType, status]) => (
                            <div
                              key={docType}
                              className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded"
                            >
                              {getDocumentStatusIcon(status)}
                              <span className="text-xs text-gray-600 capitalize">
                                {docType.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      //   onClick={() => setSelectedCase(case_)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <Link to="/verifier/view">Open Case</Link>
                    </button>
                    <button
                      onClick={() => setShowNotes(!showNotes)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Notes
                    </button>

                    {/* Action Dropdown */}
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => toggleDropdown(case_.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-md border border-gray-300"
                        title="More Actions"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {openDropdown === case_.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                updateCaseStatus(case_.id, "verified");
                                closeDropdown();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Verified
                            </button>
                            <button
                              onClick={() => {
                                updateCaseStatus(case_.id, "flagged");
                                closeDropdown();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Flag Case
                            </button>
                            <button
                              onClick={() => {
                                updateCaseStatus(case_.id, "rejected");
                                closeDropdown();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Case
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No cases found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filter settings.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredCases.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCases.length)} of {filteredCases.length} results
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center space-x-1">
                {/* First page button */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous page button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 rounded-md border transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : page === '...'
                        ? 'border-gray-300 text-gray-400 cursor-default'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next page button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last page button */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Case Details - {selectedCase.employeeName}
                </h2>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Employee Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {selectedCase.employeeName}
                    </p>
                    <p>
                      <span className="font-semibold">StaffProof ID:</span>{" "}
                      {selectedCase.id}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {selectedCase.profileStatus}
                    </p>
                    <p>
                      <span className="font-semibold">Assigned Date:</span>{" "}
                      {selectedCase.assignedDate}
                    </p>
                    <p>
                      <span className="font-semibold">Priority:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          selectedCase.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : selectedCase.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedCase.priority.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Document Status
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(selectedCase.documents).map(
                      ([docType, status]) => (
                        <div
                          key={docType}
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">
                            {docType.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <div className="flex items-center space-x-1">
                            {getDocumentStatusIcon(status)}
                            <span className="text-sm capitalize">{status}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    // Handle clarification request
                    alert("Clarification request sent to employee");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Clarification
                </button>
                <button
                  onClick={() => updateCaseStatus(selectedCase.id, "verified")}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Mark as Verified
                </button>
                <button
                  onClick={() => updateCaseStatus(selectedCase.id, "flagged")}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  Flag Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Verification Notes
                </h2>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add your verification notes here..."
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowNotes(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Notes saved successfully");
                    setShowNotes(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesCaseDetails;

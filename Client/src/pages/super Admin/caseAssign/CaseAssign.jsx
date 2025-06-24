import React, { useState } from "react";
import {
  Users,
  UserCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  Building,
  GraduationCap,
  FileText,
  ArrowRight,
} from "lucide-react";

const CaseAssign = () => {
  const [selectedCases, setSelectedCases] = useState([]);
  const [selectedVerifier, setSelectedVerifier] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("unassigned");
  const [filterUserType, setFilterUserType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Mock data for cases
  const cases = [
    {
      id: "SP001",
      name: "John Doe",
      email: "john@example.com",
      type: "employee",
      company: "Tech Corp",
      registrationDate: "2024-01-15",
      status: "unassigned",
      documentsCount: 5,
      verifier: null,
      priority: "high",
      daysWaiting: 3,
    },
    {
      id: "SP002",
      name: "Jane Smith",
      email: "jane@example.com",
      type: "employee",
      company: "Digital Solutions",
      registrationDate: "2024-01-16",
      status: "assigned",
      documentsCount: 4,
      verifier: "Alice Johnson",
      priority: "medium",
      daysWaiting: 2,
    },
    {
      id: "SP003",
      name: "TechCorp Ltd",
      email: "hr@techcorp.com",
      type: "company",
      company: "TechCorp Ltd",
      registrationDate: "2024-01-14",
      status: "in_verification",
      documentsCount: 8,
      verifier: "Bob Wilson",
      priority: "low",
      daysWaiting: 4,
    },
    {
      id: "SP004",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      type: "employee",
      company: "StartupXYZ",
      registrationDate: "2024-01-17",
      status: "unassigned",
      documentsCount: 3,
      verifier: null,
      priority: "high",
      daysWaiting: 1,
    },
    {
      id: "SP005",
      name: "Mike Chen",
      email: "mike@example.com",
      type: "employee",
      company: "Innovation Labs",
      registrationDate: "2024-01-18",
      status: "unassigned",
      documentsCount: 6,
      verifier: null,
      priority: "medium",
      daysWaiting: 0,
    },
    {
      id: "SP006",
      name: "Lisa Wang",
      email: "lisa@example.com",
      type: "employee",
      company: "Future Tech",
      registrationDate: "2024-01-12",
      status: "reassign_needed",
      documentsCount: 7,
      verifier: "Carol Davis",
      priority: "high",
      daysWaiting: 6,
    },
  ];

  const verifiers = [
    {
      id: "V001",
      name: "Alice Johnson",
      email: "alice@staffproof.com",
      assignedCases: 12,
      maxCapacity: 20,
      activeStatus: "active",
    },
    {
      id: "V002",
      name: "Bob Wilson",
      email: "bob@staffproof.com",
      assignedCases: 18,
      maxCapacity: 20,
      activeStatus: "active",
    },
    {
      id: "V003",
      name: "Carol Davis",
      email: "carol@staffproof.com",
      assignedCases: 15,
      maxCapacity: 25,
      activeStatus: "active",
    },
    {
      id: "V004",
      name: "David Brown",
      email: "david@staffproof.com",
      assignedCases: 8,
      maxCapacity: 15,
      activeStatus: "active",
    },
  ];

  const stats = {
    totalCases: cases.length,
    unassigned: cases.filter((c) => c.status === "unassigned").length,
    assigned: cases.filter((c) => c.status === "assigned").length,
    inVerification: cases.filter((c) => c.status === "in_verification").length,
    highPriority: cases.filter((c) => c.priority === "high").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "unassigned":
        return "bg-red-100 text-red-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_verification":
        return "bg-yellow-100 text-yellow-800";
      case "reassign_needed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "unassigned":
        return <XCircle className="w-4 h-4" />;
      case "assigned":
        return <CheckCircle className="w-4 h-4" />;
      case "in_verification":
        return <Clock className="w-4 h-4" />;
      case "reassign_needed":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || caseItem.status === filterStatus;
    const matchesType =
      filterUserType === "all" || caseItem.type === filterUserType;
    const matchesPriority =
      filterPriority === "all" || caseItem.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const handleCaseSelection = (caseId) => {
    setSelectedCases((prev) =>
      prev.includes(caseId)
        ? prev.filter((id) => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleAssignCases = () => {
    if (selectedCases.length > 0 && selectedVerifier) {
      const verifierName = verifiers.find(
        (v) => v.id === selectedVerifier
      )?.name;
      alert(
        `Successfully assigned ${selectedCases.length} cases to ${verifierName}`
      );
      setSelectedCases([]);
      setSelectedVerifier("");
    }
  };

  const handleReassignCase = (caseId) => {
    setSelectedCases([caseId]);
  };

  const getVerifierWorkload = (verifierId) => {
    const verifier = verifiers.find((v) => v.id === verifierId);
    if (!verifier) return "";
    const percentage = Math.round(
      (verifier.assignedCases / verifier.maxCapacity) * 100
    );
    return `${percentage}%`;
  };

  const getVerifierWorkloadColor = (verifierId) => {
    const verifier = verifiers.find((v) => v.id === verifierId);
    if (!verifier) return "text-gray-500";
    const percentage = (verifier.assignedCases / verifier.maxCapacity) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Case Assignment Dashboard
          </h1>
          <p className="text-gray-600">
            Assign verification cases to available verifiers and manage workload
            distribution
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCases}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.unassigned}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.assigned}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  In Verification
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.inVerification}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.highPriority}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Verifier Workload Overview */}
        <div className="bg-white p-6 rounded-lg shadow border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verifier Workload
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {verifiers.map((verifier) => (
              <div key={verifier.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {verifier.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${getVerifierWorkloadColor(
                      verifier.id
                    )}`}
                  >
                    {getVerifierWorkload(verifier.id)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {verifier.assignedCases}/{verifier.maxCapacity} cases
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      verifier.assignedCases / verifier.maxCapacity >= 0.9
                        ? "bg-red-500"
                        : verifier.assignedCases / verifier.maxCapacity >= 0.7
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${
                        (verifier.assignedCases / verifier.maxCapacity) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow border mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or case ID..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned</option>
                <option value="in_verification">In Verification</option>
                <option value="reassign_needed">Reassign Needed</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="employee">Employee</option>
                <option value="company">Company</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignment Panel */}
        {selectedCases.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedCases.length} cases selected
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
                <select
                  className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedVerifier}
                  onChange={(e) => setSelectedVerifier(e.target.value)}
                >
                  <option value="">Select Verifier</option>
                  {verifiers
                    .filter((v) => v.activeStatus === "active")
                    .map((verifier) => (
                      <option key={verifier.id} value={verifier.id}>
                        {verifier.name} ({verifier.assignedCases}/
                        {verifier.maxCapacity} cases)
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAssignCases}
                  disabled={!selectedVerifier}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Assign Cases
                </button>
                <button
                  onClick={() => setSelectedCases([])}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cases Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCases(filteredCases.map((c) => c.id));
                        } else {
                          setSelectedCases([]);
                        }
                      }}
                      checked={
                        selectedCases.length === filteredCases.length &&
                        filteredCases.length > 0
                      }
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waiting Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Verifier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCases.includes(caseItem.id)}
                        onChange={() => handleCaseSelection(caseItem.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {caseItem.type === "company" ? (
                              <Building className="w-5 h-5 text-gray-600" />
                            ) : (
                              <GraduationCap className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {caseItem.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {caseItem.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {caseItem.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          caseItem.priority
                        )}`}
                      >
                        {caseItem.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(
                          caseItem.status
                        )}`}
                      >
                        {getStatusIcon(caseItem.status)}
                        {caseItem.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {caseItem.documentsCount} docs
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div
                        className={`flex items-center gap-1 ${
                          caseItem.daysWaiting > 3
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        {caseItem.daysWaiting} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caseItem.verifier ? (
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          {caseItem.verifier}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {caseItem.status === "reassign_needed" && (
                          <button
                            onClick={() => handleReassignCase(caseItem.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Reassign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No cases found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseAssign;

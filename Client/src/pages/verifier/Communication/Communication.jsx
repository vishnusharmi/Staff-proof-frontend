import React, { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  Mail,
  Building2,
  Search,
  ChevronDown,
  User,
  Eye,
} from "lucide-react";

const Communication = ({
  employeeId,
  verifierId,
  employeeName = "John Smith",
  staffProofId = "SP12345",
}) => {
  const [activeTab, setActiveTab] = useState("clarification");
  const [clarificationMessage, setClarificationMessage] = useState("");
  const [companyMessage, setCompanyMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [clarificationRequests, setClarificationRequests] = useState([]);
  const [companyRequests, setCompanyRequests] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee and Company selection states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Mock data for employees and companies
  const [employees] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      staffProofId: "SP12345",
      department: "Engineering",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      staffProofId: "SP12346",
      department: "Marketing",
    },
    {
      id: 3,
      name: "Mike Davis",
      email: "mike.davis@email.com",
      staffProofId: "SP12347",
      department: "Finance",
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "emily.wilson@email.com",
      staffProofId: "SP12348",
      department: "HR",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@email.com",
      staffProofId: "SP12349",
      department: "Operations",
    },
  ]);

  const [companies] = useState([
    {
      id: 1,
      name: "TechCorp Solutions",
      email: "hr@techcorp.com",
      contact: "+91-9876543210",
      industry: "Technology",
    },
    {
      id: 2,
      name: "Global Finance Ltd",
      email: "verification@globalfinance.com",
      contact: "+91-9876543211",
      industry: "Finance",
    },
    {
      id: 3,
      name: "Healthcare Partners",
      email: "hr@healthcarepartners.com",
      contact: "+91-9876543212",
      industry: "Healthcare",
    },
    {
      id: 4,
      name: "Manufacturing Corp",
      email: "admin@manufacturingcorp.com",
      contact: "+91-9876543213",
      industry: "Manufacturing",
    },
    {
      id: 5,
      name: "Retail Giants",
      email: "verification@retailgiants.com",
      contact: "+91-9876543214",
      industry: "Retail",
    },
  ]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate fetching existing clarification requests
    setClarificationRequests([
      {
        id: 1,
        message:
          "Please provide a clearer scan of your experience letter from TechCorp. The current image is blurry and unreadable.",
        sentAt: "2025-06-10T14:30:00Z",
        status: "pending",
        employeeResponse: null,
        employeeName: "John Smith",
        employeeId: 1,
      },
      {
        id: 2,
        message:
          "The salary mentioned in your payslip doesn't match the experience letter. Can you clarify this discrepancy?",
        sentAt: "2025-06-09T10:15:00Z",
        status: "responded",
        employeeResponse:
          "There was a salary revision in March 2024. I'll upload the revised letter.",
        respondedAt: "2025-06-09T16:45:00Z",
        employeeName: "Sarah Johnson",
        employeeId: 2,
      },
    ]);

    // Simulate company clarification requests
    setCompanyRequests([
      {
        id: 1,
        message:
          "We need verification of employment dates for John Smith (Employee ID: EMP001). Please confirm his tenure from 2020-2023.",
        sentAt: "2025-06-10T11:00:00Z",
        status: "pending",
        companyResponse: null,
        companyName: "TechCorp Solutions",
        companyId: 1,
      },
    ]);

    // Simulate admin chat history
    setAdminChats([
      {
        id: 1,
        sender: "admin",
        senderName: "Admin Team",
        message:
          "This case has some suspicious documents. Please verify thoroughly.",
        sentAt: "2025-06-10T09:00:00Z",
      },
      {
        id: 2,
        sender: "verifier",
        senderName: "Current Verifier",
        message:
          "I've noticed inconsistencies in the experience letters. Should I flag this case?",
        sentAt: "2025-06-10T09:30:00Z",
      },
    ]);
  }, []);

  // Filter functions
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.staffProofId
        .toLowerCase()
        .includes(employeeSearchTerm.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearchTerm(employee.name);
    setShowEmployeeDropdown(false);
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setCompanySearchTerm(company.name);
    setShowCompanyDropdown(false);
  };

  const handlePreview = (type) => {
    const message = type === "employee" ? clarificationMessage : companyMessage;
    const recipient = type === "employee" ? selectedEmployee : selectedCompany;

    if (!message.trim() || !recipient) return;

    setPreviewData({
      type,
      message,
      recipient,
      timestamp: new Date().toISOString(),
    });
    setShowPreview(true);
  };

  const handleClarificationSubmit = async () => {
    if (!clarificationMessage.trim() || !selectedEmployee) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("verifierToken") || "";

      const response = await fetch("/api/verifier/clarification-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          verifierId,
          message: clarificationMessage,
          staffProofId: selectedEmployee.staffProofId,
        }),
      });

      if (response.ok) {
        const newRequest = {
          id: Date.now(),
          message: clarificationMessage,
          sentAt: new Date().toISOString(),
          status: "pending",
          employeeResponse: null,
          employeeName: selectedEmployee.name,
          employeeId: selectedEmployee.id,
        };

        setClarificationRequests((prev) => [newRequest, ...prev]);
        setClarificationMessage("");
        setSelectedEmployee(null);
        setEmployeeSearchTerm("");

        alert(
          "Clarification request sent successfully! Employee will be notified via email."
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending clarification:", error);
      alert("Failed to send clarification request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanyMessageSubmit = async () => {
    if (!companyMessage.trim() || !selectedCompany) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("verifierToken") || "";

      const response = await fetch("/api/verifier/company-clarification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          verifierId,
          message: companyMessage,
        }),
      });

      if (response.ok) {
        const newRequest = {
          id: Date.now(),
          message: companyMessage,
          sentAt: new Date().toISOString(),
          status: "pending",
          companyResponse: null,
          companyName: selectedCompany.name,
          companyId: selectedCompany.id,
        };

        setCompanyRequests((prev) => [newRequest, ...prev]);
        setCompanyMessage("");
        setSelectedCompany(null);
        setCompanySearchTerm("");

        alert(
          "Company clarification request sent successfully! Company will be notified via email."
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending company message:", error);
      alert("Failed to send company clarification request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminMessageSubmit = async () => {
    if (!adminMessage.trim()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("verifierToken") || "";

      const response = await fetch("/api/verifier/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId,
          verifierId,
          message: adminMessage,
          type: "escalation",
        }),
      });

      if (response.ok) {
        const newMessage = {
          id: Date.now(),
          sender: "verifier",
          senderName: "Current Verifier",
          message: adminMessage,
          sentAt: new Date().toISOString(),
        };

        setAdminChats((prev) => [...prev, newMessage]);
        setAdminMessage("");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending admin message:", error);
      alert("Failed to send message to admin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "responded":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const sanitizeInput = (input) => {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold">Communication Panel</h2>
            <p className="text-blue-100 text-sm">
              Verification Communication System
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("clarification")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "clarification"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Employee Clarification
            </div>
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "company"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Clarification
            </div>
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "admin"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Admin Chat
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Employee Clarification Tab */}
        {activeTab === "clarification" && (
          <div className="space-y-6">
            {/* Send New Clarification */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Send Employee Clarification Request
              </h3>

              {/* Employee Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={employeeSearchTerm}
                      onChange={(e) => {
                        setEmployeeSearchTerm(e.target.value);
                        setShowEmployeeDropdown(true);
                      }}
                      onFocus={() => setShowEmployeeDropdown(true)}
                      placeholder="Search employee by name, email, or StaffProof ID..."
                      className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {showEmployeeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            onClick={() => handleEmployeeSelect(employee)}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {employee.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {employee.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {employee.staffProofId} •{" "}
                                  {employee.department}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-center">
                          No employees found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <textarea
                value={clarificationMessage}
                onChange={(e) => setClarificationMessage(e.target.value)}
                placeholder="Type your clarification request here. Be specific about what documents or information you need from the employee..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-600">
                  Employee will receive an email notification and dashboard
                  alert
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview("employee")}
                    disabled={!clarificationMessage.trim() || !selectedEmployee}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={handleClarificationSubmit}
                    disabled={
                      !clarificationMessage.trim() ||
                      !selectedEmployee ||
                      isSubmitting
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>

            {/* Clarification History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Request History ({clarificationRequests.length})
              </h3>
              <div className="space-y-4">
                {clarificationRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No clarification requests sent yet</p>
                  </div>
                ) : (
                  clarificationRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(request.status)}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {request.status === "pending"
                                  ? "Pending Response"
                                  : "Responded"}
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                To: {request.employeeName}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(request.sentAt)}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-2">
                            {sanitizeInput(request.message)}
                          </p>
                          {request.employeeResponse && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                              <p className="text-sm font-medium text-blue-800 mb-1">
                                Employee Response:
                              </p>
                              <p className="text-blue-700">
                                {sanitizeInput(request.employeeResponse)}
                              </p>
                              <p className="text-xs text-blue-600 mt-2">
                                Responded on{" "}
                                {formatDateTime(request.respondedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Company Clarification Tab */}
        {activeTab === "company" && (
          <div className="space-y-6">
            {/* Send New Company Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Send Company Clarification Request
              </h3>

              {/* Company Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Company
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={companySearchTerm}
                      onChange={(e) => {
                        setCompanySearchTerm(e.target.value);
                        setShowCompanyDropdown(true);
                      }}
                      onFocus={() => setShowCompanyDropdown(true)}
                      placeholder="Search company by name or email..."
                      className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {showCompanyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => (
                          <div
                            key={company.id}
                            onClick={() => handleCompanySelect(company)}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {company.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {company.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {company.contact} • {company.industry}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-center">
                          No companies found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <textarea
                value={companyMessage}
                onChange={(e) => setCompanyMessage(e.target.value)}
                placeholder="Type your clarification request to the company. Be specific about what verification or information you need..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-600">
                  Company will receive an email notification
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview("company")}
                    disabled={!companyMessage.trim() || !selectedCompany}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={handleCompanyMessageSubmit}
                    disabled={
                      !companyMessage.trim() || !selectedCompany || isSubmitting
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>

            {/* Company Request History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Company Request History ({companyRequests.length})
              </h3>
              <div className="space-y-4">
                {companyRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No company clarification requests sent yet</p>
                  </div>
                ) : (
                  companyRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(request.status)}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {request.status === "pending"
                                  ? "Pending Response"
                                  : "Responded"}
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                To: {request.companyName}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(request.sentAt)}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-2">
                            {sanitizeInput(request.message)}
                          </p>
                          {request.companyResponse && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-3 mt-3">
                              <p className="text-sm font-medium text-green-800 mb-1">
                                Company Response:
                              </p>
                              <p className="text-green-700">
                                {sanitizeInput(request.companyResponse)}
                              </p>
                              <p className="text-xs text-green-600 mt-2">
                                Responded on{" "}
                                {formatDateTime(request.respondedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Chat Tab */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Internal Communication
              </h3>
              <div className="space-y-3">
                {adminChats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No admin messages yet</p>
                  </div>
                ) : (
                  adminChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex ${
                        chat.sender === "verifier"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          chat.sender === "verifier"
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {sanitizeInput(chat.senderName)}
                        </p>
                        <p className="text-sm">{sanitizeInput(chat.message)}</p>
                        <p
                          className={`text-xs mt-1 ${
                            chat.sender === "verifier"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatDateTime(chat.sentAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Send Message */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Send a message to admin team for escalation or clarification..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-600">
                  Internal communication only - not visible to employee
                </p>
                <button
                  onClick={handleAdminMessageSubmit}
                  disabled={!adminMessage.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Message Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                {previewData.type === "employee" ? (
                  <User className="w-5 h-5 text-blue-600" />
                ) : (
                  <Building2 className="w-5 h-5 text-green-600" />
                )}
                <span className="font-medium text-gray-800">
                  To: {previewData.recipient.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-800">{previewData.recipient.email}</p>
                </div>
                {previewData.type === "employee" ? (
                  <div>
                    <span className="font-medium text-gray-600">
                      StaffProof ID:
                    </span>
                    <p className="text-gray-800">
                      {previewData.recipient.staffProofId}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="font-medium text-gray-600">Contact:</span>
                    <p className="text-gray-800">
                      {previewData.recipient.contact}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <span className="font-medium text-gray-600">Message:</span>
                <p className="text-gray-800 mt-2 whitespace-pre-wrap">
                  {previewData.message}
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <span className="text-xs text-gray-500">
                  Will be sent on: {formatDateTime(previewData.timestamp)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewData.type === "employee") {
                    handleClarificationSubmit();
                  } else {
                    handleCompanyMessageSubmit();
                  }
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;

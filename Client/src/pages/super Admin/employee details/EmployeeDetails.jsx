import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Shield,
  Activity,
  CreditCard,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { fetchEmployeeDetails } from '../../../components/api/api';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [documentStatus, setDocumentStatus] = useState({});
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    const loadEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEmployeeDetails(id);
        setEmployeeData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadEmployee();
    }
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading employee details...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  if (!employeeData) {
    return <div className="p-4">No employee data found.</div>;
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "denied":
        return "bg-red-100 text-red-800 border-red-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "approved":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
      case "denied":
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleDocumentAction = (docType, action) => {
    setDocumentStatus((prev) => ({
      ...prev,
      [docType]: action,
    }));
  };

  const handleImpersonateLogin = () => {
    alert("Impersonating employee login for debugging/support purposes");
  };

  const handleProfileAction = (action) => {
    alert(`Profile ${action} successfully`);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "jobHistory", label: "Job History", icon: Briefcase },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "access", label: "Access Logs", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button> */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Employee Details
                </h1>
                <p className="text-sm text-gray-500">ID: {employeeData.id}</p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-3">
              <button
                onClick={handleImpersonateLogin}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Impersonate Login</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Info Card */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-6">
              {/* <img
                src={employeeData.profilePicture}
                alt={employeeData.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              /> */}
              <div className="text-white">
                <h2 className="text-2xl font-bold">{employeeData.name}</h2>
                <p className="text-blue-100 mb-2">
                  {employeeData.currentDesignation}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{employeeData.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{employeeData.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Verification Status
                    </p>
                    <p className="text-green-900 font-bold text-lg">
                      {employeeData.isVerified}
                    </p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Profile Status
                    </p>
                    <p className="text-blue-900 font-bold text-lg">
                      {employeeData.profileStatus}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">
                      Experience
                    </p>
                    <p className="text-purple-900 font-bold text-lg">
                      {employeeData.totalExperience}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">
                      Last Login
                    </p>
                    <p className="text-orange-900 font-bold text-sm">
                      {employeeData.lastLogin}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <span>Personal Information</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Full Address</p>
                        <p className="font-medium">{employeeData.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Registration Date
                        </p>
                        <p className="font-medium">
                          {employeeData.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <span>Admin Actions</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleProfileAction("approved")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Approve Profile
                        </button>
                        <button
                          onClick={() => handleProfileAction("rejected")}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Reject Profile
                        </button>
                      </div>
                      <div>
                        <textarea
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          placeholder="Add admin comment..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                        />
                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Save Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-6">
                  Document Verification
                </h3>
                <div className="grid gap-4">
                  {Object.entries(employeeData.documents).map(
                    ([docType, doc]) => (
                      <div
                        key={docType}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold capitalize">
                                {docType.replace(/([A-Z])/g, " $1")}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {doc.filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                Uploaded: {doc.uploadDate} • Size: {doc.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(
                                doc.status
                              )}`}
                            >
                              {getStatusIcon(doc.status)}
                              <span>{doc.status}</span>
                            </span>
                            <div className="flex space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={() =>
                              handleDocumentAction(docType, "verified")
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() =>
                              handleDocumentAction(docType, "rejected")
                            }
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                            Flag as Suspicious
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === "jobHistory" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-6">
                  Employment History
                </h3>
                <div className="space-y-4">
                  {employeeData.jobHistory.map((job, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <Building className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{job.company}</h4>
                            <p className="text-gray-600">{job.designation}</p>
                            <p className="text-sm text-gray-500">
                              {job.duration} • {job.location}
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              {job.salary}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${
                              job.verified
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-yellow-100 text-yellow-800 border-yellow-300"
                            }`}
                          >
                            {job.verified ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                            <span>{job.verified ? "Verified" : "Pending"}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-6">Billing History</h3>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employeeData.billingHistory.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 w-fit ${getStatusColor(
                                transaction.status
                              )}`}
                            >
                              {getStatusIcon(transaction.status)}
                              <span>{transaction.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "access" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-6">
                  Access Request Logs
                </h3>
                <div className="space-y-4">
                  {employeeData.accessRequests.map((request, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-indigo-100 rounded-lg">
                            <Shield className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {request.employer}
                            </h4>
                            <p className="text-gray-600">
                              {request.requestedBy}
                            </p>
                            <p className="text-sm text-gray-500">
                              Document: {request.documentType}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested: {request.requestDate}
                              {request.responseDate &&
                                ` • Responded: ${request.responseDate}`}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span>{request.status}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;

import React, { useState } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Clock,
  Star,
  TrendingUp,
  Activity,
  Settings,
} from "lucide-react";

const EmployerDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Sample employer data
  const employerData = {
    id: "EMP-2024-001",
    companyName: "TechVision Solutions Pvt Ltd",
    email: "hr@techvision.com",
    phone: "+91 98765 43210",
    website: "www.techvision.com",
    address: "Tower A, Cyber Towers, HITEC City, Hyderabad, Telangana 500081",
    registrationDate: "2024-01-15",
    kycStatus: "verified",
    subscriptionPlan: "Enterprise",
    planExpiry: "2024-12-15",
    employeesVerified: 247,
    monthlyRevenue: 45000,
    totalRevenue: 540000,
    status: "active",
    lastActive: "2024-06-18T10:30:00Z",
    rating: 4.8,

    // Company documents
    documents: [
      {
        id: 1,
        type: "PAN Card",
        fileName: "company_pan.pdf",
        uploadDate: "2024-01-15",
        status: "verified",
        verifiedBy: "Admin_Sarah",
        verifiedDate: "2024-01-16",
      },
      {
        id: 2,
        type: "GST Certificate",
        fileName: "gst_certificate.pdf",
        uploadDate: "2024-01-15",
        status: "verified",
        verifiedBy: "Admin_Sarah",
        verifiedDate: "2024-01-16",
      },
      {
        id: 3,
        type: "Certificate of Incorporation",
        fileName: "incorporation_cert.pdf",
        uploadDate: "2024-01-15",
        status: "verified",
        verifiedBy: "Admin_Sarah",
        verifiedDate: "2024-01-16",
      },
      {
        id: 4,
        type: "Business License",
        fileName: "business_license.pdf",
        uploadDate: "2024-02-01",
        status: "pending",
        verifiedBy: null,
        verifiedDate: null,
      },
    ],

    // Usage logs
    // usageLogs: [
    //   {
    //     id: 1,
    //     action: "Employee Profile Accessed",
    //     employeeName: "Rahul Sharma",
    //     employeeId: "SP-2024-0156",
    //     timestamp: "2024-06-18T09:45:00Z",
    //     accessType: "Full Profile",
    //   },
    //   {
    //     id: 2,
    //     action: "Background Check Requested",
    //     employeeName: "Priya Patel",
    //     employeeId: "SP-2024-0189",
    //     timestamp: "2024-06-18T08:30:00Z",
    //     accessType: "Verification Only",
    //   },
    //   {
    //     id: 3,
    //     action: "Bulk Export",
    //     employeeName: "Multiple Employees",
    //     employeeId: "BULK-001",
    //     timestamp: "2024-06-17T16:20:00Z",
    //     accessType: "CSV Export",
    //   },
    // ],

    // Billing history
    billingHistory: [
      {
        id: 1,
        invoiceNumber: "INV-2024-001",
        amount: 45000,
        date: "2024-06-01",
        status: "paid",
        description: "Enterprise Plan - June 2024",
        paymentMethod: "Bank Transfer",
      },
      {
        id: 2,
        invoiceNumber: "INV-2024-002",
        amount: 45000,
        date: "2024-05-01",
        status: "paid",
        description: "Enterprise Plan - May 2024",
        paymentMethod: "UPI",
      },
      {
        id: 3,
        invoiceNumber: "INV-2024-003",
        amount: 45000,
        date: "2024-04-01",
        status: "paid",
        description: "Enterprise Plan - April 2024",
        paymentMethod: "Credit Card",
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "paid":
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case "Enterprise":
        return "bg-gradient-to-r from-purple-500 to-indigo-600";
      case "Pro":
        return "bg-gradient-to-r from-blue-500 to-cyan-600";
      case "Basic":
        return "bg-gradient-to-r from-green-500 to-teal-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "documents", label: "Documents", icon: FileText },
    // { id: "usage", label: "Usage Logs", icon: Activity },
    { id: "billing", label: "Billing", icon: CreditCard },
    // { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="flex items-center gap-4 mb-8">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Employers</span>
          </button>
        </div> */}

        {/* Company Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/20">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {employerData.companyName}
                  </h1>
                  <p className="text-white/80 mb-4">
                    Company ID: {employerData.id}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-medium ${getPlanBadgeColor(
                        employerData.subscriptionPlan
                      )} text-white`}
                    >
                      {employerData.subscriptionPlan} Plan
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        employerData.status
                      )}`}
                    >
                      {employerData.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                {/* <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <Star size={16} className="text-yellow-300 fill-current" />
                  <span className="font-semibold">{employerData.rating}</span>
                </div> */}
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ₹{employerData.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-white/80 text-sm">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <Building2 className="text-indigo-600" size={24} />
                    Company Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">
                            {employerData.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">
                            {employerData.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Globe className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <p className="font-medium text-indigo-600 hover:underline cursor-pointer">
                            {employerData.website}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">
                            Registration Date
                          </p>
                          <p className="font-medium text-gray-800">
                            {new Date(
                              employerData.registrationDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">
                            Employees Verified
                          </p>
                          <p className="font-medium text-gray-800">
                            {employerData.employeesVerified}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">Last Active</p>
                          <p className="font-medium text-gray-800">
                            {new Date(employerData.lastActive).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-800">
                          {employerData.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp size={24} />
                    <span className="text-emerald-100 text-sm">This Month</span>
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    ₹{employerData.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-emerald-100">Monthly Revenue</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Users size={24} />
                    <span className="text-blue-100 text-sm">Total</span>
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {employerData.employeesVerified}
                  </p>
                  <p className="text-blue-100">Employees Verified</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Shield size={24} />
                    <span className="text-purple-100 text-sm">KYC Status</span>
                  </div>
                  <p className="text-2xl font-bold mb-1">Verified</p>
                  <p className="text-purple-100">All Documents</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FileText className="text-indigo-600" size={24} />
                Company Documents
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employerData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <FileText className="text-indigo-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {doc.type}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doc.fileName}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        {doc.status}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        Uploaded:{" "}
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                      {doc.verifiedBy && <p>Verified by: {doc.verifiedBy}</p>}
                      {doc.verifiedDate && (
                        <p>
                          Verified:{" "}
                          {new Date(doc.verifiedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="flex items-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm">
                        <Eye size={14} />
                        View
                      </button>
                      <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* {activeTab === "usage" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Activity className="text-indigo-600" size={24} />
                Usage Logs
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">
                        Action
                      </th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">
                        Employee
                      </th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">
                        Access Type
                      </th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employerData.usageLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-2">
                          <span className="font-medium text-gray-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div>
                            <p className="font-medium text-gray-800">
                              {log.employeeName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {log.employeeId}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {log.accessType}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )} */}

          {activeTab === "billing" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <CreditCard className="text-indigo-600" size={24} />
                Billing History
              </h2>

              <div className="space-y-4">
                {employerData.billingHistory.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="text-green-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {bill.invoiceNumber}
                        </h3>
                        <p className="text-gray-600">{bill.description}</p>
                        <p className="text-sm text-gray-500">
                          Payment: {bill.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{bill.amount.toLocaleString()}
                      </p>
                      <p className="text-gray-600">
                        {new Date(bill.date).toLocaleDateString()}
                      </p>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          bill.status
                        )} mt-1`}
                      >
                        {bill.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* {activeTab === "settings" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Settings className="text-indigo-600" size={24} />
                Account Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <h3 className="font-semibold text-emerald-800 mb-2">
                      Account Status
                    </h3>
                    <p className="text-emerald-700 mb-4">
                      Account is currently active and verified
                    </p>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                      Modify Status
                    </button>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Subscription Plan
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Current plan: {employerData.subscriptionPlan}
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Change Plan
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">
                      Access Control
                    </h3>
                    <p className="text-amber-700 mb-4">
                      Manage account permissions and restrictions
                    </p>
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      Modify Access
                    </button>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-red-700 mb-4">
                      Suspend or permanently disable account
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Suspend Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EmployerDetails;

import { useState } from "react";
import {
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Users,
  UserX,
  Shield,
  ChevronRight,
  Bell,
} from "lucide-react";

export default function EmprDashboard() {
  const [employerName, setEmployerName] = useState("Acme Corporation");
  const [verificationStatus, setVerificationStatus] = useState("Verified"); // "Pending" or "Verified"
  const [planDetails, setPlanDetails] = useState({
    currentPlan: "Pro", // Basic, Pro, Enterprise
    expiryDate: "June 15, 2025",
    employeeLookupsUsed: 42,
    employeeLookupsTotal: 100,
  });
  const [stats, setStats] = useState({
    employeesVerified: 78,
    accessRequestsSent: 15,
    employeesBlacklisted: 3,
  });

  // Function to render the verification status badge
  const renderVerificationBadge = () => {
    if (verificationStatus === "Verified") {
      return (
        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          <span>Verified</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          <Clock size={16} />
          <span>Pending</span>
        </div>
      );
    }
  };

  // Function to render the plan badge
  const renderPlanBadge = () => {
    const planColors = {
      Basic: "bg-gray-100 text-gray-800",
      Pro: "bg-blue-100 text-blue-800",
      Enterprise: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`${
          planColors[planDetails.currentPlan]
        } px-2 py-1 rounded-md text-xs font-medium`}
      >
        {planDetails.currentPlan}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {/* <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  StaffProof
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <div className="ml-4 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  AC
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Welcome and Verification Status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {employerName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your account today
            </p>
          </div>
          <div className="mt-4 md:mt-0">{renderVerificationBadge()}</div>
        </div>

        {/* Plan Details Card */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Plan Details
              </h2>
              {renderPlanBadge()}
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Plan
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {planDetails.currentPlan}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {planDetails.expiryDate}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Employee Lookups
                </p>
                <div className="mt-1">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {planDetails.employeeLookupsUsed}/
                      {planDetails.employeeLookupsTotal}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">Used</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (planDetails.employeeLookupsUsed /
                            planDetails.employeeLookupsTotal) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50">
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
            >
              View Plan Options <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">
                    Employees Verified
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">
                    {stats.employeesVerified}
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">
                    Access Requests Sent
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">
                    {stats.accessRequestsSent}
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
              >
                Manage Requests <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">
                    Employees Blacklisted
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">
                    {stats.employeesBlacklisted}
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
              >
                View Blacklist <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-4 flex items-center hover:bg-gray-50 transition-colors">
            <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-medium text-gray-900">
                Search by StaffProof ID
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Verify employees using their unique ID
              </p>
            </div>
          </button>

          <button className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-4 flex items-center hover:bg-gray-50 transition-colors">
            <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-medium text-gray-900">
                View Blacklist
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Check employees flagged for misconduct
              </p>
            </div>
          </button>

          <button className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-4 flex items-center hover:bg-gray-50 transition-colors">
            <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-medium text-gray-900">
                Manage Access Requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Review and approve pending requests
              </p>
            </div>
          </button>
        </div> */}
      </main>
    </div>
  );
}

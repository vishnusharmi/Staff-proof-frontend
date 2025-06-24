import {
  Search,
  CheckCircle,
  XCircle,
  Download,
  Lock,
  FileText,
  AlertCircle,
  Building,
  Calendar,
  Briefcase,
  User,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import EmployeeTable from "./EmployeeTable";
import { Link } from "react-router";

export default function EmployerSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [accessRequested, setAccessRequested] = useState(false);

  // Mock employee data for demonstration
  const mockEmployee = {
    id: "SP-123456",
    name: "Jane Smith",
    isVerified: true,
    hasBadge: true,
    hasGrantedAccess: false,
    jobRecords: [
      {
        company: "Tech Innovations Inc.",
        role: "Senior Developer",
        duration: "Jan 2020 - Present",
        verified: true,
      },
      {
        company: "Digital Solutions Ltd.",
        role: "Developer",
        duration: "Mar 2017 - Dec 2019",
        verified: true,
      },
      {
        company: "StartUp Co.",
        role: "Junior Developer",
        duration: "Jun 2015 - Feb 2017",
        verified: false,
      },
    ],
    verifications: [
      { type: "Identity", status: "Verified", canView: false },
      { type: "Education", status: "Verified", canView: false },
      { type: "Background Check", status: "Pending", canView: false },
    ],
  };

  const handleSearch = () => {
    // In a real app, this would make an API call
    if (searchQuery.toUpperCase().startsWith("SP-")) {
      setEmployee(mockEmployee);
      setSearchPerformed(true);
    } else {
      setEmployee(null);
      setSearchPerformed(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const sendAccessRequest = () => {
    setAccessRequested(true);
    // In a real app, this would send a request to the employee
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Search Employee by StaffProof ID
        </h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center ml-4"
          aria-label="Add employee"
          // onClick={modelFunction}
        >
          <Link to="/employer/onboarding">
            <span className="mr-2">+</span>
            Add Employee
          </Link>
        </button>
      </div>

      <div className="flex mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter StaffProof ID (e.g., SP-123456)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {searchPerformed && !employee && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
          <AlertCircle className="text-red-500 mr-2" />
          <p className="text-red-700">
            No employee found with the provided StaffProof ID. Please check the
            ID and try again.
          </p>
        </div>
      )}

      {searchPerformed && employee ? (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {employee.name}
              </h2>
              <p className="text-gray-600">ID: {employee.id}</p>
            </div>
            <div className="flex items-center space-x-3">
              {employee.isVerified ? (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <AlertCircle size={16} className="mr-1" />
                  <span className="font-medium">Not Verified</span>
                </div>
              )}

              {employee.hasBadge && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  StaffProof Badge
                </div>
              )}
            </div>
          </div>

          {/* Job Records */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
              <Briefcase size={18} className="mr-2" />
              Employment History
            </h3>
            <div className="space-y-3">
              {employee.jobRecords.map((job, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <Building size={16} className="mr-2 text-gray-600" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Briefcase size={14} className="mr-2" />
                      <span>{job.role}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2" />
                      <span>{job.duration}</span>
                    </div>
                  </div>
                  {job.verified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle size={18} className="mr-1" />
                      <span className="font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertCircle size={18} className="mr-1" />
                      <span className="font-medium">Pending</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Verifications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
              <FileText size={18} className="mr-2" />
              Verification Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {employee.verifications.map((verification, index) => {
                const VerificationIcon =
                  verification.type === "Identity"
                    ? User
                    : verification.type === "Education"
                    ? GraduationCap
                    : FileText;

                return (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <VerificationIcon
                          size={16}
                          className="mr-2 text-gray-600"
                        />
                        <span className="font-medium">{verification.type}</span>
                      </div>
                      <div
                        className={`flex items-center ${
                          verification.status === "Verified"
                            ? "text-green-600"
                            : verification.status === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {verification.status === "Verified" ? (
                          <CheckCircle size={16} className="mr-1" />
                        ) : verification.status === "Pending" ? (
                          <AlertCircle size={16} className="mr-1" />
                        ) : (
                          <XCircle size={16} className="mr-1" />
                        )}
                        <span>{verification.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Access */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
              <Lock size={18} className="mr-2" />
              Document Access
            </h3>

            {employee.hasGrantedAccess ? (
              <div>
                <p className="text-gray-700 mb-3">
                  This employee has granted you access to view their
                  verification documents.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white flex items-center px-4 py-2 rounded">
                  <Download size={16} className="mr-2" />
                  View Documents
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-3">
                  This employee has not granted permission to view their
                  verification documents.
                </p>
                {accessRequested ? (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800">
                    <p className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Access request sent successfully. The employee will be
                      notified.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={sendAccessRequest}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-4 py-2 rounded"
                  >
                    <Lock size={16} className="mr-2" />
                    Send Access Request
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmployeeTable />
      )}
    </div>
  );
}

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
import { useState, useContext } from "react";
import EmployeeTable from "./EmployeeTable";
import { Link } from "react-router";
import { searchEmployees, requestAccess } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

export default function EmployerSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [accessRequested, setAccessRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useContext(UserContext);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSearchPerformed(true);
      
      const response = await searchEmployees({ q: searchQuery });
      if (response.success && response.employees.length > 0) {
        setEmployee(response.employees[0]);
        setAccessRequested(false);
      } else {
        setEmployee(null);
        setError('No employee found with the provided StaffProof ID');
      }
    } catch (err) {
      console.error('Error searching employee:', err);
      setError(err.response?.data?.message || 'Employee not found');
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const sendAccessRequest = async () => {
    if (!employee) return;
    
    try {
      setLoading(true);
      await requestAccess({
        employeeId: employee.id,
        employerId: user?.id,
        requestType: 'profile_access'
      });
      setAccessRequested(true);
    } catch (err) {
      console.error('Error requesting access:', err);
      setError(err.response?.data?.message || 'Failed to send access request');
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
          <AlertCircle className="text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {searchPerformed && !employee && !error && (
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
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-gray-600">ID: {employee.staffProofId}</p>
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
              {employee.jobHistory?.map((job, index) => (
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
                      <span>{job.designation}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2" />
                      <span>
                        {new Date(job.startDate).toLocaleDateString()} - {job.currentlyWorking ? 'Present' : new Date(job.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {job.status === 'verified' ? (
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
              {employee.verifications?.map((verification, index) => {
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

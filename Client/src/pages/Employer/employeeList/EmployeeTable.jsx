import {
  Calendar,
  FileText,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import React, { useState } from "react";

export default function EmployeeTable() {
  const [employeeRecords] = useState([
    {
      id: 1,
      employeeName: "John Anderson",
      staffProofId: "SP-234567",
      dob: "1992-05-15",
      documents: "Verified",
      badge: "Premium",
      endingDate: "2025-12-31",
      status: "Verified",
      email: "john.anderson@email.com",
      phone: "+91 9876543210",
      address: "123 MG Road, Bangalore, Karnataka 560001",
      education: "B.Tech Computer Science, IIT Delhi",
      experience: "5 years",
      jobRecords: [
        {
          company: "Tech Corp",
          role: "Software Engineer",
          duration: "2020-2023",
        },
        {
          company: "StartupXYZ",
          role: "Senior Developer",
          duration: "2023-Present",
        },
      ],
      verifiedDocuments: [
        "Aadhaar Card",
        "PAN Card",
        "Educational Certificates",
        "Experience Letters",
      ],
    },
    {
      id: 2,
      employeeName: "Sarah Johnson",
      staffProofId: "SP-876543",
      dob: "1988-08-22",
      documents: "Pending",
      badge: "Basic",
      endingDate: "2025-10-15",
      status: "Not Verified",
      email: "sarah.johnson@email.com",
      phone: "+91 8765432109",
      address: "456 Park Street, Mumbai, Maharashtra 400001",
      education: "MBA Finance, IIM Ahmedabad",
      experience: "8 years",
      jobRecords: [
        {
          company: "Finance Ltd",
          role: "Financial Analyst",
          duration: "2018-2022",
        },
        {
          company: "Investment Bank",
          role: "Senior Analyst",
          duration: "2022-Present",
        },
      ],
      verifiedDocuments: ["Aadhaar Card", "PAN Card"],
    },
    {
      id: 3,
      employeeName: "Michael Chen",
      staffProofId: "SP-567890",
      dob: "1995-03-10",
      documents: "Verified",
      badge: "Premium",
      endingDate: "2026-01-20",
      status: "Verified",
      email: "michael.chen@email.com",
      phone: "+91 7654321098",
      address: "789 Tech Park, Hyderabad, Telangana 500032",
      education: "M.Tech AI/ML, IIIT Hyderabad",
      experience: "3 years",
      jobRecords: [
        {
          company: "AI Solutions",
          role: "ML Engineer",
          duration: "2022-Present",
        },
      ],
      verifiedDocuments: [
        "Aadhaar Card",
        "PAN Card",
        "Educational Certificates",
        "Experience Letters",
        "Medical Certificate",
      ],
    },
    {
      id: 4,
      employeeName: "Priya Sharma",
      staffProofId: "SP-345678",
      dob: "1990-11-05",
      documents: "Verified",
      badge: "Basic",
      endingDate: "2025-09-30",
      status: "Verified",
      email: "priya.sharma@email.com",
      phone: "+91 6543210987",
      address: "321 Civil Lines, Delhi 110001",
      education: "B.Com, Delhi University",
      experience: "6 years",
      jobRecords: [
        { company: "Retail Corp", role: "Accountant", duration: "2019-2023" },
        {
          company: "E-commerce Ltd",
          role: "Finance Manager",
          duration: "2023-Present",
        },
      ],
      verifiedDocuments: [
        "Aadhaar Card",
        "PAN Card",
        "Educational Certificates",
      ],
    },
    {
      id: 5,
      employeeName: "Rajesh Kumar",
      staffProofId: "SP-789012",
      dob: "1987-07-18",
      documents: "Rejected",
      badge: "None",
      endingDate: "2025-08-15",
      status: "Not Verified",
      email: "rajesh.kumar@email.com",
      phone: "+91 5432109876",
      address: "654 Industrial Area, Pune, Maharashtra 411001",
      education: "Diploma Mechanical, Pune Polytechnic",
      experience: "10 years",
      jobRecords: [
        {
          company: "Manufacturing Co",
          role: "Technician",
          duration: "2015-2020",
        },
        {
          company: "Auto Parts Ltd",
          role: "Senior Technician",
          duration: "2020-Present",
        },
      ],
      verifiedDocuments: ["Aadhaar Card"],
    },
  ]);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const totalPages = Math.ceil(employeeRecords.length / itemsPerPage);
  const paginatedRecords = employeeRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const getStatusBadge = (status) => {
    if (status === "Verified") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={12} className="mr-1" />
          Not Verified
        </span>
      );
    }
  };

  const getBadgeIcon = (badge) => {
    if (badge === "Premium") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield size={12} className="mr-1" />
          Premium
        </span>
      );
    } else if (badge === "Basic") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Basic
        </span>
      );
    } else {
      return <span className="text-gray-500 text-xs">None</span>;
    }
  };

  const getDocumentStatus = (documents) => {
    if (documents === "Verified") {
      return (
        <span className="text-green-600 text-sm font-medium">✓ Verified</span>
      );
    } else if (documents === "Pending") {
      return (
        <span className="text-yellow-600 text-sm font-medium">⏳ Pending</span>
      );
    } else {
      return (
        <span className="text-red-600 text-sm font-medium">✗ Rejected</span>
      );
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Employee Records Table:
      </h2>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Employee Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                StaffProof ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                DOB
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Documents
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Badge
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Ending Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b font-medium">
                  {record.employeeName}
                </td>
                <td className="px-4 py-3 border-b font-mono text-sm text-blue-600">
                  {record.staffProofId}
                </td>
                <td className="px-4 py-3 border-b text-sm">{record.dob}</td>
                <td className="px-4 py-3 border-b">
                  {getDocumentStatus(record.documents)}
                </td>
                <td className="px-4 py-3 border-b">
                  {getBadgeIcon(record.badge)}
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">{record.endingDate}</span>
                  </div>
                </td>
                <td className="px-4 py-3 border-b">
                  <button
                    onClick={() => handleViewEmployee(record)}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, employeeRecords.length)} of{" "}
          {employeeRecords.length}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for Employee Details */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Employee Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name:
                      </label>
                      <p className="text-gray-900">
                        {selectedEmployee.employeeName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        StaffProof ID:
                      </label>
                      <p className="text-blue-600 font-mono">
                        {selectedEmployee.staffProofId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Date of Birth:
                      </label>
                      <p className="text-gray-900">{selectedEmployee.dob}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email:
                      </label>
                      <p className="text-gray-900">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone:
                      </label>
                      <p className="text-gray-900">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Address:
                      </label>
                      <p className="text-gray-900">
                        {selectedEmployee.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Professional Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Education:
                      </label>
                      <p className="text-gray-900">
                        {selectedEmployee.education}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Experience:
                      </label>
                      <p className="text-gray-900">
                        {selectedEmployee.experience}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Verification Status:
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(selectedEmployee.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Badge:
                      </label>
                      <div className="mt-1">
                        {getBadgeIcon(selectedEmployee.badge)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Access Ending Date:
                      </label>
                      <p className="text-gray-900">
                        {selectedEmployee.endingDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Records */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  Job Records
                </h4>
                <div className="space-y-2">
                  {selectedEmployee.jobRecords.map((job, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {job.role}
                          </p>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {job.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Documents */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  Verified Documents
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedEmployee.verifiedDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-gray-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Send Access Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

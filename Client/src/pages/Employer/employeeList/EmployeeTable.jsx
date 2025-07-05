import {
  Calendar,
  FileText,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Shield,
  Edit,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { fetchEmployees, updateEmployee, deleteEmployee, searchEmployees } from "../../../components/api/api";
import { toast } from 'react-hot-toast';

export default function EmployeeTable() {
  const [employeeRecords, setEmployeeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    badge: ''
  });

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [records, setRecords] = useState([]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployeeData();
  }, [currentPage, searchTerm, filters]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...filters
      };
      
      const response = await fetchEmployees(params);
      if (response.success) {
        setEmployeeRecords(response.employees);
        setRecords(response.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(employeeRecords.length / itemsPerPage);
  const paginatedRecords = records;

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleEditEmployee = (employee) => {
    setEditEmployee(employee);
    setEditForm({
      firstName: employee.firstName || "",
      middleName: employee.middleName || "",
      lastName: employee.lastName || "",
      fatherName: employee.fatherName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : "",
      gender: employee.gender || "",
      address: employee.address ? JSON.stringify(employee.address) : "",
      resume: null,
      aadharCard: null,
      panCard: null,
      education: {
        degree: employee.education?.degree || "",
        institution: employee.education?.institution || "",
        fieldOfStudy: employee.education?.fieldOfStudy || "",
        grade: employee.education?.grade || "",
        startDate: employee.education?.startDate ? new Date(employee.education.startDate).toISOString().split('T')[0] : "",
        endDate: employee.education?.endDate ? new Date(employee.education.endDate).toISOString().split('T')[0] : "",
        certificate: null,
      },
      department: employee.department || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : "",
      endDate: employee.endDate ? new Date(employee.endDate).toISOString().split('T')[0] : "",
      employmentType: employee.employmentType || "full-time",
      salary: employee.salary || "",
      offerLetter: null,
    });
    setEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleEditEducationChange = (field, value) => {
    setEditForm({
      ...editForm,
      education: {
        ...editForm.education,
        [field]: value,
      },
    });
  };

  const handleEditEducationFileChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setEditForm({
        ...editForm,
        education: {
          ...editForm.education,
          certificate: files[0].name,
        },
      });
    }
  };

  const handleEditFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setEditForm({
        ...editForm,
        [name]: files[0].name,
      });
    }
  };

  const validateEditForm = () => {
    let stepErrors = {};
    let isValid = true;
    // Basic Details
    if (!editForm.firstName.trim()) {
      stepErrors.firstName = "First name is required";
      isValid = false;
    }
    if (!editForm.lastName.trim()) {
      stepErrors.lastName = "Last name is required";
      isValid = false;
    }
    if (!editForm.fatherName.trim()) {
      stepErrors.fatherName = "Father's name is required";
      isValid = false;
    }
    if (!editForm.email.trim()) {
      stepErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      stepErrors.email = "Email is invalid";
      isValid = false;
    }
    if (!editForm.phone.trim()) {
      stepErrors.phone = "Phone number is required";
      isValid = false;
    }
    // Education
    const edu = editForm.education;
    const eduError = {};
    if (!edu.degree.trim()) {
      eduError.degree = "Degree is required";
      isValid = false;
    }
    if (!edu.institution.trim()) {
      eduError.institution = "Institution is required";
      isValid = false;
    }
    if (!edu.fieldOfStudy.trim()) {
      eduError.fieldOfStudy = "Field of study is required";
      isValid = false;
    }
    if (Object.keys(eduError).length > 0) {
      stepErrors.education = eduError;
    }
    // Position
    if (!editForm.department.trim()) {
      stepErrors.department = "Department is required";
      isValid = false;
    }
    if (!editForm.designation.trim()) {
      stepErrors.designation = "Position is required";
      isValid = false;
    }
    if (!editForm.joiningDate.trim()) {
      stepErrors.joiningDate = "Joining date is required";
      isValid = false;
    }
    setEditErrors(stepErrors);
    return isValid;
  };

  const handleEditSave = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare form data for API
      const formData = new FormData();
      
      // Add basic fields
      formData.append('firstName', editForm.firstName);
      formData.append('middleName', editForm.middleName);
      formData.append('lastName', editForm.lastName);
      formData.append('fatherName', editForm.fatherName);
      formData.append('email', editForm.email);
      formData.append('phone', editForm.phone);
      formData.append('dateOfBirth', editForm.dateOfBirth);
      formData.append('gender', editForm.gender);
      formData.append('address', editForm.address);
      formData.append('department', editForm.department);
      formData.append('designation', editForm.designation);
      formData.append('joiningDate', editForm.joiningDate);
      formData.append('endDate', editForm.endDate);
      formData.append('employmentType', editForm.employmentType);
      formData.append('salary', editForm.salary);
      
      // Add education fields
      formData.append('education[degree]', editForm.education.degree);
      formData.append('education[institution]', editForm.education.institution);
      formData.append('education[fieldOfStudy]', editForm.education.fieldOfStudy);
      formData.append('education[grade]', editForm.education.grade);
      formData.append('education[startDate]', editForm.education.startDate);
      formData.append('education[endDate]', editForm.education.endDate);
      
      // Add files if they exist
      if (editForm.resume) {
        formData.append('resume', editForm.resume);
      }
      if (editForm.aadharCard) {
        formData.append('aadharCard', editForm.aadharCard);
      }
      if (editForm.panCard) {
        formData.append('panCard', editForm.panCard);
      }
      if (editForm.offerLetter) {
        formData.append('offerLetter', editForm.offerLetter);
      }
      if (editForm.education.certificate) {
        formData.append('educationCertificate', editForm.education.certificate);
      }

      const response = await updateEmployee(editEmployee._id, formData);
      
      if (response.success) {
        toast.success('Employee updated successfully');
        fetchEmployeeData(); // Refresh the data
        setEditModalOpen(false);
        setEditEmployee(null);
        setEditForm(null);
        setEditErrors({});
      } else {
        toast.error(response.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    try {
      setLoading(true);
      
      const response = await deleteEmployee(employeeToDelete._id);
      
      if (response.success) {
        toast.success('Employee deleted successfully');
        fetchEmployeeData(); // Refresh the data
        setDeleteConfirmOpen(false);
        setEmployeeToDelete(null);
      } else {
        toast.error(response.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Employee Records Table
        </h2>
        
        {/* Search and Filter Controls */}
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          
          <select
            value={filters.badge}
            onChange={(e) => setFilters({...filters, badge: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Badges</option>
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
            <option value="None">None</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading employees...</span>
          </div>
        ) : (
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
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                  Badge
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                  Joining Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium">
                      {`${record.firstName} ${record.middleName || ''} ${record.lastName}`.trim()}
                    </td>
                    <td className="px-4 py-3 border-b font-mono text-sm text-blue-600">
                      {record.staffProofId}
                    </td>
                    <td className="px-4 py-3 border-b text-sm">{record.department}</td>
                    <td className="px-4 py-3 border-b">
                      {getStatusBadge(record.isVerified ? 'Verified' : 'Not Verified')}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {getBadgeIcon(record.badge)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-1" />
                        <span className="text-sm">
                          {record.joiningDate ? new Date(record.joiningDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b flex gap-2">
                      <button
                        onClick={() => handleViewEmployee(record)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditEmployee(record)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-yellow-100 text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Edit Employee"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(record)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
          <div>
            Showing {paginatedRecords.length} of {employeeRecords.length} employees
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
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
      )}

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
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
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
                      <p className="text-gray-900">{selectedEmployee.dateOfBirth}</p>
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
                        {getStatusBadge(selectedEmployee.isVerified ? 'Verified' : 'Not Verified')}
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
                        {selectedEmployee.endDate}
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
      {/* Edit Employee Modal (full form) */}
      {editModalOpen && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Edit Employee</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-6" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">First Name*</label>
                  <input type="text" name="firstName" value={editForm.firstName} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.firstName ? "border-red-500" : "border-gray-300"}`} />
                  {editErrors.firstName && <p className="text-red-500 text-xs mt-1">{editErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Middle Name</label>
                  <input type="text" name="middleName" value={editForm.middleName} onChange={handleEditInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Last Name*</label>
                  <input type="text" name="lastName" value={editForm.lastName} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.lastName ? "border-red-500" : "border-gray-300"}`} />
                  {editErrors.lastName && <p className="text-red-500 text-xs mt-1">{editErrors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Father's Name*</label>
                  <input type="text" name="fatherName" value={editForm.fatherName} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.fatherName ? "border-red-500" : "border-gray-300"}`} />
                  {editErrors.fatherName && <p className="text-red-500 text-xs mt-1">{editErrors.fatherName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditInputChange} className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email*</label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.email ? "border-red-500" : "border-gray-300"}`} />
                  {editErrors.email && <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Phone*</label>
                  <input type="tel" name="phone" value={editForm.phone} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.phone ? "border-red-500" : "border-gray-300"}`} />
                  {editErrors.phone && <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={editForm.dateOfBirth} onChange={handleEditInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Address</label>
                <textarea name="address" value={editForm.address} onChange={handleEditInputChange} className="w-full p-3 border border-gray-300 rounded-lg" rows="3"></textarea>
              </div>
              {/* Document Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Resume/CV</label>
                  <input type="file" name="resume" onChange={handleEditFileChange} className="w-full p-3 border border-gray-300 rounded-lg" accept=".pdf,.doc,.docx" />
                  <p className="text-xs text-gray-500 mt-1">Upload resume (PDF, DOC, DOCX - Max: 5MB)</p>
                  {editForm.resume && <div className="text-xs text-gray-600 mt-1">Current: {editForm.resume}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Aadhar Card</label>
                  <input type="file" name="aadharCard" onChange={handleEditFileChange} className="w-full p-3 border border-gray-300 rounded-lg" accept=".pdf,.jpg,.jpeg,.png" />
                  <p className="text-xs text-gray-500 mt-1">Upload Aadhar card (PDF, JPG, PNG - Max: 5MB)</p>
                  {editForm.aadharCard && <div className="text-xs text-gray-600 mt-1">Current: {editForm.aadharCard}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">PAN Card</label>
                  <input type="file" name="panCard" onChange={handleEditFileChange} className="w-full p-3 border border-gray-300 rounded-lg" accept=".pdf,.jpg,.jpeg,.png" />
                  <p className="text-xs text-gray-500 mt-1">Upload PAN card (PDF, JPG, PNG - Max: 5MB)</p>
                  {editForm.panCard && <div className="text-xs text-gray-600 mt-1">Current: {editForm.panCard}</div>}
                </div>
              </div>
              {/* Education Details */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Degree/Course*</label>
                    <input type="text" value={editForm.education.degree} onChange={e => handleEditEducationChange("degree", e.target.value)} className={`w-full p-3 border rounded-lg ${editErrors.education && editErrors.education.degree ? "border-red-500" : "border-gray-300"}`} placeholder="e.g., Bachelor of Engineering" />
                    {editErrors.education && editErrors.education.degree && <p className="text-red-500 text-xs mt-1">{editErrors.education.degree}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Institution*</label>
                    <input type="text" value={editForm.education.institution} onChange={e => handleEditEducationChange("institution", e.target.value)} className={`w-full p-3 border rounded-lg ${editErrors.education && editErrors.education.institution ? "border-red-500" : "border-gray-300"}`} placeholder="e.g., University of Technology" />
                    {editErrors.education && editErrors.education.institution && <p className="text-red-500 text-xs mt-1">{editErrors.education.institution}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Field of Study*</label>
                    <input type="text" value={editForm.education.fieldOfStudy} onChange={e => handleEditEducationChange("fieldOfStudy", e.target.value)} className={`w-full p-3 border rounded-lg ${editErrors.education && editErrors.education.fieldOfStudy ? "border-red-500" : "border-gray-300"}`} placeholder="e.g., Computer Science" />
                    {editErrors.education && editErrors.education.fieldOfStudy && <p className="text-red-500 text-xs mt-1">{editErrors.education.fieldOfStudy}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Grade/Percentage</label>
                    <input type="text" value={editForm.education.grade} onChange={e => handleEditEducationChange("grade", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., 85% or A+" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
                    <input type="date" value={editForm.education.startDate} onChange={e => handleEditEducationChange("startDate", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
                    <input type="date" value={editForm.education.endDate} onChange={e => handleEditEducationChange("endDate", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Education Certificate</label>
                  <input type="file" onChange={handleEditEducationFileChange} className="w-full p-3 border border-gray-300 rounded-lg" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                  <p className="text-xs text-gray-500 mt-1">Upload degree certificate or transcript (PDF, DOC, DOCX, JPG, PNG - Max: 5MB)</p>
                  {editForm.education.certificate && <div className="text-xs text-gray-600 mt-1">Current: {editForm.education.certificate}</div>}
                </div>
              </div>
              {/* Position Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Department*</label>
                    <input type="text" name="department" value={editForm.department} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.department ? "border-red-500" : "border-gray-300"}`} placeholder="e.g., Software Development" />
                    {editErrors.department && <p className="text-red-500 text-xs mt-1">{editErrors.department}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Position*</label>
                    <input type="text" name="designation" value={editForm.designation} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.designation ? "border-red-500" : "border-gray-300"}`} placeholder="e.g., Senior Software Engineer" />
                    {editErrors.designation && <p className="text-red-500 text-xs mt-1">{editErrors.designation}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Joining Date*</label>
                    <input type="date" name="joiningDate" value={editForm.joiningDate} onChange={handleEditInputChange} className={`w-full p-3 border rounded-lg ${editErrors.joiningDate ? "border-red-500" : "border-gray-300"}`} />
                    {editErrors.joiningDate && <p className="text-red-500 text-xs mt-1">{editErrors.joiningDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
                    <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Employment Type</label>
                    <select name="employmentType" value={editForm.employmentType} onChange={handleEditInputChange} className="w-full p-3 border border-gray-300 rounded-lg">
                      <option value="">Select Type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Salary</label>
                    <input type="number" name="salary" value={editForm.salary} onChange={handleEditInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Enter salary amount" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Offer Letter</label>
                    <input type="file" name="offerLetter" onChange={handleEditFileChange} className="w-full p-3 border border-gray-300 rounded-lg" accept=".pdf,.doc,.docx" />
                    <p className="text-xs text-gray-500 mt-1">Upload signed offer letter (PDF, DOC, DOCX - Max: 5MB)</p>
                    {editForm.offerLetter && <div className="text-xs text-gray-600 mt-1">Current: {editForm.offerLetter}</div>}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t bg-gray-50">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && employeeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
              <p>Are you sure you want to delete <span className="font-bold">{employeeToDelete.firstName} {employeeToDelete.lastName}</span>?</p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEmployee}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
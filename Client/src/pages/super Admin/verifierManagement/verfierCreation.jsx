import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Download, RefreshCw } from 'lucide-react';
import api from '../../../components/api/axiosConfig';

const VerifierManagement = () => {
  const [verifiers, setVerifiers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVerifier, setEditingVerifier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profileImage: null,
    email: '',
    password: '',
    phone: '',
    role: 'Verifier'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalVerifiers, setTotalVerifiers] = useState(0);

  // API base URL
  const API_BASE_URL = '/api';

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Fetch verifiers from API
  const fetchVerifiers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_BASE_URL}/users`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          filters: JSON.stringify({ role: 'Verifier' }),
          q: searchTerm
        }
      });

      if (response.data.success) {
        setVerifiers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalVerifiers(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching verifiers:', error);
      // Handle error - you might want to show a toast notification
    } finally {
      setLoading(false);
    }
  };

  // Create verifier
  const createVerifier = async (formDataToSend) => {
    try {
      const formDataObj = new FormData();
      
      // Add form data
      formDataObj.append('userType', 'verifier');
      formDataObj.append('formData', JSON.stringify({
        verifier: {
          basic: {
            firstName: formDataToSend.firstName,
            lastName: formDataToSend.lastName,
            email: formDataToSend.email,
            phone: formDataToSend.phone
          }
        }
      }));

      // Add profile picture if exists
      if (formDataToSend.profileImage) {
        formDataObj.append('profileImage', formDataToSend.profileImage);
      }

      const response = await api.post(`${API_BASE_URL}/users/register`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        fetchVerifiers();
        return { success: true, message: 'Verifier created successfully' };
      }
    } catch (error) {
      console.error('Error creating verifier:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error creating verifier' 
      };
    }
  };

  // Update verifier
  const updateVerifier = async (id, formDataToSend) => {
    try {
      const formDataObj = new FormData();
      
      // Add form data
      Object.keys(formDataToSend).forEach(key => {
        if (key !== 'profileImage') {
          formDataObj.append(key, formDataToSend[key]);
        }
      });

      // Add profile picture if exists
      if (formDataToSend.profileImage) {
        formDataObj.append('profileImage', formDataToSend.profileImage);
      }

      const response = await api.put(`${API_BASE_URL}/users/${id}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        fetchVerifiers();
        return { success: true, message: 'Verifier updated successfully' };
      }
    } catch (error) {
      console.error('Error updating verifier:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error updating verifier' 
      };
    }
  };

  // Delete verifier
  const deleteVerifier = async (id) => {
    try {
      const response = await api.delete(`${API_BASE_URL}/users/${id}`);

      if (response.data.success) {
        fetchVerifiers();
        return { success: true, message: 'Verifier deleted successfully' };
      }
    } catch (error) {
      console.error('Error deleting verifier:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error deleting verifier' 
      };
    }
  };

  // Initialize form with random password
  useEffect(() => {
    if (showForm && !editingVerifier) {
      setFormData(prev => ({
        ...prev,
        password: generateRandomPassword()
      }));
    }
  }, [showForm, editingVerifier]);

  // Fetch verifiers on component mount and when dependencies change
  useEffect(() => {
    fetchVerifiers();
  }, [currentPage, searchTerm, filterRole]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add or update verifier
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      if (editingVerifier) {
        result = await updateVerifier(editingVerifier._id, formData);
      } else {
        result = await createVerifier(formData);
      }
      
      if (result.success) {
        resetForm();
        // You might want to show a success toast here
        alert(result.message);
      } else {
        // You might want to show an error toast here
        alert(result.message);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      profileImage: null,
      email: '',
      password: '',
      phone: '',
      role: 'Verifier'
    });
    setPreviewImage(null);
    setShowForm(false);
    setEditingVerifier(null);
  };

  // Edit verifier
  const handleEdit = (verifier) => {
    setEditingVerifier(verifier);
    setFormData({
      firstName: verifier.firstName || '',
      lastName: verifier.lastName || '',
      profileImage: null,
      email: verifier.email,
      password: '',
      phone: verifier.phone || '',
      role: 'Verifier'
    });
    if (verifier.profileImage) {
      setPreviewImage(verifier.profileImage);
    }
    setShowForm(true);
  };

  // Delete verifier
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this verifier?')) {
      setLoading(true);
      const result = await deleteVerifier(id);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
      setLoading(false);
    }
  };

  // Pagination logic
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVerifiers();
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearchTerm('');
    setFilterRole('');
    setCurrentPage(1);
    fetchVerifiers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verifier Management</h1>
            <p className="text-gray-600 mt-2">Manage verifier accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Add Verifier
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search verifiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="Verifier">Verifier</option>
              </select>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {editingVerifier ? 'Edit Verifier' : 'Add New Verifier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {previewImage && (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="mt-2 h-16 w-16 object-cover rounded-full border-2 border-gray-300"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingVerifier}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {!editingVerifier && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, password: generateRandomPassword() }))}
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Generate New Password
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md transition-colors"
                >
                  {loading ? 'Processing...' : (editingVerifier ? 'Update' : 'Add')} Verifier
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading verifiers...
                    </td>
                  </tr>
                ) : verifiers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No verifiers found. Click "Add Verifier" to create one.
                    </td>
                  </tr>
                ) : (
                  verifiers.map((verifier) => (
                    <tr key={verifier._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={verifier.profileImage || 'https://via.placeholder.com/40x40?text=V'} 
                              alt={`${verifier.firstName} ${verifier.lastName}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {`${verifier.firstName} ${verifier.lastName}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{verifier.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{verifier.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          verifier.status === 'active' ? 'bg-green-100 text-green-800' :
                          verifier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          verifier.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {verifier.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(verifier.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(verifier)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(verifier._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalVerifiers > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalVerifiers)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{totalVerifiers}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifierManagement;
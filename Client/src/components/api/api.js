// src/api/api.js
import api from './axiosConfig';
import { v4 as uuidv4 } from "uuid";
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Profile Functions
export const fetchProfile = async () => {
  const res = await api.get('/api/users/profile', { withCredentials: true });
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/api/users/profile', data, { withCredentials: true });
  return res.data;
};

// Job History Functions - Updated to use real API
export const fetchJobHistory = async () => {
  const res = await api.get('/api/users/job-history', { withCredentials: true });
  return res.data;
};

export const addJobRecord = async (jobData) => {
  const res = await api.post('/api/users/job-history', jobData, { withCredentials: true });
  return res.data;
};

export const deleteJobRecord = async (id) => {
  const res = await api.delete(`/api/users/job-history/${id}`, { withCredentials: true });
  return res.data;
};

// Document Center Functions - Updated to use real API
export const fetchDocuments = async () => {
  const res = await api.get('/api/users/documents', { withCredentials: true });
  return res.data;
};

export const uploadDocument = async (formData) => {
  const res = await api.post('/api/users/documents/upload', formData, { 
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const deleteDocument = async (docId) => {
  const res = await api.delete(`/api/users/documents/${docId}`, { withCredentials: true });
  return res.data;
};

export const fetchDocumentContent = async (docId) => {
  const res = await api.get(`/api/users/documents/${docId}/content`, { withCredentials: true });
  return res.data;
};

// fatcing dashboard functions
export const fetchDashboard = async (role = 'employee') => {
  const res = await api.get(`/api/dashboard/${role}`, { withCredentials: true });
  return res.data;
};

// Access Control Functions - Updated to use real API
export const fetchAccessRequests = async (params = {}) => {
  const res = await api.get('/api/access-requests', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const updateAccessRequest = async (requestId, action) => {
  if (action === 'approve') {
    const res = await api.post(`/api/access-requests/${requestId}/approve`, {}, { withCredentials: true });
    return res.data;
  } else if (action === 'deny') {
    const res = await api.post(`/api/access-requests/${requestId}/deny`, {}, { withCredentials: true });
    return res.data;
  } else if (action === 'delete') {
    const res = await api.delete(`/api/access-requests/${requestId}`, { withCredentials: true });
    return res.data;
  }
};

// Add-Ons Functions - Updated to use real API
export const fetchAddOns = async () => {
  const res = await api.get('/api/addons', { withCredentials: true });
  return res.data;
};

export const purchaseAddOn = async (addOnId) => {
  const res = await api.post('/api/addons/purchase', { addOnId }, { withCredentials: true });
  return res.data;
};

// Billing Functions - Updated to use real API
export const fetchBillingHistory = async (params = {}) => {
  const res = await api.get('/api/billing/history', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchPaymentMethods = async () => {
  const res = await api.get('/api/users/payment-methods', { withCredentials: true });
  return res.data;
};

export const downloadInvoice = async (invoiceId) => {
  const res = await api.get(`/api/billing/${invoiceId}/download`, { 
    withCredentials: true,
    responseType: 'blob'
  });
  return res.data;
};

// Notification Functions - Updated to use real API
export const fetchNotifications = async (params = {}) => {
  const res = await api.get('/api/notifications', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.put(`/api/notifications/${id}/read`, {}, { withCredentials: true });
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await api.delete(`/api/notifications/${id}`, { withCredentials: true });
  return res.data;
};

// Settings Functions
export const updateSettings = async (settingsData) => {
  const res = await api.put('/api/users/settings', settingsData, { withCredentials: true });
  return res.data;
};

export const changePassword = async (passwordData) => {
  const res = await api.put('/api/users/change-password', passwordData, { withCredentials: true });
  return res.data;
};

export const updateEmail = async (emailData) => {
  const res = await api.put('/api/users/change-email', emailData, { withCredentials: true });
  return res.data;
};

export const fetchConnectedDevices = async () => {
  const res = await api.get('/api/users/devices', { withCredentials: true });
  return res.data;
};

export const revokeDevice = async (deviceId) => {
  const res = await api.delete(`/api/users/devices/${deviceId}`, { withCredentials: true });
  return res.data;
};

export const enableTwoFactor = async () => {
  const res = await api.post('/api/users/2fa/enable', {}, { withCredentials: true });
  return res.data;
};

export const disableTwoFactor = async () => {
  const res = await api.post('/api/users/2fa/disable', {}, { withCredentials: true });
  return res.data;
};

// Additional billing functions for real API
export const generateInvoice = async (id) => {
  const res = await api.get(`/api/billing/${id}/generate-invoice`, { withCredentials: true });
  return res.data;
};

export const refundBilling = async (id) => {
  const res = await api.post(`/api/billing/${id}/refund`, {}, { withCredentials: true });
  return res.data;
};

export const adjustBilling = async (id, newAmount) => {
  const res = await api.put(`/api/billing/${id}/adjust`, { amount: newAmount }, { withCredentials: true });
  return res.data;
};

// AUTH FUNCTIONS
export const loginUser = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post('/api/auth/register', userData);
  return res.data;
};

// COMPANY FUNCTIONS
export const fetchCompanies = async (params = {}) => {
  const res = await api.get('/api/companies', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchCompany = async (id) => {
  const res = await api.get(`/api/companies/${id}`, { withCredentials: true });
  return res.data;
};

export const createCompany = async (companyData) => {
  const res = await api.post('/api/companies', companyData, { withCredentials: true });
  return res.data;
};

export const updateCompany = async (id, companyData) => {
  const res = await api.put(`/api/companies/${id}`, companyData, { withCredentials: true });
  return res.data;
};

export const deleteCompany = async (id) => {
  const res = await api.delete(`/api/companies/${id}`, { withCredentials: true });
  return res.data;
};

// VERIFICATION FUNCTIONS
export const fetchVerifications = async (params = {}) => {
  const res = await api.get('/api/verifications', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchVerificationCase = async (id) => {
  const res = await api.get(`/api/verifications/cases/${id}`, { withCredentials: true });
  return res.data;
};

export const createVerification = async (verificationData) => {
  const res = await api.post('/api/verifications', verificationData, { withCredentials: true });
  return res.data;
};

export const updateCaseStatus = async (id, statusData) => {
  const res = await api.put(`/api/verifications/cases/${id}/status`, statusData, { withCredentials: true });
  return res.data;
};

export const updateDocumentVerification = async (caseId, documentType, jobHistoryIndex, documentIndex, status, notes) => {
  const res = await api.put(`/api/verifications/cases/${caseId}/document/${documentType}/${jobHistoryIndex}/${documentIndex}`, {
    status,
    notes
  }, { withCredentials: true });
  return res.data;
};

export const updateJobHistoryVerification = async (caseId, jobHistoryIndex, status, notes) => {
  const res = await api.put(`/api/verifications/cases/${caseId}/job-history/${jobHistoryIndex}`, {
    status,
    notes
  }, { withCredentials: true });
  return res.data;
};

export const addCaseNote = async (noteData) => {
  const res = await api.post('/api/verifications/notes', noteData, { withCredentials: true });
  return res.data;
};

export const requestClarification = async (clarificationData) => {
  const res = await api.post('/api/verifications/clarification', clarificationData, { withCredentials: true });
  return res.data;
};

export const assignVerification = async (id, assignData) => {
  const res = await api.post(`/api/verifications/${id}/assign`, assignData, { withCredentials: true });
  return res.data;
};

export const completeVerification = async (id, completionData) => {
  const res = await api.post(`/api/verifications/${id}/complete`, completionData, { withCredentials: true });
  return res.data;
};

// ACCESS REQUEST FUNCTIONS
export const fetchAccessRequest = async (id) => {
  const res = await api.get(`/api/access-requests/${id}`, { withCredentials: true });
  return res.data;
};

export const createAccessRequest = async (requestData) => {
  const res = await api.post('/api/access-requests', requestData, { withCredentials: true });
  return res.data;
};

export const approveAccessRequest = async (id, approvalData) => {
  const res = await api.post(`/api/access-requests/${id}/approve`, approvalData, { withCredentials: true });
  return res.data;
};

export const denyAccessRequest = async (id, denialData) => {
  const res = await api.post(`/api/access-requests/${id}/deny`, denialData, { withCredentials: true });
  return res.data;
};

// BLACKLIST FUNCTIONS
export const fetchBlacklist = async (params = {}) => {
  const res = await api.get('/api/blacklist', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchBlacklistEntry = async (id) => {
  const res = await api.get(`/api/blacklist/${id}`, { withCredentials: true });
  return res.data;
};

export const addToBlacklist = async (blacklistData) => {
  const res = await api.post('/api/blacklist', blacklistData, { withCredentials: true });
  return res.data;
};

export const updateBlacklistEntry = async (id, blacklistData) => {
  const res = await api.put(`/api/blacklist/${id}`, blacklistData, { withCredentials: true });
  return res.data;
};

export const updateBlacklistStatus = async (id, statusData) => {
  const res = await api.put(`/api/blacklist/${id}/status`, statusData, { withCredentials: true });
  return res.data;
};

export const removeFromBlacklist = async (id) => {
  const res = await api.delete(`/api/blacklist/${id}`, { withCredentials: true });
  return res.data;
};

// BILLING FUNCTIONS
export const fetchBilling = async (params = {}) => {
  const res = await api.get('/api/billing', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchBillingRecord = async (id) => {
  const res = await api.get(`/api/billing/${id}`, { withCredentials: true });
  return res.data;
};

export const createBillingRecord = async (billingData) => {
  const res = await api.post('/api/billing', billingData, { withCredentials: true });
  return res.data;
};

export const updateBillingRecord = async (id, billingData) => {
  const res = await api.put(`/api/billing/${id}`, billingData, { withCredentials: true });
  return res.data;
};

export const processPayment = async (id, paymentData) => {
  const res = await api.post(`/api/billing/${id}/payment`, paymentData, { withCredentials: true });
  return res.data;
};

// AUDIT LOGS FUNCTIONS
export const fetchAuditLogs = async (params = {}) => {
  const res = await api.get('/api/audit-logs', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchAuditLog = async (id) => {
  const res = await api.get(`/api/audit-logs/${id}`, { withCredentials: true });
  return res.data;
};

export const fetchUserAuditLogs = async (userId, params = {}) => {
  const res = await api.get(`/api/users/${userId}/audit-logs`, { 
    params,
    withCredentials: true 
  });
  return res.data;
};

// EMPLOYEE MANAGEMENT FUNCTIONS
export const fetchEmployees = async (params = {}) => {
  const res = await api.get('/api/employees/employees', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchEmployee = async (id) => {
  const res = await api.get(`/api/employees/employees/${id}`, { withCredentials: true });
  return res.data;
};

export const createEmployee = async (employeeData) => {
  // Add userType to the FormData
  employeeData.append('userType', 'employer_employee');
  
  // Convert FormData to the expected flat structure
  const formData = {
    employee: {
      firstName: '',
      middleName: '',
      lastName: '',
      fatherName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      designation: '',
      department: '',
      joiningDate: '',
      endDate: '',
      employmentType: '',
      salary: 0,
      education: {
        degree: '',
        institution: '',
        fieldOfStudy: '',
        grade: '',
        startDate: '',
        endDate: ''
      }
    },
    certificates: [],
    password: ''
  };
  
  // Extract data from FormData and structure it properly
  for (let [key, value] of employeeData.entries()) {
    if (key.startsWith('education[')) {
      // Handle education fields
      const fieldName = key.replace('education[', '').replace(']', '');
      formData.employee.education[fieldName] = value;
    } else if (key === 'firstName') {
      formData.employee.firstName = value;
    } else if (key === 'lastName') {
      formData.employee.lastName = value;
    } else if (key === 'middleName') {
      formData.employee.middleName = value;
    } else if (key === 'fatherName') {
      formData.employee.fatherName = value;
    } else if (key === 'email') {
      formData.employee.email = value;
    } else if (key === 'phone') {
      formData.employee.phone = value;
    } else if (key === 'dateOfBirth') {
      formData.employee.dateOfBirth = value;
    } else if (key === 'gender') {
      formData.employee.gender = value;
    } else if (key === 'designation') {
      formData.employee.designation = value;
    } else if (key === 'department') {
      formData.employee.department = value;
    } else if (key === 'joiningDate') {
      formData.employee.joiningDate = value;
    } else if (key === 'endDate') {
      formData.employee.endDate = value;
    } else if (key === 'employmentType') {
      formData.employee.employmentType = value;
    } else if (key === 'salary') {
      formData.employee.salary = parseFloat(value) || 0;
    } else if (key === 'password') {
      // Store password separately for employer_employee type
      formData.password = value;
    } else if (key === 'address') {
      // Handle address field - store it in the userData structure
      formData.address = value;
    } else if (key.startsWith('certificates[')) {
      // Handle certificates fields
      const match = key.match(/certificates\[(\d+)\]\[(\w+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        
        // Ensure the array has enough elements
        while (formData.certificates.length <= index) {
          formData.certificates.push({
            name: '',
            institution: '',
            issueDate: '',
            expiryDate: '',
            file: null
          });
        }
        
        formData.certificates[index][field] = value;
      }
    }
  }
  
  // Add the formData as JSON string
  employeeData.set('formData', JSON.stringify(formData));
  
  const res = await api.post('/api/users/register', employeeData, { 
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const updateEmployee = async (id, employeeData) => {
  const res = await api.put(`/api/employees/employees/${id}`, employeeData, { 
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/api/employees/employees/${id}`, { withCredentials: true });
  return res.data;
};

export const searchEmployees = async (params = {}) => {
  const res = await api.get('/api/employees/employees/search', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const fetchEmployeeStats = async () => {
  const res = await api.get('/api/employees/employees/stats', { withCredentials: true });
  return res.data;
};

export const updateEmployeeStatus = async (id, status) => {
  const res = await api.put(`/api/employees/${id}/status`, { status }, { withCredentials: true });
  return res.data;
};

// EMPLOYER FUNCTIONS
export const searchEmployee = async (staffProofId) => {
  const res = await api.get(`/api/employees/search/${staffProofId}`, { withCredentials: true });
  return res.data;
};

export const requestAccess = async (accessData) => {
  const res = await api.post('/api/access-requests', accessData, { withCredentials: true });
  return res.data;
};

// EMPLOYER MANAGEMENT FUNCTIONS
export const fetchEmployers = async (params = {}) => {
  const res = await api.get('/api/employers', {
    params,
    withCredentials: true
  });
  return res.data;
};

export const updateEmployerKYC = async (id, kycData) => {
  const res = await api.put(`/api/employers/${id}/kyc`, kycData, { withCredentials: true });
  return res.data;
};

// CASE ASSIGNMENT FUNCTIONS
export const fetchCaseAssignments = async (params = {}) => {
  const res = await api.get('/api/verifications/cases', { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const assignCase = async (caseId, assignData) => {
  const res = await api.post(`/api/verifications/cases/${caseId}/assign`, assignData, { withCredentials: true });
  return res.data;
};

// EMPLOYEE/EMPLOYER DETAILS FUNCTIONS
export const fetchEmployeeDetails = async (id) => {
  const res = await api.get(`/api/employees/${id}`, { withCredentials: true });
  return res.data;
};

export const fetchEmployerDetails = async (id) => {
  const res = await api.get(`/api/employers/${id}`, { withCredentials: true });
  return res.data;
};

// Company Profile Functions
export const fetchCompanyProfile = async () => {
  const res = await api.get('/api/companies/profile', { withCredentials: true });
  return res.data;
};

export const updateCompanyProfile = async (profileData) => {
  const res = await api.put('/api/companies/profile', profileData, { withCredentials: true });
  return res.data;
};

export const uploadCompanyDocument = async (formData) => {
  const res = await api.post('/api/companies/documents/upload', formData, { 
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// VERIFIER FUNCTIONS
export const fetchVerifierEmployees = async (search = "") => {
  const res = await api.get('/api/verifier/communication/employees', {
    params: search ? { search } : {},
    withCredentials: true
  });
  return res.data;
};

export const fetchVerifierCompanies = async (search = "") => {
  const res = await api.get('/api/verifier/communication/companies', {
    params: search ? { search } : {},
    withCredentials: true
  });
  return res.data;
};

export const fetchVerifierClarifications = async (params = {}) => {
  const res = await api.get('/api/verifier/communication/clarifications', {
    params,
    withCredentials: true
  });
  return res.data;
};

export const sendVerifierClarification = async (clarificationData) => {
  const res = await api.post('/api/verifier/communication/clarification', clarificationData, { withCredentials: true });
  return res.data;
};

export const fetchVerifierCompanyCases = async (params = {}) => {
  const res = await api.get('/api/verifier/companies/cases', {
    params,
    withCredentials: true
  });
  return res.data;
};

export const fetchVerifierEmployeeCases = async (params = {}) => {
  const res = await api.get('/api/verifier/employees/cases', {
    params,
    withCredentials: true
  });
  return res.data;
};

export const updateVerifierCaseStatus = async (id, statusData) => {
  const res = await api.put(`/api/verifier/cases/${id}/status`, statusData, { withCredentials: true });
  return res.data;
};

export const fetchVerifierNotes = async (params = {}) => {
  const res = await api.get('/api/verifier/notes', {
    params,
    withCredentials: true
  });
  return res.data;
};

export const addVerifierNote = async (noteData) => {
  const res = await api.post('/api/verifier/notes', noteData, { withCredentials: true });
  return res.data;
};

export const fetchVerifierActivity = async (params = {}) => {
  const res = await api.get('/api/verifier/activity', {
    params,
    withCredentials: true
  });
  return res.data;
};

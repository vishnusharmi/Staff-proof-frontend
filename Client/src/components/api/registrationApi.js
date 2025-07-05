import axios from './axiosConfig';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const registrationApi = {
  // Submit registration form with files
  submitRegistration: async (userType, formData, files) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userType', userType);
      formDataToSend.append('formData', JSON.stringify(formData));

      // Append files based on user type
      if (userType === 'employee') {
        if (files.employee.resume) {
          files.employee.resume.forEach(file => {
            formDataToSend.append('resume', file);
          });
        }
        if (files.employee.certificates) {
          files.employee.certificates.forEach(file => {
            formDataToSend.append('certificates', file);
          });
        }
        if (files.employee.governmentID) {
          files.employee.governmentID.forEach(file => {
            formDataToSend.append('governmentID', file);
          });
        }
      } else if (userType === 'company') {
        if (files.company.registration) {
          files.company.registration.forEach(file => {
            formDataToSend.append('registration', file);
          });
        }
        if (files.company.gst) {
          files.company.gst.forEach(file => {
            formDataToSend.append('gst', file);
          });
        }
        if (files.company.signatoryID) {
          files.company.signatoryID.forEach(file => {
            formDataToSend.append('signatoryID', file);
          });
        }
        if (files.company.logo) {
          files.company.logo.forEach(file => {
            formDataToSend.append('logo', file);
          });
        }
      }

      const response = await axios.post(`${API_BASE_URL}/users/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get registration by ID (Admin/Verifier only)
  getRegistrationById: async (registrationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/registration/${registrationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all registrations with filters (Admin/Verifier only)
  getAllRegistrations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`${API_BASE_URL}/registration?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update registration status (Admin/Verifier only)
  updateRegistrationStatus: async (registrationId, status, reviewNotes) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/registration/${registrationId}/status`, {
        status,
        reviewNotes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete registration (Admin only)
  deleteRegistration: async (registrationId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/registration/${registrationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get registration statistics (Admin only)
  getRegistrationStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/registration/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Helper function to validate file uploads
export const validateFileUpload = (files, userType) => {
  const errors = [];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (userType === 'employee') {
    // Check required files for employee
    if (!files.employee.resume || files.employee.resume.length === 0) {
      errors.push('Resume is required');
    }
    if (!files.employee.governmentID || files.employee.governmentID.length === 0) {
      errors.push('Government ID is required');
    }

    // Validate all employee files
    Object.keys(files.employee).forEach(field => {
      if (files.employee[field]) {
        files.employee[field].forEach(file => {
          if (file.size > maxFileSize) {
            errors.push(`${file.name} is too large. Maximum size is 10MB`);
          }
          if (!allowedTypes.includes(file.type)) {
            errors.push(`${file.name} has an invalid file type. Only PDF and image files are allowed`);
          }
        });
      }
    });
  } else if (userType === 'company') {
    // Check required files for company
    if (!files.company.registration || files.company.registration.length === 0) {
      errors.push('Registration certificate is required');
    }
    if (!files.company.gst || files.company.gst.length === 0) {
      errors.push('GST certificate is required');
    }
    if (!files.company.signatoryID || files.company.signatoryID.length === 0) {
      errors.push('Signatory ID is required');
    }

    // Validate all company files
    Object.keys(files.company).forEach(field => {
      if (files.company[field]) {
        files.company[field].forEach(file => {
          if (file.size > maxFileSize) {
            errors.push(`${file.name} is too large. Maximum size is 10MB`);
          }
          if (!allowedTypes.includes(file.type)) {
            errors.push(`${file.name} has an invalid file type. Only PDF and image files are allowed`);
          }
        });
      }
    });
  }

  return errors;
};

// Helper function to format form data for API
export const formatFormDataForApi = (formData, userType) => {
  if (userType === 'employee') {
    return {
      employee: {
        basic: {
          fullName: formData.employee.basic.fullName,
          email: formData.employee.basic.email,
          phone: formData.employee.basic.phone,
          dob: formData.employee.basic.dob,
          gender: formData.employee.basic.gender,
          pan: formData.employee.basic.pan,
          aadhaar: formData.employee.basic.aadhaar
        },
        education: {
          qualification: formData.employee.education.qualification,
          experience: parseInt(formData.employee.education.experience)
        },
        jobs: formData.employee.jobs.map(job => ({
          companyName: job.companyName,
          designation: job.designation,
          startDate: job.startDate,
          endDate: job.endDate,
          location: job.location
        }))
      }
    };
  } else {
    return {
      company: {
        name: formData.company.name,
        website: formData.company.website,
        gst: formData.company.gst,
        hrName: formData.company.hrName,
        hrEmail: formData.company.hrEmail,
        hrPhone: formData.company.hrPhone
      }
    };
  }
};

export default registrationApi; 
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import RegistrationForm from './RegistrationForm';
import { registrationApi, validateFileUpload, formatFormDataForApi } from './api/registrationApi';
import { toast } from 'react-toastify';

export default function RegisterWithApi() {
  const [userType, setUserType] = useState('employee');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    employee: {
      basic: { firstName: '', lastName: '', email: '', phone: '', dob: '', gender: '', pan: '', aadhaar: '' },
      education: { qualification: '', experience: '' },
      jobs: []
    },
    company: { name: '', website: '', gst: '', hrName: '', hrEmail: '', hrPhone: '' }
  });
  const [files, setFiles] = useState({
    employee: { resume: [], certificates: [], governmentID: [] },
    company: { registration: [], gst: [], signatoryID: [], logo: [] }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => {
      const copy = { ...prev };
      if (section === 'employeeBasic') copy.employee.basic[field] = value;
      else if (section === 'employeeEdu') copy.employee.education[field] = value;
      else copy.company[field] = value;
      return copy;
    });
  };

  const handleJobChange = (index, field, value) => {
    setFormData(prev => {
      const jobs = [...prev.employee.jobs];
      jobs[index] = { ...jobs[index], [field]: value };
      return { ...prev, employee: { ...prev.employee, jobs } };
    });
  };

  const addJob = () => {
    setFormData(prev => ({
      ...prev,
      employee: { ...prev.employee, jobs: [...prev.employee.jobs, { companyName: '', location: '', designation: '', startDate: '', endDate: '' }] }
    }));
  };

  const handleFileChange = (group, field, e) => {
    const validFiles = Array.from(e.target.files).filter(f => f.size <= 10 * 1024 * 1024);
    setFiles(prev => ({ ...prev, [group]: { ...prev[group], [field]: validFiles } }));
  };

  // New function to handle form submission with API integration
  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate file uploads
      const fileErrors = validateFileUpload(files, userType);
      if (fileErrors.length > 0) {
        toast.error(fileErrors.join(', '));
        return;
      }

      // Format form data for API
      const formattedFormData = formatFormDataForApi(formData, userType);

      // Submit to API
      const response = await registrationApi.submitRegistration(userType, formattedFormData, files);

      // Show success message
      toast.success('Registration submitted successfully! We will review your information and contact you soon.');

      // Reset form
      setFormData({
        employee: {
          basic: { firstName: '', lastName: '', email: '', phone: '', dob: '', gender: '', pan: '', aadhaar: '' },
          education: { qualification: '', experience: '' },
          jobs: []
        },
        company: { name: '', website: '', gst: '', hrName: '', hrEmail: '', hrPhone: '' }
      });
      setFiles({
        employee: { resume: [], certificates: [], governmentID: [] },
        company: { registration: [], gst: [], signatoryID: [], logo: [] }
      });
      setStep(1);

      console.log('Registration submitted successfully:', response);

    } catch (error) {
      console.error('Registration submission failed:', error);
      toast.error(error.message || 'Registration submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <RegistrationForm
        userType={userType}
        setUserType={setUserType}
        step={step}
        setStep={setStep}
        formData={formData}
        files={files}
        handleInputChange={handleInputChange}
        handleJobChange={handleJobChange}
        addJob={addJob}
        handleFileChange={handleFileChange}
        isSubmitting={isSubmitting}
        handleFinalSubmit={handleFinalSubmit}
      />
      <Toaster />
    </>
  );
} 
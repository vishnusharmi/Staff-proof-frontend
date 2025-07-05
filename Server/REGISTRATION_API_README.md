# StaffProof Registration API

This document provides comprehensive information about the Registration API for the StaffProof platform.

## Overview

The Registration API handles both employee and company registrations with file uploads, validation, and status management. It provides endpoints for submitting registrations, managing them, and retrieving statistics.

## API Endpoints

### 1. Submit Registration
**POST** `/api/registration/submit`

Submit a new registration with form data and files.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `userType` (string, required): "employee" or "company"
  - `formData` (string, required): JSON string containing form data
  - Files: Various file fields based on user type

**Response:**
```json
{
  "success": true,
  "data": {
    "registrationId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "pending",
    "message": "Registration submitted successfully"
  },
  "message": "Registration submitted successfully. We will review your information and contact you soon."
}
```

### 2. Get Registration by ID
**GET** `/api/registration/:id`

Get a specific registration by ID (Admin/Verifier only).

**Headers:**
- Authorization: Bearer <token>

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userType": "employee",
    "employee": { ... },
    "files": { ... },
    "status": "pending",
    "createdAt": "2023-09-06T10:30:00.000Z"
  }
}
```

### 3. Get All Registrations
**GET** `/api/registration`

Get all registrations with filtering and pagination (Admin/Verifier only).

**Query Parameters:**
- `userType` (optional): "employee" or "company"
- `status` (optional): "pending", "under_review", "approved", "rejected"
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Field to sort by (default: "createdAt")
- `sortOrder` (optional): "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": {
    "registrations": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### 4. Update Registration Status
**PUT** `/api/registration/:id/status`

Update the status of a registration (Admin/Verifier only).

**Body:**
```json
{
  "status": "approved",
  "reviewNotes": "All documents verified successfully"
}
```

### 5. Delete Registration
**DELETE** `/api/registration/:id`

Delete a registration (Admin only).

### 6. Get Registration Statistics
**GET** `/api/registration/stats`

Get registration statistics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 100,
      "employees": 60,
      "companies": 40,
      "pending": 20,
      "underReview": 10,
      "approved": 50,
      "rejected": 20
    },
    "recentRegistrations": [...]
  }
}
```

## Data Models

### Employee Registration
```json
{
  "userType": "employee",
  "employee": {
    "basic": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "dob": "1990-01-01",
      "gender": "Male",
      "pan": "ABCDE1234F",
      "aadhaar": "123456789012"
    },
    "education": {
      "qualification": "Bachelor's Degree",
      "experience": 5
    },
    "jobs": [
      {
        "companyName": "Previous Company",
        "designation": "Software Engineer",
        "startDate": "2020-01-01",
        "endDate": "2023-01-01",
        "location": "Mumbai"
      }
    ]
  }
}
```

### Company Registration
```json
{
  "userType": "company",
  "company": {
    "name": "Tech Solutions Ltd",
    "website": "https://techsolutions.com",
    "gst": "22ABCDE1234F1Z5",
    "hrName": "Jane Smith",
    "hrEmail": "hr@techsolutions.com",
    "hrPhone": "9876543210"
  }
}
```

## File Upload Requirements

### Employee Files
- `resume` (required): PDF or image files, max 5 files, 10MB each
- `certificates` (optional): PDF or image files, max 10 files, 10MB each
- `governmentID` (required): PDF or image files, max 5 files, 10MB each

### Company Files
- `registration` (required): PDF or image files, max 5 files, 10MB each
- `gst` (required): PDF or image files, max 5 files, 10MB each
- `signatoryID` (required): PDF or image files, max 5 files, 10MB each
- `logo` (optional): Image files, max 3 files, 10MB each

## Frontend Integration

### 1. Install Dependencies
```bash
npm install axios react-toastify
```

### 2. Update Your Register Component
Replace your current `Register.jsx` with the new `RegisterWithApi.jsx`:

```jsx
import RegisterWithApi from './RegisterWithApi';

// Use in your app
<RegisterWithApi />
```

### 3. Environment Variables
Create a `.env` file in your frontend directory:
```
REACT_APP_API_URL=http://localhost:3000/api
```

### 4. API Service Usage
```jsx
import { registrationApi } from './api/registrationApi';

// Submit registration
const response = await registrationApi.submitRegistration(userType, formData, files);

// Get registrations (Admin/Verifier)
const registrations = await registrationApi.getAllRegistrations({
  userType: 'employee',
  status: 'pending',
  page: 1,
  limit: 10
});
```

## Backend Setup

### 1. Install Dependencies
```bash
cd Server
npm install multer
```

### 2. Create Upload Directory
```bash
mkdir -p uploads/registrations/employee
mkdir -p uploads/registrations/company
```

### 3. Environment Variables
Add to your `config.env`:
```
# File upload settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/registrations
```

### 4. Start the Server
```bash
npm start
```

## Validation Rules

### Employee Validation
- Full Name: Required, max 100 characters
- Email: Required, valid email format, unique
- Phone: Required, 10 digits
- PAN: Required, format: ABCDE1234F
- Aadhaar: Required, 12 digits
- Qualification: Required
- Experience: Required, 0-50 years

### Company Validation
- Company Name: Required, max 100 characters
- GST: Required, valid GST format
- HR Name: Required
- HR Email: Required, valid email format
- HR Phone: Required, 10 digits

### File Validation
- File size: Maximum 10MB per file
- File types: PDF, JPEG, JPG, PNG, GIF, WEBP
- Required files must be uploaded

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Features

1. **File Upload Security**
   - File type validation
   - File size limits
   - Secure file naming
   - Virus scanning (recommended)

2. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control
   - Admin/Verifier permissions

3. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection

## Monitoring and Logging

The API includes comprehensive logging:
- Registration submissions
- Status updates
- File uploads
- Error tracking
- Audit trails

## Testing

### Test the API with cURL

```bash
# Submit employee registration
curl -X POST http://localhost:3000/api/registration/submit \
  -F "userType=employee" \
  -F "formData={\"employee\":{\"basic\":{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"1234567890\",\"pan\":\"ABCDE1234F\",\"aadhaar\":\"123456789012\"},\"education\":{\"qualification\":\"Bachelor's\",\"experience\":5},\"jobs\":[]}}" \
  -F "resume=@/path/to/resume.pdf" \
  -F "governmentID=@/path/to/id.pdf"

# Get registrations (with auth token)
curl -X GET http://localhost:3000/api/registration \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support

For issues or questions:
1. Check the server logs for detailed error messages
2. Verify all required fields are provided
3. Ensure file uploads meet size and type requirements
4. Confirm API endpoint URLs are correct

## Changelog

### Version 1.0.0
- Initial release
- Employee and company registration support
- File upload functionality
- Status management
- Admin/Verifier dashboard integration 
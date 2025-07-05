# StaffProof Registration Integration Guide

## Overview

The registration functionality has been integrated into the existing User model and user routes. No separate models or APIs were created to maintain consistency with your existing codebase.

## What Was Modified

### 1. User Model (`Modals/User.js`)
Added registration form fields to the existing User schema:
- `pan`, `aadhaar` - Employee identification fields
- `qualification`, `experience` - Employee education fields
- `jobHistory` - Array of previous job records
- `companyName`, `website`, `gst`, `hrName`, `hrEmail`, `hrPhone` - Company fields
- `documents` - File upload fields for all document types

### 2. User Routes (`Routes/userRoutes.js`)
Added a new registration endpoint:
- `POST /api/users/register` - Handles registration with file uploads

## API Usage

### Registration Endpoint
**POST** `/api/users/register`

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `userType` (string): "employee" or "company"
  - `formData` (string): JSON string containing form data
  - Files: Various file fields based on user type

**Example Request:**
```javascript
const formData = new FormData();
formData.append('userType', 'employee');
formData.append('formData', JSON.stringify({
  employee: {
    basic: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012'
    },
    education: {
      qualification: 'Bachelor\'s Degree',
      experience: 5
    },
    jobs: []
  }
}));
formData.append('resume', file1);
formData.append('governmentID', file2);

const response = await fetch('/api/users/register', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "pending",
    "message": "Registration submitted successfully"
  },
  "message": "Registration submitted successfully. We will review your information and contact you soon."
}
```

## Frontend Integration

### 1. Use the Updated API Service
The `registrationApi.js` file has been updated to use the user routes:

```javascript
import { registrationApi } from './api/registrationApi';

// Submit registration
const response = await registrationApi.submitRegistration(userType, formData, files);
```

### 2. Update Your Register Component
Replace your current `Register.jsx` with `RegisterWithApi.jsx`:

```jsx
import RegisterWithApi from './RegisterWithApi';

// Use in your app
<RegisterWithApi />
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

## Data Storage

All registration data is stored in the existing User collection with:
- Role: "Employee" or "Employer"
- Status: "pending" (initially)
- Documents: Stored in the `documents` field
- All form fields: Stored in the appropriate User model fields

## Admin Management

Admins can manage registrations through existing user management endpoints:
- `GET /api/users` - List all users (including registrations)
- `PUT /api/users/:id/status` - Update user status
- `GET /api/users/:id` - View user details

## Environment Setup

### 1. Create Upload Directories
```bash
mkdir -p uploads/users/employee
mkdir -p uploads/users/company
```

### 2. Install Dependencies (if not already installed)
```bash
npm install multer
```

### 3. Start the Server
```bash
npm start
```

## Validation Rules

The same validation rules apply as in your registration form:
- Email: Required, valid format, unique
- Phone: Required, 10 digits
- PAN: Required, format: ABCDE1234F
- Aadhaar: Required, 12 digits
- GST: Required, valid GST format (for companies)
- Files: Required files must be uploaded

## Security Features

- File type validation (PDF, images only)
- File size limits (10MB per file)
- Secure file naming
- Input validation and sanitization
- Audit logging for all registrations

## Testing

Test the registration endpoint:

```bash
# Employee registration
curl -X POST http://localhost:3000/api/users/register \
  -F "userType=employee" \
  -F "formData={\"employee\":{\"basic\":{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"1234567890\",\"pan\":\"ABCDE1234F\",\"aadhaar\":\"123456789012\"},\"education\":{\"qualification\":\"Bachelor's\",\"experience\":5},\"jobs\":[]}}" \
  -F "resume=@/path/to/resume.pdf" \
  -F "governmentID=@/path/to/id.pdf"

# Company registration
curl -X POST http://localhost:3000/api/users/register \
  -F "userType=company" \
  -F "formData={\"company\":{\"name\":\"Test Company\",\"gst\":\"22ABCDE1234F1Z5\",\"hrName\":\"HR Manager\",\"hrEmail\":\"hr@test.com\",\"hrPhone\":\"9876543210\"}}" \
  -F "registration=@/path/to/registration.pdf" \
  -F "gst=@/path/to/gst.pdf" \
  -F "signatoryID=@/path/to/signatory.pdf"
```

## Benefits of This Approach

1. **Consistency**: Uses existing User model and routes
2. **Simplicity**: No separate models or APIs to maintain
3. **Integration**: Works seamlessly with existing admin features
4. **Scalability**: Leverages existing user management infrastructure
5. **Security**: Uses existing authentication and authorization

## Support

For any issues:
1. Check server logs for detailed error messages
2. Verify all required fields are provided
3. Ensure file uploads meet size and type requirements
4. Confirm the API endpoint URL is correct: `/api/users/register` 
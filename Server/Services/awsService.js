// AWS SDK v3 imports
const { S3, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { SES, SendEmailCommand, SendTemplatedEmailCommand, VerifyEmailIdentityCommand, GetSendStatisticsCommand, GetIdentityVerificationAttributesCommand } = require('@aws-sdk/client-ses');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3-v2');
const path = require('path');
const crypto = require('crypto');

// Initialize AWS clients
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const ses = new SES({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// File upload configuration
const allowedFileTypes = process.env.ALLOWED_FILE_TYPES.split(',');
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default

// File filter function
const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Generate unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  const nameWithoutExt = path.basename(originalname, extension);
  
  return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
};

// Configure multer for S3 upload
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'private',
    key: (req, file, cb) => {
      const folder = req.body.folder || 'documents';
      const filename = generateUniqueFilename(file.originalname);
      cb(null, `${folder}/${filename}`);
    },
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user ? req.user._id.toString() : 'anonymous',
        uploadedAt: new Date().toISOString()
      });
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 5 // Maximum 5 files per request
  }
});

// Upload single file
const uploadSingle = uploadToS3.single('file');

// Upload multiple files
const uploadMultiple = uploadToS3.array('files', 5);

// S3 Service Methods
class S3Service {
  // Upload file to S3
  static async uploadFile(file, folder = 'documents', metadata = {}) {
    try {
      const filename = generateUniqueFilename(file.originalname);
      const key = `${folder}/${filename}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      };

      await s3.send(new PutObjectCommand(params));
      return {
        url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key: key,
        bucket: process.env.AWS_S3_BUCKET,
        filename: filename,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  // Get signed URL for file access
  static async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      });
      const signedUrl = await getSignedUrl(s3, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  // Delete file from S3
  static async deleteFile(key) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      await s3.send(new DeleteObjectCommand(params));
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  // Copy file within S3
  static async copyFile(sourceKey, destinationKey) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        CopySource: `${process.env.AWS_S3_BUCKET}/${sourceKey}`,
        Key: destinationKey
      };

      await s3.send(new CopyObjectCommand(params));
      return true;
    } catch (error) {
      console.error('S3 copy error:', error);
      throw new Error('Failed to copy file in S3');
    }
  }

  // Get file metadata
  static async getFileMetadata(key) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      const result = await s3.send(new HeadObjectCommand(params));
      return result.Metadata;
    } catch (error) {
      console.error('S3 metadata error:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  // List files in folder
  static async listFiles(prefix = '', maxKeys = 100) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: prefix,
        MaxKeys: maxKeys
      };

      const result = await s3.send(new ListObjectsV2Command(params));
      return result.Contents || [];
    } catch (error) {
      console.error('S3 list error:', error);
      throw new Error('Failed to list files');
    }
  }
}

// SES Service Methods
class SESService {
  // Send email
  static async sendEmail(to, subject, htmlBody, textBody = null, from = null) {
    try {
      const params = {
        Source: from || process.env.EMAIL_FROM,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8'
            }
          }
        },
        ReplyToAddresses: [process.env.EMAIL_REPLY_TO]
      };

      if (textBody) {
        params.Message.Body.Text = {
          Data: textBody,
          Charset: 'UTF-8'
        };
      }

      const command = new SendEmailCommand(params);
      const result = await ses.send(command);
      return result.MessageId;
    } catch (error) {
      console.error('SES send email error:', error);
      throw new Error('Failed to send email');
    }
  }

  // Send templated email
  static async sendTemplatedEmail(to, templateName, templateData, from = null) {
    try {
      const params = {
        Source: from || process.env.EMAIL_FROM,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to]
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
        ReplyToAddresses: [process.env.EMAIL_REPLY_TO]
      };

      const command = new SendTemplatedEmailCommand(params);
      const result = await ses.send(command);
      return result.MessageId;
    } catch (error) {
      console.error('SES templated email error:', error);
      throw new Error('Failed to send templated email');
    }
  }

  // Send bulk email
  static async sendBulkEmail(destinations, subject, htmlBody, textBody = null, from = null) {
    try {
      const params = {
        Source: from || process.env.EMAIL_FROM,
        Destination: {
          ToAddresses: destinations
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8'
            }
          }
        },
        ReplyToAddresses: [process.env.EMAIL_REPLY_TO]
      };

      if (textBody) {
        params.Message.Body.Text = {
          Data: textBody,
          Charset: 'UTF-8'
        };
      }

      const command = new SendEmailCommand(params);
      const result = await ses.send(command);
      return result.MessageId;
    } catch (error) {
      console.error('SES bulk email error:', error);
      throw new Error('Failed to send bulk email');
    }
  }

  // Verify email address
  static async verifyEmail(email) {
    try {
      const params = {
        EmailAddress: email
      };

      const command = new VerifyEmailIdentityCommand(params);
      await ses.send(command);
      return true;
    } catch (error) {
      console.error('SES verify email error:', error);
      throw new Error('Failed to verify email address');
    }
  }

  // Get sending statistics
  static async getSendingStatistics() {
    try {
      const command = new GetSendStatisticsCommand({});
      const result = await ses.send(command);
      return result.SendDataPoints;
    } catch (error) {
      console.error('SES statistics error:', error);
      throw new Error('Failed to get sending statistics');
    }
  }

  // Check if email is verified
  static async isEmailVerified(email) {
    try {
      const params = {
        Identities: [email]
      };

      const command = new GetIdentityVerificationAttributesCommand(params);
      const result = await ses.send(command);
      const verificationAttributes = result.VerificationAttributes[email];
      
      return verificationAttributes && verificationAttributes.VerificationStatus === 'Success';
    } catch (error) {
      console.error('SES email verification check error:', error);
      return false;
    }
  }
}

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to StaffProof Platform',
    html: (data) => `
      <h2>Welcome to StaffProof, ${data.firstName}!</h2>
      <p>Thank you for joining our platform. Your account has been successfully created.</p>
      <p><strong>Role:</strong> ${data.role}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p>You can now log in to your account and start using our services.</p>
      <p>Best regards,<br>The StaffProof Team</p>
    `
  },

  verificationRequest: {
    subject: 'Document Verification Request',
    html: (data) => `
      <h2>Document Verification Request</h2>
      <p>Hello ${data.employeeName},</p>
      <p>Your employer has requested verification of your documents. Please log in to your account and upload the required documents:</p>
      <ul>
        <li>Resume/CV</li>
        <li>Government ID</li>
        <li>Payslips</li>
        <li>Experience Letters</li>
        <li>Educational Certificates (optional)</li>
      </ul>
      <p><strong>Case ID:</strong> ${data.caseId}</p>
      <p><strong>Due Date:</strong> ${data.dueDate}</p>
      <p>Please complete this verification process as soon as possible.</p>
      <p>Best regards,<br>The StaffProof Team</p>
    `
  },

  accessRequest: {
    subject: 'Access Request for Employee Information',
    html: (data) => `
      <h2>Access Request Notification</h2>
      <p>Hello ${data.employeeName},</p>
      <p>${data.requestingCompany} has requested access to your employment information for ${data.requestType}.</p>
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p>Please log in to your account to approve or deny this request.</p>
      <p>Best regards,<br>The StaffProof Team</p>
    `
  },

  passwordReset: {
    subject: 'Password Reset Request',
    html: (data) => `
      <h2>Password Reset Request</h2>
      <p>Hello ${data.firstName},</p>
      <p>You have requested a password reset for your StaffProof account.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${data.resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Best regards,<br>The StaffProof Team</p>
    `
  },

  blacklistNotification: {
    subject: 'Account Status Update',
    html: (data) => `
      <h2>Account Status Update</h2>
      <p>Hello ${data.firstName},</p>
      <p>Your account has been ${data.action} from the StaffProof platform.</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p>If you believe this is an error, please contact our support team.</p>
      <p>Best regards,<br>The StaffProof Team</p>
    `
  }
};

module.exports = {
  uploadToS3,
  uploadSingle,
  uploadMultiple,
  S3Service,
  SESService,
  emailTemplates,
  fileFilter,
  generateUniqueFilename
}; 
# Notification Creators Guide

## Overview

This guide explains who creates notifications in the StaffProof platform and how to add new automatic notification triggers.

## 🤖 Automatic Notifications (System-Generated)

### 1. **Verification System**
**Triggered by:** Verification case events
**Created by:** System automatically

```javascript
// When verification case is created
await NotificationService.sendVerificationNotification(
  employeeId, 
  'pending', 
  caseId
);

// When verification status changes
await NotificationService.sendVerificationNotification(
  employeeId, 
  'approved', // or 'rejected', 'in_progress'
  caseId
);

// When case is assigned to verifier
await NotificationService.sendVerificationNotification(
  verifierId, 
  'assigned', 
  caseId
);
```

**Events that trigger notifications:**
- ✅ New verification case created
- ✅ Verification status updated (pending → approved/rejected)
- ✅ Case assigned to verifier
- ✅ Documents uploaded
- ✅ Verification completed

### 2. **Billing System**
**Triggered by:** Payment events
**Created by:** System automatically

```javascript
// When new invoice is created
await NotificationService.sendBillingNotification(userId, {
  status: 'pending',
  amount: 1000,
  invoiceNumber: 'INV-001',
  _id: billingId
});

// When payment is received
await NotificationService.sendBillingNotification(userId, {
  status: 'paid',
  amount: 1000,
  invoiceNumber: 'INV-001',
  _id: billingId
});
```

**Events that trigger notifications:**
- ✅ New invoice generated
- ✅ Payment received
- ✅ Payment due reminder
- ✅ Subscription expired
- ✅ Refund processed

### 3. **Security System**
**Triggered by:** Security events
**Created by:** System automatically

```javascript
// When new login detected
await NotificationService.sendSecurityAlert(userId, 'login', {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  location: 'New York, US'
});

// When password is changed
await NotificationService.sendSecurityAlert(userId, 'password_change', {
  changedAt: new Date(),
  ipAddress: req.ip
});
```

**Events that trigger notifications:**
- ✅ New login from unrecognized device
- ✅ Password changed
- ✅ Profile information updated
- ✅ Documents uploaded
- ✅ Verification request submitted

### 4. **Access Request System**
**Triggered by:** Access management events
**Created by:** System automatically

```javascript
// When new access request is submitted
await NotificationService.sendAccessRequestNotification(
  adminIds, 
  requestData
);

// When access request is approved/rejected
await NotificationService.sendAccessRequestNotification(
  [requesterId], 
  { ...requestData, status: 'approved' }
);
```

**Events that trigger notifications:**
- ✅ New access request submitted
- ✅ Access request approved/rejected
- ✅ Role changes made
- ✅ Permission updates

## 👤 Manual Notifications (User-Generated)

### 1. **Admin Users**
**Can send:** Test notifications, bulk notifications, system announcements

```javascript
// Send test notification
POST /api/notifications/test
{
  "recipientId": "user_id",
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight",
  "type": "warning",
  "category": "system"
}

// Send bulk notifications
POST /api/notifications/bulk
{
  "recipientIds": ["user1", "user2", "user3"],
  "title": "Important Update",
  "message": "New features available",
  "type": "info"
}
```

### 2. **System Administrators**
**Can send:** System-wide announcements, maintenance notifications

```javascript
// Send system maintenance notification
await NotificationService.sendSystemMaintenanceNotification(
  userIds,
  {
    date: '2024-01-15',
    startTime: '02:00',
    endTime: '04:00',
    description: 'Database maintenance'
  }
);
```

## 🔧 How to Add New Automatic Notifications

### Step 1: Identify the Event
Choose when you want to send a notification:
- User action (login, upload, etc.)
- System event (payment, verification, etc.)
- Scheduled event (reminders, maintenance, etc.)

### Step 2: Add Notification Service Import
```javascript
// In your route file
const NotificationService = require('../Services/notificationService');
```

### Step 3: Add Notification Call
```javascript
// Example: When user uploads a document
router.post('/upload-document', async (req, res) => {
  // ... existing upload logic ...
  
  // Send notification
  try {
    await NotificationService.sendSecurityAlert(userId, 'document_upload', {
      documentType: req.body.type,
      fileName: req.file.originalname,
      uploadedAt: new Date()
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
  
  res.json({ success: true });
});
```

### Step 4: Create Custom Notification Method (Optional)
If you need a specific notification type, add it to `notificationService.js`:

```javascript
// Add to notificationService.js
static async sendDocumentNotification(userId, documentData) {
  const notificationData = {
    recipient: userId,
    title: 'Document Uploaded',
    message: `Your document "${documentData.fileName}" has been uploaded successfully.`,
    type: 'success',
    category: 'document',
    priority: 'medium',
    action: {
      type: 'link',
      label: 'View Document',
      url: `/documents/${documentData._id}`
    },
    relatedResource: {
      type: 'document',
      id: documentData._id
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
      push: false
    }
  };

  return await this.createNotification(notificationData);
}
```

## 📋 Notification Categories

### Available Categories:
1. **verification** - Document verification updates
2. **billing** - Payment and billing notifications
3. **security** - Security alerts and login notifications
4. **system** - System maintenance and updates
5. **profile** - Profile updates and changes
6. **access** - Access request updates
7. **company** - Company-related notifications
8. **employee** - Employee-specific notifications
9. **employer** - Employer-specific notifications
10. **admin** - Admin notifications
11. **verifier** - Verifier-specific notifications

### Available Types:
1. **info** - General information
2. **success** - Successful operations
3. **warning** - Important warnings
4. **error** - Error notifications
5. **system** - System-level notifications

## 🎯 Best Practices

### 1. **Don't Spam Users**
```javascript
// Good: Only send important notifications
if (status === 'approved' || status === 'rejected') {
  await NotificationService.sendVerificationNotification(userId, status, caseId);
}

// Bad: Sending notifications for every minor update
await NotificationService.sendVerificationNotification(userId, 'updated', caseId);
```

### 2. **Use Appropriate Priority**
```javascript
// High priority for security alerts
await NotificationService.sendSecurityAlert(userId, 'login', details);

// Medium priority for business events
await NotificationService.sendBillingNotification(userId, billingData);

// Low priority for general updates
await NotificationService.createNotification({
  recipient: userId,
  title: 'Profile Updated',
  message: 'Your profile has been updated.',
  type: 'info',
  category: 'profile',
  priority: 'low'
});
```

### 3. **Include Action Buttons**
```javascript
// Good: Include action button
await NotificationService.sendVerificationNotification(userId, 'approved', caseId);
// This automatically includes "View Details" button

// Better: Custom action
await NotificationService.createNotification({
  recipient: userId,
  title: 'Payment Due',
  message: 'Your payment is due in 3 days.',
  action: {
    type: 'link',
    label: 'Pay Now',
    url: `/billing/${invoiceId}/pay`
  }
});
```

## 🔍 Testing Notifications

### 1. **Test Individual Notifications**
```javascript
// Admin can test notifications
POST /api/notifications/test
{
  "recipientId": "your_user_id",
  "title": "Test Notification",
  "message": "This is a test notification",
  "type": "info",
  "category": "system"
}
```

### 2. **Check Notification Delivery**
```javascript
// Check delivery status
const notification = await Notification.findById(notificationId);
console.log(notification.deliveryStatus);
```

### 3. **Monitor Notification Statistics**
```javascript
// Get notification stats (Admin only)
GET /api/notifications/stats?period=30
```

## 🚀 Adding Notifications to New Features

### Example: Adding notifications to a new "Document Sharing" feature

```javascript
// 1. Import notification service
const NotificationService = require('../Services/notificationService');

// 2. Add notification when document is shared
router.post('/share-document', async (req, res) => {
  const { documentId, sharedWith } = req.body;
  
  // ... existing sharing logic ...
  
  // Send notification to shared users
  for (const userId of sharedWith) {
    try {
      await NotificationService.createNotification({
        recipient: userId,
        title: 'Document Shared',
        message: `${req.user.firstName} shared a document with you.`,
        type: 'info',
        category: 'document',
        action: {
          type: 'link',
          label: 'View Document',
          url: `/documents/${documentId}`
        },
        channels: {
          inApp: true,
          email: true,
          sms: false,
          push: false
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
  
  res.json({ success: true });
});
```

## 📊 Notification Analytics

### Track Notification Performance:
- **Delivery rates** by channel (email, SMS, push)
- **Read rates** by notification type
- **Action click rates** for interactive notifications
- **User engagement** by notification category

### Monitor for Issues:
- Failed email deliveries
- SMS delivery errors
- High unread notification counts
- Expired notifications

---

**Remember**: The goal is to keep users informed without overwhelming them. Use notifications strategically to improve user experience and engagement. 
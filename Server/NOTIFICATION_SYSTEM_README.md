# Notification System Implementation

## Overview

The StaffProof platform now includes a comprehensive notification system that supports multiple channels (in-app, email, SMS, push) and various notification types for different user roles.

## Features

### ✅ Backend Features
- **Real-time notifications** with MongoDB storage
- **Multiple delivery channels** (in-app, email, SMS, push)
- **Notification categories** (verification, billing, security, system, etc.)
- **Priority levels** (low, medium, high, urgent)
- **Interactive notifications** with action buttons/links
- **Scheduled notifications** with expiration
- **Bulk notification sending**
- **Comprehensive filtering and pagination**
- **Admin statistics and analytics**

### ✅ Frontend Features
- **Notification bell** with unread count badge
- **Real-time dropdown** with filtering tabs
- **Toast notifications** for immediate feedback
- **Full notification page** with advanced filtering
- **Global state management** with React Context
- **Responsive design** for all devices

## Database Schema

### Notification Model
```javascript
{
  recipient: ObjectId,        // User who receives the notification
  title: String,              // Notification title
  message: String,            // Notification message
  type: String,               // info, success, warning, error, system
  category: String,           // verification, billing, security, etc.
  priority: String,           // low, medium, high, urgent
  read: Boolean,              // Read status
  action: {                   // Interactive action
    type: String,             // link, button, modal, none
    label: String,
    url: String,
    data: Mixed
  },
  relatedResource: {          // Related resource
    type: String,
    id: ObjectId
  },
  sender: ObjectId,           // User who sent the notification
  expiresAt: Date,            // Expiration date
  scheduledFor: Date,         // Scheduled delivery
  channels: {                 // Delivery channels
    inApp: Boolean,
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  deliveryStatus: {           // Delivery tracking
    inApp: { delivered: Boolean, deliveredAt: Date },
    email: { sent: Boolean, sentAt: Date, error: String },
    sms: { sent: Boolean, sentAt: Date, error: String },
    push: { sent: Boolean, sentAt: Date, error: String }
  },
  metadata: Mixed,            // Additional data
  createdAt: Date,
  updatedAt: Date,
  readAt: Date
}
```

## API Endpoints

### Get Notifications
```
GET /api/notifications
Query params: page, limit, type, category, read, priority
```

### Get Unread Count
```
GET /api/notifications/unread-count
```

### Get Specific Notification
```
GET /api/notifications/:id
```

### Mark as Read
```
PUT /api/notifications/:id/read
```

### Mark as Unread
```
PUT /api/notifications/:id/unread
```

### Mark All as Read
```
PUT /api/notifications/mark-all-read
Query params: category (optional)
```

### Delete Notification
```
DELETE /api/notifications/:id
```

### Clear Read Notifications
```
DELETE /api/notifications/clear-read
Query params: category (optional)
```

### Send Test Notification (Admin)
```
POST /api/notifications/test
Body: { recipientId, title, message, type, category, priority, channels }
```

### Send Bulk Notifications (Admin)
```
POST /api/notifications/bulk
Body: { recipientIds, title, message, type, category, priority, channels }
```

### Get Statistics (Admin)
```
GET /api/notifications/stats
Query params: period (default: 30 days)
```

## Usage Examples

### 1. Send Verification Notification
```javascript
import NotificationService from '../Services/notificationService';

// When verification status changes
await NotificationService.sendVerificationNotification(
  userId, 
  'approved', 
  caseId
);
```

### 2. Send Billing Notification
```javascript
await NotificationService.sendBillingNotification(userId, {
  status: 'paid',
  amount: 1000,
  invoiceNumber: 'INV-001'
});
```

### 3. Send Security Alert
```javascript
await NotificationService.sendSecurityAlert(userId, 'login', {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});
```

### 4. Send System Maintenance Notification
```javascript
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

## Frontend Components

### 1. NotificationBell
```jsx
import { NotificationBell } from '../components/NotificationSystem';

// In your header
<NotificationBell />
```

### 2. NotificationPage
```jsx
import { NotificationPage } from '../components/NotificationSystem';

// In your routes
<Route path="/notifications" element={<NotificationPage />} />
```

### 3. NotificationToast
```jsx
import { NotificationToast } from '../components/NotificationSystem';

// For real-time notifications
<NotificationToast 
  notification={notification}
  onClose={() => setShowToast(false)}
  onAction={handleAction}
/>
```

### 4. NotificationProvider
```jsx
import { NotificationProvider } from '../components/NotificationSystem';

// Wrap your app
<NotificationProvider>
  <YourApp />
</NotificationProvider>
```

## Integration with Existing Routes

The notification system is integrated into existing routes:

### Verification Routes
- Sends notifications when verification cases are created
- Sends notifications when verification status changes
- Sends notifications when cases are assigned

### Billing Routes
- Sends notifications for payment confirmations
- Sends notifications for payment due reminders

### Access Request Routes
- Sends notifications to admins for new access requests
- Sends notifications when access requests are approved/rejected

## Configuration

### Environment Variables
```env
# Email configuration (for SES)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_access_key
AWS_SES_SECRET_ACCESS_KEY=your_secret_key

# SMS configuration (optional)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token

# Push notification configuration (optional)
PUSH_PROVIDER=firebase
FIREBASE_SERVER_KEY=your_server_key
```

### Notification Settings
Users can configure their notification preferences:
- Email notifications
- SMS notifications
- Push notifications
- In-app notifications
- Category-specific settings

## Security Considerations

1. **Authentication**: All notification endpoints require authentication
2. **Authorization**: Users can only access their own notifications
3. **Rate Limiting**: Implement rate limiting for notification creation
4. **Data Validation**: All notification data is validated before storage
5. **Audit Logging**: All notification actions are logged for security

## Performance Optimizations

1. **Database Indexes**: Optimized indexes for common queries
2. **Pagination**: Efficient pagination for large notification lists
3. **Caching**: Redis caching for frequently accessed data
4. **Background Processing**: Queue-based processing for bulk notifications
5. **Compression**: Gzip compression for API responses

## Monitoring and Analytics

### Admin Dashboard
- Total notifications sent
- Read/unread statistics
- Delivery success rates
- Category-wise analytics
- User engagement metrics

### Error Tracking
- Failed email deliveries
- SMS delivery errors
- Push notification failures
- Database connection issues

## Future Enhancements

1. **Real-time WebSocket**: Live notification updates
2. **Mobile Push**: Native mobile push notifications
3. **Rich Media**: Support for images and videos
4. **Templates**: Customizable notification templates
5. **Automation**: Rule-based automatic notifications
6. **Analytics**: Advanced user behavior analytics
7. **A/B Testing**: Notification effectiveness testing

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check authentication token
   - Verify user permissions
   - Check database connection

2. **Email not sending**
   - Verify AWS SES configuration
   - Check email templates
   - Review delivery status

3. **High unread count**
   - Check notification expiration
   - Verify read status updates
   - Review notification cleanup

### Debug Commands

```javascript
// Check notification delivery status
const notification = await Notification.findById(id);
console.log(notification.deliveryStatus);

// Force send email notification
await NotificationService.sendEmailNotification(notification);

// Clear expired notifications
await NotificationService.cleanupExpiredNotifications();
```

## Support

For issues or questions about the notification system:
1. Check the logs for error messages
2. Verify database connectivity
3. Test individual notification channels
4. Review notification service configuration

---

**Note**: This notification system is designed to be scalable and maintainable. All components are modular and can be easily extended or modified as needed. 
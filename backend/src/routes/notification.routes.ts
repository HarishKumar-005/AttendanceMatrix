import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { notificationQuerySchema, notificationIdParamSchema } from '../schemas/notification.schema.js';

const router = Router();

router.get(
  '/',
  validateRequest({ query: notificationQuerySchema }),
  notificationController.getNotifications
);

router.get('/unread-count', notificationController.getUnreadCount);

router.get('/analytics', notificationController.getAnalytics);

router.patch(
  '/:id/read',
  validateRequest({ params: notificationIdParamSchema }),
  notificationController.markAsRead
);

router.post('/mark-all-read', notificationController.markAllAsRead);

router.delete(
  '/:id',
  validateRequest({ params: notificationIdParamSchema }),
  notificationController.dismissNotification
);

router.delete('/', notificationController.clearAllNotifications);

export default router;

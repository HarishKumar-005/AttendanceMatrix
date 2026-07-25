import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';

export class NotificationController {
  public async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as {
        unread_only?: boolean;
        severity?: any;
        page?: number;
        limit?: number;
      };
      const result = await notificationService.getNotifications(query);
      res.status(200).json({
        success: true,
        data: result.notifications,
        meta: {
          total: result.total,
          unread_count: result.unread_count,
          page: query.page || 1,
          limit: query.limit || 20,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount();
      res.status(200).json({
        success: true,
        data: { unread_count: count },
      });
    } catch (err) {
      next(err);
    }
  }

  public async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  }

  public async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedCount = await notificationService.markAllAsRead();
      res.status(200).json({
        success: true,
        data: { updated_count: updatedCount },
      });
    } catch (err) {
      next(err);
    }
  }

  public async dismissNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await notificationService.dismissNotification(req.params.id);
      res.status(200).json({
        success: true,
        data: { dismissed: true, id: req.params.id },
      });
    } catch (err) {
      next(err);
    }
  }

  public async clearAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clearedCount = await notificationService.clearAllNotifications();
      res.status(200).json({
        success: true,
        data: { cleared_count: clearedCount },
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await notificationService.getNotificationAnalytics();
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();

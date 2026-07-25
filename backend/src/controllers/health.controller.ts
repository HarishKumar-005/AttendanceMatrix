import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db.js';
import { ApiSuccessResponse } from '../types/index.js';

export const getHealthStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let dbConnected = false;

    try {
      const { error } = await supabase.from('attendance_policy').select('id').limit(1);
      dbConnected = !error;
    } catch {
      dbConnected = false;
    }

    const responsePayload: ApiSuccessResponse<{
      status: string;
      timestamp: string;
      version: string;
      dbConnected: boolean;
    }> = {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        dbConnected,
      },
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

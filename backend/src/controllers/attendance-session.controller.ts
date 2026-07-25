import { Request, Response, NextFunction } from 'express';
import { attendanceSessionService } from '../services/attendance-session.service.js';
import { ApiSuccessResponse } from '../types/index.js';
import { GetSessionQueryInput, SaveSessionInput } from '../schemas/attendance.schema.js';

export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryInput = req.query as unknown as GetSessionQueryInput;
    const session = await attendanceSessionService.getSession(queryInput);

    const response: ApiSuccessResponse<typeof session> = {
      success: true,
      data: session,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const saveSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bodyInput = req.body as SaveSessionInput;
    const result = await attendanceSessionService.saveSession(bodyInput);

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

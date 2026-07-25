import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service.js';
import { ApiSuccessResponse } from '../types/index.js';
import { CreateAttendanceInput, UpdateAttendanceInput, GetRecordsQueryInput } from '../schemas/attendance.schema.js';

export const getRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryInput = req.query as unknown as GetRecordsQueryInput;
    const result = await attendanceService.getRecords(queryInput);

    const response: ApiSuccessResponse<typeof result.records> = {
      success: true,
      data: result.records,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRecordById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const record = await attendanceService.getRecordById(req.params.id);

    const response: ApiSuccessResponse<typeof record> = {
      success: true,
      data: record,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bodyInput = req.body as CreateAttendanceInput;
    const result = await attendanceService.createRecord(bodyInput);

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bodyInput = req.body as UpdateAttendanceInput;
    const result = await attendanceService.updateRecord(req.params.id, bodyInput);

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

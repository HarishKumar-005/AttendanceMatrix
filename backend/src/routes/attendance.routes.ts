import { Router } from 'express';
import { getSession, saveSession } from '../controllers/attendance-session.controller.js';
import { getRecords, getRecordById, createRecord, updateRecord } from '../controllers/records.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  getSessionQuerySchema,
  saveSessionSchema,
  getRecordsQuerySchema,
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
} from '../schemas/attendance.schema.js';

const router = Router();

// Session endpoints
router.get('/session', validateRequest({ query: getSessionQuerySchema }), getSession);
router.post('/session/save', validateRequest({ body: saveSessionSchema }), saveSession);

// History / records endpoints
router.get('/history', validateRequest({ query: getRecordsQuerySchema }), getRecords);
router.get('/history/:id', validateRequest({ params: recordIdParamSchema }), getRecordById);
router.post('/history', validateRequest({ body: createRecordSchema }), createRecord);
router.put('/history/:id', validateRequest({ params: recordIdParamSchema, body: updateRecordSchema }), updateRecord);

export default router;

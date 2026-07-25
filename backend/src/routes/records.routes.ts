import { Router } from 'express';
import {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
} from '../controllers/records.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  getRecordsQuerySchema,
} from '../schemas/attendance.schema.js';

const router = Router();

router.get('/', validateRequest({ query: getRecordsQuerySchema }), getRecords);
router.get('/:id', validateRequest({ params: recordIdParamSchema }), getRecordById);
router.post('/', validateRequest({ body: createRecordSchema }), createRecord);
router.put(
  '/:id',
  validateRequest({ params: recordIdParamSchema, body: updateRecordSchema }),
  updateRecord
);

export default router;

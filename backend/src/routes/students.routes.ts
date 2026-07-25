import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  getStudentSummary,
} from '../controllers/students.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { studentIdParamSchema } from '../schemas/attendance.schema.js';

const router = Router();

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.get(
  '/:studentId/summary',
  validateRequest({ params: studentIdParamSchema }),
  getStudentSummary
);

export default router;

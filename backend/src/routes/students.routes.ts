import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  getStudentSummary,
  updateStudent,
} from '../controllers/students.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { studentIdParamSchema, updateStudentSchema } from '../schemas/attendance.schema.js';

const router = Router();

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', validateRequest({ body: updateStudentSchema }), updateStudent);
router.get(
  '/:studentId/summary',
  validateRequest({ params: studentIdParamSchema }),
  getStudentSummary
);

export default router;

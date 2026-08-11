import { Router } from 'express';
import { ChallanController } from './challan.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createChallanSchema,
  updateChallanStatusSchema,
  getChallansSchema,
} from './challan.validation';
import { Role } from '../../types/enums';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validate(createChallanSchema),
  ChallanController.createChallan
);

router.get(
  '/',
  validate(getChallansSchema),
  ChallanController.getChallans
);

router.get(
  '/:id',
  ChallanController.getChallanById
);

router.patch(
  '/:id/status',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE),
  validate(updateChallanStatusSchema),
  ChallanController.updateChallanStatus
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  ChallanController.deleteChallan
);

export default router;

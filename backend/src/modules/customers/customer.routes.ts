import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addFollowUpSchema,
  getCustomersSchema,
} from './customer.validation';
import { Role } from '../../types/enums';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validate(createCustomerSchema),
  CustomerController.createCustomer
);

router.get(
  '/',
  validate(getCustomersSchema),
  CustomerController.getCustomers
);

router.get(
  '/:id',
  CustomerController.getCustomerById
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  validate(updateCustomerSchema),
  CustomerController.updateCustomer
);

router.post(
  '/:id/follow-ups',
  requireRole(Role.ADMIN, Role.SALES),
  validate(addFollowUpSchema),
  CustomerController.addFollowUp
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  CustomerController.deleteCustomer
);

export default router;

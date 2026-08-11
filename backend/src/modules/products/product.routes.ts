import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
  getProductsSchema,
} from './product.validation';
import { Role } from '../../types/enums';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validate(createProductSchema),
  ProductController.createProduct
);

router.get(
  '/',
  validate(getProductsSchema),
  ProductController.getProducts
);

router.get(
  '/stock-movements/logs',
  ProductController.getStockMovements
);

router.get(
  '/:id',
  ProductController.getProductById
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.post(
  '/:id/stock',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validate(adjustStockSchema),
  ProductController.adjustStock
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  ProductController.deleteProduct
);

export default router;

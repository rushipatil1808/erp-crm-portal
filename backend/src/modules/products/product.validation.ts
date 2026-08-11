import { z } from 'zod';
import { MovementType } from '../../types/enums';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    sku: z.string().min(2, 'SKU code is required'),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().positive('Unit price must be greater than 0'),
    currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
    minStockAlert: z.number().int().min(0, 'Minimum stock alert cannot be negative').default(5),
    location: z.string().min(2, 'Location/Warehouse is required'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    sku: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    unitPrice: z.number().positive().optional(),
    minStockAlert: z.number().int().min(0).optional(),
    location: z.string().min(2).optional(),
  }),
});

export const adjustStockSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    type: z.nativeEnum(MovementType),
    reason: z.string().min(2, 'Reason for stock adjustment is required'),
  }),
});

export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStock: z.string().optional(),
  }),
});

import { z } from 'zod';
import { ChallanStatus } from '../../types/enums';

const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Item quantity must be at least 1'),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
    items: z.array(challanItemSchema).min(1, 'Challan must contain at least one item'),
  }),
});

export const updateChallanStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Challan ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(ChallanStatus),
  }),
});

export const getChallansSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.nativeEnum(ChallanStatus).optional(),
    customerId: z.string().optional(),
  }),
});

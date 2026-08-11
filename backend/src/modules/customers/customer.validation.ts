import { z } from 'zod';
import { CustomerType, CustomerStatus } from '../../types/enums';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    email: z.string().email('Invalid email address format'),
    businessName: z.string().min(2, 'Business name is required'),
    gstNumber: z.string().optional(),
    type: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
    address: z.string().min(3, 'Address is required'),
    status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
    followUpDate: z.string().datetime({ offset: true }).or(z.string()).optional(),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    mobile: z.string().min(10).optional(),
    email: z.string().email().optional(),
    businessName: z.string().min(2).optional(),
    gstNumber: z.string().optional(),
    type: z.nativeEnum(CustomerType).optional(),
    address: z.string().min(3).optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
    followUpDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const addFollowUpSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
  body: z.object({
    note: z.string().min(2, 'Follow-up note is required'),
    nextFollowUpDate: z.string().optional(),
  }),
});

export const getCustomersSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
    type: z.nativeEnum(CustomerType).optional(),
  }),
});

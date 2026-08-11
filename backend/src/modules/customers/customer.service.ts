import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { CustomerStatus, CustomerType } from '../../types/enums';
import { Prisma } from '@prisma/client';

export class CustomerService {
  static async createCustomer(data: any, userId: string) {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    return customer;
  }

  static async getCustomers(query: {
    page?: string;
    limit?: string;
    search?: string;
    status?: CustomerStatus;
    type?: CustomerType;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { mobile: { contains: query.search } },
        { businessName: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { followUps: true, challans: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            challanNumber: true,
            totalQuantity: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    return customer;
  }

  static async updateCustomer(id: string, data: any) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Customer not found');
    }

    const updateData = { ...data };
    if (data.followUpDate) {
      updateData.followUpDate = new Date(data.followUpDate);
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return customer;
  }

  static async addFollowUp(customerId: string, data: { note: string; nextFollowUpDate?: string }, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const nextDate = data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null;

    const [followUp] = await prisma.$transaction([
      prisma.customerFollowUp.create({
        data: {
          customerId,
          note: data.note,
          nextFollowUpDate: nextDate,
          createdById: userId,
        },
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: { followUpDate: nextDate || customer.followUpDate },
      }),
    ]);

    return followUp;
  }

  static async deleteCustomer(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    await prisma.$transaction([
      prisma.customerFollowUp.deleteMany({ where: { customerId: id } }),
      prisma.customer.delete({ where: { id } }),
    ]);

    return { message: `Customer '${customer.name}' deleted successfully` };
  }
}

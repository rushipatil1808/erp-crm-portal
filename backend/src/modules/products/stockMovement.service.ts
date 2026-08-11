import { prisma } from '../../config/db';
import { MovementType } from '../../types/enums';
import { Prisma } from '@prisma/client';

export class StockMovementService {
  static async logMovement(
    productId: string,
    quantity: number,
    type: MovementType,
    reason: string,
    createdById: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = tx || prisma;
    return await db.stockMovement.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  static async getMovements(query: {
    productId?: string;
    page?: string;
    limit?: string;
    type?: MovementType;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};
    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.type) {
      where.type = query.type;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

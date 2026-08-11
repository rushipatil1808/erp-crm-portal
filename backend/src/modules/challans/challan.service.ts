import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { generateChallanNo } from '../../utils/generateChallanNo';
import { ChallanStatus, MovementType } from '../../types/enums';
import { Prisma } from '@prisma/client';
import { StockMovementService } from '../products/stockMovement.service';

export class ChallanService {
  static async createChallan(
    data: {
      customerId: string;
      status: ChallanStatus;
      items: Array<{ productId: string; quantity: number }>;
    },
    userId: string
  ) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ApiError(400, 'One or more selected products do not exist');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const itemsToCreate = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      totalQuantity += item.quantity;
      totalAmount += product.unitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        productName: product.name,
        sku: product.sku,
      };
    });

    const challanNumber = await generateChallanNo();

    return await prisma.$transaction(async (tx) => {
      if (data.status === ChallanStatus.CONFIRMED) {
        for (const item of data.items) {
          const product = productMap.get(item.productId)!;
          if (product.currentStock < item.quantity) {
            throw new ApiError(
              400,
              `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available stock: ${product.currentStock}, Requested: ${item.quantity}`
            );
          }
        }

        for (const item of data.items) {
          const product = productMap.get(item.productId)!;
          const newStock = product.currentStock - item.quantity;

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: newStock },
          });

          await StockMovementService.logMovement(
            product.id,
            item.quantity,
            MovementType.OUT,
            `Sales Challan #${challanNumber}`,
            userId,
            tx
          );
        }
      }

      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          totalQuantity,
          totalAmount,
          status: data.status,
          createdById: userId,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          customer: true,
          createdBy: {
            select: { id: true, name: true, role: true },
          },
          items: true,
        },
      });

      return challan;
    });
  }

  static async getChallans(query: {
    page?: string;
    limit?: string;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ChallanWhereInput = {};

    if (query.search) {
      where.OR = [
        { challanNumber: { contains: query.search } },
        { customer: { name: { contains: query.search } } },
        { customer: { businessName: { contains: query.search } } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, email: true, mobile: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return {
      data: challans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true, location: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw new ApiError(404, 'Sales Challan not found');
    }

    return challan;
  }

  static async updateChallanStatus(id: string, newStatus: ChallanStatus, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!challan) {
      throw new ApiError(404, 'Sales Challan not found');
    }

    if (challan.status === newStatus) {
      return challan;
    }

    return await prisma.$transaction(async (tx) => {
      if (challan.status === ChallanStatus.DRAFT && newStatus === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          const product = item.product;
          if (product.currentStock < item.quantity) {
            throw new ApiError(
              400,
              `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`
            );
          }
        }

        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await StockMovementService.logMovement(
            item.productId,
            item.quantity,
            MovementType.OUT,
            `Sales Challan #${challan.challanNumber} Confirmed`,
            userId,
            tx
          );
        }
      }

      if (challan.status === ChallanStatus.CONFIRMED && newStatus === ChallanStatus.CANCELLED) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await StockMovementService.logMovement(
            item.productId,
            item.quantity,
            MovementType.IN,
            `Sales Challan #${challan.challanNumber} Cancelled`,
            userId,
            tx
          );
        }
      }

      const updatedChallan = await tx.challan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      return updatedChallan;
    });
  }

  static async deleteChallan(id: string, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      throw new ApiError(404, 'Sales Challan not found');
    }

    return await prisma.$transaction(async (tx) => {
      // If confirmed, restore product stock before deleting
      if (challan.status === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await StockMovementService.logMovement(
            item.productId,
            item.quantity,
            MovementType.IN,
            `Sales Challan #${challan.challanNumber} Deleted (Stock Restored)`,
            userId,
            tx
          );
        }
      }

      await tx.challanItem.deleteMany({ where: { challanId: id } });
      await tx.challan.delete({ where: { id } });

      return { message: `Sales Challan #${challan.challanNumber} deleted successfully` };
    });
  }
}

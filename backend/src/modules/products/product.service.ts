import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { MovementType } from '../../types/enums';
import { Prisma } from '@prisma/client';
import { StockMovementService } from './stockMovement.service';

export class ProductService {
  static async createProduct(data: any, userId: string) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.toUpperCase() },
    });
    if (existingSku) {
      throw new ApiError(409, `Product with SKU '${data.sku}' already exists`);
    }

    const skuUpper = data.sku.toUpperCase();

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...data,
          sku: skuUpper,
        },
      });

      if (data.currentStock > 0) {
        await StockMovementService.logMovement(
          product.id,
          data.currentStock,
          MovementType.IN,
          'Initial Stock Entry',
          userId,
          tx
        );
      }

      return product;
    });
  }

  static async getProducts(query: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    lowStock?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    if (query.category) {
      where.category = { equals: query.category };
    }

    if (query.lowStock === 'true') {
      where.currentStock = {
        lte: 10,
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return product;
  }

  static async updateProduct(id: string, data: any) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (data.sku) {
      data.sku = data.sku.toUpperCase();
      const existingSku = await prisma.product.findFirst({
        where: { sku: data.sku, NOT: { id } },
      });
      if (existingSku) {
        throw new ApiError(409, `Product with SKU '${data.sku}' already exists`);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
    });

    return updatedProduct;
  }

  static async adjustStock(
    id: string,
    data: { quantity: number; type: MovementType; reason: string },
    userId: string
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (data.type === MovementType.OUT && product.currentStock < data.quantity) {
      throw new ApiError(
        400,
        `Cannot reduce stock by ${data.quantity}. Current stock is only ${product.currentStock}`
      );
    }

    const newStock =
      data.type === MovementType.IN
        ? product.currentStock + data.quantity
        : product.currentStock - data.quantity;

    return await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock },
      });

      await StockMovementService.logMovement(
        id,
        data.quantity,
        data.type,
        data.reason,
        userId,
        tx
      );

      return updatedProduct;
    });
  }

  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    await prisma.$transaction([
      prisma.stockMovement.deleteMany({ where: { productId: id } }),
      prisma.challanItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return { message: `Product '${product.name}' deleted successfully` };
  }
}

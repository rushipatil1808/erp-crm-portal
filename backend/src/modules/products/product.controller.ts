import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { StockMovementService } from './stockMovement.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class ProductController {
  static createProduct = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const product = await ProductService.createProduct(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  });

  static getProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProductService.getProducts(req.query as any);
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  static getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    res.status(200).json({
      success: true,
      data: product,
    });
  });

  static updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  });

  static adjustStock = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const product = await ProductService.adjustStock(id, req.body, userId);
    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully',
      data: product,
    });
  });

  static getStockMovements = asyncHandler(async (req: Request, res: Response) => {
    const result = await StockMovementService.getMovements(req.query as any);
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  static deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
    res.status(200).json({
      success: true,
      ...result,
    });
  });
}

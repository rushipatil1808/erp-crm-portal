import { Request, Response } from 'express';
import { ChallanService } from './challan.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class ChallanController {
  static createChallan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const challan = await ChallanService.createChallan(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Sales Challan created successfully',
      data: challan,
    });
  });

  static getChallans = asyncHandler(async (req: Request, res: Response) => {
    const result = await ChallanService.getChallans(req.query as any);
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  static getChallanById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const challan = await ChallanService.getChallanById(id);
    res.status(200).json({
      success: true,
      data: challan,
    });
  });

  static updateChallanStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;
    const challan = await ChallanService.updateChallanStatus(id, status, userId);
    res.status(200).json({
      success: true,
      message: `Sales Challan status updated to ${status}`,
      data: challan,
    });
  });

  static deleteChallan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await ChallanService.deleteChallan(id, userId);
    res.status(200).json({
      success: true,
      ...result,
    });
  });
}

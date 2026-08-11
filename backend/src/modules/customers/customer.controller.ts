import { Request, Response } from 'express';
import { CustomerService } from './customer.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class CustomerController {
  static createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const customer = await CustomerService.createCustomer(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  });

  static getCustomers = asyncHandler(async (req: Request, res: Response) => {
    const result = await CustomerService.getCustomers(req.query as any);
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  static getCustomerById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = await CustomerService.getCustomerById(id);
    res.status(200).json({
      success: true,
      data: customer,
    });
  });

  static updateCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = await CustomerService.updateCustomer(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  });

  static addFollowUp = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const followUp = await CustomerService.addFollowUp(id, req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Follow-up note added successfully',
      data: followUp,
    });
  });

  static deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CustomerService.deleteCustomer(id);
    res.status(200).json({
      success: true,
      ...result,
    });
  });
}

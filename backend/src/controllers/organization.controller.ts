import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as organizationService from '../services/organization.service';
import { createOrganizationSchema } from '../validators/organization.validator';
import { z } from 'zod';

export const createOrganization = asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = createOrganizationSchema.parse(req.body);

    // Check if slug or email already exists
    const existingOrgBySlug = await organizationService.getOrganizationBySlug(validatedData.slug);
    if (existingOrgBySlug) {
      throw new ApiError(409, 'Organization with this slug already exists');
    }

    // In a real app, you might also want to check for email duplication via another service call, 
    // but Prisma will throw a unique constraint error anyway which we will catch globally.

    const newOrg = await organizationService.createOrganization(validatedData);

    res.status(201).json(new ApiResponse(201, newOrg, 'Organization created successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      throw new ApiError(400, 'Validation Error', zodError.issues);
    }
    throw error;
  }
});

export const getOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const orgs = await organizationService.getOrganizations();
  res.status(200).json(new ApiResponse(200, orgs, 'Organizations retrieved successfully'));
});

export const getOrganization = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.params.id as string;
  const org = await organizationService.getOrganizationById(orgId);
  
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }

  res.status(200).json(new ApiResponse(200, org, 'Organization retrieved successfully'));
});

import { Router } from 'express';
import { createEnquirySchema } from 'common';
import { authenticate, getUserId } from '@/middleware';
import {
  getPaginationMeta,
  paginationSchema,
  parse,
  sendSuccessResponse
} from '@/utils';
import { type ClaimEnquiryRequest } from './types';
import enquiryService from './service';

const enquiryRouter = Router();

/* POST /create - Create a new enquiry */
enquiryRouter.post(
  '/create',
  async function createEnquiry(req, res) {
    const body = parse(createEnquirySchema, req.body);
    const data = await enquiryService.create(body);
    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'Enquiry submitted',
      data
    });
  }
);

/* GET /list - List public enquiries */
enquiryRouter.get(
  '/list',
  authenticate,
  async function listPublicEnquiries(req, res) {
    const pagination = parse(paginationSchema, req.query);
    const { items, total } = await enquiryService.listOpenEnquiries(pagination);
    sendSuccessResponse(res, {
      message: 'Public enquiries',
      data: items,
      meta: getPaginationMeta(pagination, total)
    });
  }
);

/* PATCH /claim/:id - Assign a lead to the logged-in employee */
enquiryRouter.patch(
  '/claim/:id',
  authenticate,
  async function claimEnquiry(req: ClaimEnquiryRequest, res) {
    const data = await enquiryService.claim(req.params.id, getUserId(req));
    sendSuccessResponse(res, { message: 'Enquiry claimed', data });
  }
);

export { enquiryRouter };

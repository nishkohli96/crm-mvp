import type { Request } from 'express';

export type ClaimEnquiryParams = {
  id: string;
};

export type ClaimEnquiryRequest = Request<ClaimEnquiryParams>;

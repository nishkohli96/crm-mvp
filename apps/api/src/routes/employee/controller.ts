import { Router } from 'express';
import { loginSchema, registerSchema } from 'common';
import { authenticate, getUserId } from '@/middleware';
import {
  parse,
  getPaginationMeta,
  paginationSchema,
  sendSuccessResponse
} from '@/utils';
import employeeService from './service';
import type * as EmployeeTypes from './types';

const employeeRouter = Router();

/* POST /register - Register a new employee */
employeeRouter.post(
  '/register',
  async function registerEmployee(req: EmployeeTypes.SignupEmployeeRequest, res) {
    const body = parse(registerSchema, req.body);
    const data = await employeeService.register(body);
    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'Employee registered',
      data
    });
  }
);

/* POST /login - Login with email & password, returns a JWT */
employeeRouter.post(
  '/login',
  async function loginEmployee(req: EmployeeTypes.LoginEmployeeRequest, res) {
    const body = parse(loginSchema, req.body);
    const data = await employeeService.login(body);
    sendSuccessResponse(res, {
      message: 'Login successful',
      data
    });
  }
);

/* GET /claimed-enquiries - Leads claimed by the logged-in employee */
employeeRouter.get(
  '/claimed-enquiries',
  authenticate,
  async function listPrivateEnquiries(req, res) {
    const pagination = parse(paginationSchema, req.query);
    const { items, total } = await employeeService.listClaimedEnquiries(getUserId(req), pagination);
    sendSuccessResponse(res, {
      message: 'Your enquiries',
      data: items,
      meta: getPaginationMeta(pagination, total)
    });
  }
);

export { employeeRouter };

import { Router } from 'express';
import { loginSchema, registerSchema } from 'common';
import { parse, sendSuccessResponse } from '@/utils';
import employeeService from './service';

const employeeRouter = Router();

/* Register a counselor, open to anyone */
employeeRouter.post('/register', async function registerEmployee(req, res) {
  const body = parse(registerSchema, req.body);
  const data = await employeeService.register(body);
  sendSuccessResponse(res, { statusCode: 201, message: 'Employee registered', data });
});

/* Login with email & password, returns a JWT */
employeeRouter.post('/login', async function loginEmployee(req, res) {
  const body = parse(loginSchema, req.body);
  const data = await employeeService.login(body);
  sendSuccessResponse(res, { message: 'Login successful', data });
});

export { employeeRouter };

import type { Request } from 'express';
import type { LoginBody, RegisterBody } from 'common';

export type SignupEmployeeRequest = Request<object, object, RegisterBody>;
export type LoginEmployeeRequest = Request<object, object, LoginBody>;

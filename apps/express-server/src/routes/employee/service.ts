import bcrypt from 'bcryptjs';
import type { LoginBody, RegisterBody } from 'common';
import { prisma } from '@/db';
import { Prisma } from '@/generated/client';
import { HttpError, signToken } from '@/utils';

const BCRYPT_ROUNDS = 10;

class EmployeeService {
  async register({
    firstName,
    lastName,
    email,
    password
  }: RegisterBody) {
    try {
      const employee = await prisma.employee.create({
        data: {
          firstName,
          lastName,
          email,
          password: await bcrypt.hash(password, BCRYPT_ROUNDS)
        }
      });
      return employee;
    } catch (error) {
      /**
       * P2002 is Prisma’s error code for “unique constraint failed”.
       * It’s thrown when a create or update would put a duplicate value
       * into a column that must be unique (@unique, @@unique or @id).
       */
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === 'P2002'
      ) {
        throw new HttpError(409, 'Email is already registered');
      }
      throw error;
    }
  }

  async login({ email, password }: LoginBody) {
    const found = await prisma.employee.findUnique({
      where: { email },
      /**
       * The password field is globally omitted in the Prisma schema
       * to prevent it from being returned in any queries.
       * Path: apps/express-server/src/db/prisma.ts
       */
      omit: { password: false }
    });

    const invalid = new HttpError(401, 'Invalid email or password');
    if (!found) {
      throw invalid;
    }
    const { password: hash, ...employee } = found;
    if (!(await bcrypt.compare(password, hash))) {
      throw invalid;
    }
    return { employee, token: signToken(employee.id) };
  }
}

const employeeService = new EmployeeService();
export default employeeService;

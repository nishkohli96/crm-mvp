import bcrypt from 'bcryptjs';
import { prisma } from '@/db';
import { Prisma } from '@/generated/client';
import { HttpError, signToken } from '@/utils';
import type { LoginBody, RegisterBody } from './schema';

const BCRYPT_ROUNDS = 10;

class EmployeeService {
  async register({ name, email, password }: RegisterBody) {
    try {
      const employee = await prisma.employee.create({
        data: { name, email, password: await bcrypt.hash(password, BCRYPT_ROUNDS) }
      });
      return { employee, token: signToken(employee.id) };
    } catch (error) {
      /* The unique index on email is the source of truth, so no check-then-insert race */
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpError(409, 'Email is already registered');
      }
      throw error;
    }
  }

  async login({ email, password }: LoginBody) {
    const found = await prisma.employee.findUnique({
      where: { email },
      omit: { password: false }
    });
    /* Same message for an unknown email and a wrong password */
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

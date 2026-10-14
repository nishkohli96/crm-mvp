import { prisma } from '@/db';
import type { CreateEnquiryBody } from 'common';
import { Prisma } from '@/generated/client';
import { HttpError, type Pagination } from '@/utils';

class EnquiryService {
  create(data: CreateEnquiryBody) {
    return prisma.enquiry.create({ data });
  }

  /* Public = nobody has claimed it yet */
  listPublic(pagination: Pagination) {
    return this.list({ claimedBy: null }, pagination, { createdAt: 'desc' });
  }

  listPrivate(employeeId: string, pagination: Pagination) {
    return this.list({ claimedBy: employeeId }, pagination, { claimedAt: 'desc' });
  }

  /**
   * Single conditional statement, `UPDATE .. WHERE id = $1 AND claimed_by IS NULL
   * RETURNING *`, so of two concurrent claims only one matches a row. No
   * read-then-write.
   */
  async claim(id: string, employeeId: string) {
    try {
      return await prisma.enquiry.update({
        where: { id, claimedBy: null },
        data: { claimedBy: employeeId, claimedAt: new Date() }
      });
    } catch (error) {
      /* P2025: nothing matched. Either there is no such lead or it was already claimed */
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const exists = await prisma.enquiry.findUnique({ where: { id }, select: { id: true } });
        throw exists
          ? new HttpError(409, 'Enquiry is already claimed')
          : new HttpError(404, 'Enquiry not found');
      }
      throw error;
    }
  }

  private async list(
    where: Prisma.EnquiryWhereInput,
    { page, limit }: Pagination,
    orderBy: Prisma.EnquiryOrderByWithRelationInput
  ) {
    const [items, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        /* id as a tie-breaker, rows created together share a timestamp */
        orderBy: [orderBy, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.enquiry.count({ where })
    ]);
    return { items, total };
  }
}

const enquiryService = new EnquiryService();
export default enquiryService;

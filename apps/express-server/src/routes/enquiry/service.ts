import { prisma } from '@/db';
import type { CreateEnquiryBody } from 'common';
import { Prisma } from '@/generated/client';
import { HttpError, type Pagination } from '@/utils';

class EnquiryService {
  create(data: CreateEnquiryBody) {
    return prisma.enquiry.create({ data });
  }

  private async listEnquiries(
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

  listOpenEnquiries(pagination: Pagination) {
    return this.listEnquiries(
      { claimedBy: null },
      pagination,
      { createdAt: 'desc' }
    );
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === 'P2025'
      ) {
        const exists = await prisma.enquiry.findUnique({
          where: { id },
          select: { id: true },
        });
        throw exists
          ? new HttpError(409, 'Enquiry is already claimed')
          : new HttpError(404, 'Enquiry not found');
      }
      throw error;
    }
  }
}

const enquiryService = new EnquiryService();
export default enquiryService;

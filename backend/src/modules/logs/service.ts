import prisma from '../../lib/prisma';

interface LogsQueryFilters {
  module?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ClearLogsFilters {
  olderThanDays?: number;
  module?: string;
}

/**
 * Retrieves a paginated list of activity logs, filtered by module or search terms.
 */
export async function getLogsList(filters: LogsQueryFilters) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (filters.module && filters.module !== 'All') {
    whereClause.module = filters.module;
  }

  if (filters.search) {
    const searchTrimmed = filters.search.trim();
    whereClause.OR = [
      { action: { contains: searchTrimmed, mode: 'insensitive' } },
      { description: { contains: searchTrimmed, mode: 'insensitive' } },
      {
        admin: {
          OR: [
            { email: { contains: searchTrimmed, mode: 'insensitive' } },
            { fullName: { contains: searchTrimmed, mode: 'insensitive' } }
          ]
        }
      }
    ];
  }

  // Fetch logs and count in parallel
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: whereClause,
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.activityLog.count({
      where: whereClause
    })
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Clears activity logs based on optional age threshold (in days) and module filter.
 * If no filters are provided, all logs are deleted.
 */
export async function clearLogs(filters?: ClearLogsFilters) {
  const whereClause: any = {};

  if (filters?.olderThanDays && filters.olderThanDays > 0) {
    const cutoffDate = new Date(Date.now() - filters.olderThanDays * 24 * 60 * 60 * 1000);
    whereClause.createdAt = { lt: cutoffDate };
  }

  if (filters?.module && filters.module !== 'All') {
    whereClause.module = filters.module;
  }

  const result = await prisma.activityLog.deleteMany({
    where: whereClause
  });

  return {
    count: result.count
  };
}

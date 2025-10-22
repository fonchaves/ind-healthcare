import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global database module providing Prisma service and database management endpoints
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

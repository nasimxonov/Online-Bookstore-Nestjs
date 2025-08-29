import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SeederService } from './seeders/seeder.service';

@Global()
@Module({
  providers: [PrismaService, SeederService],
  exports: [PrismaService],
})
export class DatabaseModule {}

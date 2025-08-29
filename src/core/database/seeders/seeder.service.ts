import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async seedAll() {
    await this.seedUsers();
  }
  async seedUsers() {
    const username = this.configService.get('SUPERADMIN_USERNAME') as string;
    const email = this.configService.get('SUPERADMIN_EMAIL') as string;
    const password = this.configService.get('SUPERADMIN_PASSWORD') as string;
    const firstName = this.configService.get('SUPERADMIN_FIRSTNAME') as string;
    const lastName = this.configService.get('SUPERADMIN_LASTNAME') as string;
    const hashedPassword = await bcrypt.hash(password, 10);

    const findExistsAdmin = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!findExistsAdmin) {
      await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: Role.SUPER_ADMIN,
          firstName,
          lastName,
        },
      });
      this.logger.log('SUPERADMIN CREATED');
    } else {
      this.logger.warn('Superadmin existed');
    }
  }

  async onModuleInit() {
    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(error);
    }
  }
}

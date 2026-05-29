import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterUserDto) {
    const conflict = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])],
      },
    });
    if (conflict) throw new ConflictException('״§„״¨״±״¯ ״§„״¥„ƒ״×״±ˆ† ״£ˆ ״±‚… ״§„‡״§״× …״³״×״®״¯… ״¨״§„״¹„');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? UserRole.STUDENT,
      },
    });

    const verifyToken = randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        token: verifyToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    await this.emailService.sendVerificationEmail(
      user.email,
      user.firstName ?? '',
      `${frontendUrl}/verify-email?token=${verifyToken}`,
    );

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      ...tokens,
      user: this.safeUser(user),
    };
  }

  // SUPPLEMENT override: login by phone (not email)
  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('״±‚… ״§„‡״§״× ״£ˆ ƒ„…״© ״§„…״±ˆ״± ״÷״± ״µ״­״­״©');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('״±‚… ״§„‡״§״× ״£ˆ ƒ„…״© ״§„…״±ˆ״± ״÷״± ״µ״­״­״©');

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: this.safeUser(user) };
  }

  async googleLogin(googleUser: { email: string; firstName?: string; lastName?: string; googleId: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      const tempHash = await bcrypt.hash(randomBytes(16).toString('hex'), 12);
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          passwordHash: tempHash,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          isVerified: true,
          role: UserRole.STUDENT,
        },
      });
      await this.prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleUser.googleId,
        },
      });
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: this.safeUser(user) };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token ״÷״± ״µ״§„״­ ״£ˆ …†״×‡ ״§„״µ„״§״­״©');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.generateTokens(user.id, user.email, user.role);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const record = await this.prisma.verificationToken.findUnique({ where: { token: dto.token } });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('״±…״² ״§„״×״­‚‚ ״÷״± ״µ״§„״­ ״£ˆ …†״×‡ ״§„״µ„״§״­״©');
    }
    await this.prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } });
    await this.prisma.verificationToken.delete({ where: { id: record.id } });
    return { message: '״×… ״§„״×״­‚‚ …† ״§„״¨״±״¯ ״§„״¥„ƒ״×״±ˆ† ״¨†״¬״§״­' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Always return same message to prevent email enumeration
    if (!user) return { message: '״¥״°״§ ƒ״§† ״§„״¨״±״¯ ״§„״¥„ƒ״×״±ˆ† …ˆ״¬ˆ״¯״§‹״ ״³״×״×„‚‰ ״±״§״¨״· ״¥״¹״§״¯״© ״×״¹† ƒ„…״© ״§„…״±ˆ״±' };

    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const resetToken = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.firstName ?? '',
      `${frontendUrl}/reset-password?token=${resetToken}`,
    );

    return { message: '״¥״°״§ ƒ״§† ״§„״¨״±״¯ ״§„״¥„ƒ״×״±ˆ† …ˆ״¬ˆ״¯״§‹״ ״³״×״×„‚‰ ״±״§״¨״· ״¥״¹״§״¯״© ״×״¹† ƒ„…״© ״§„…״±ˆ״±' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token: dto.token } });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('״±…״² ״¥״¹״§״¯״© ״§„״×״¹† ״÷״± ״µ״§„״­ ״£ˆ …†״×‡ ״§„״µ„״§״­״©');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await this.prisma.passwordResetToken.delete({ where: { id: record.id } });
    await this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } });

    return { message: '״×… ״¥״¹״§״¯״© ״×״¹† ƒ„…״© ״§„…״±ˆ״± ״¨†״¬״§״­' };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    return { message: '״×… ״×״³״¬„ ״§„״®״±ˆ״¬ ״¨†״¬״§״­' };
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
    const jwtSecret = this.configService.get<string>('JWT_SECRET') ?? 'supersecretjwtkey';

    const access_token = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') ?? '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: jwtSecret + '-refresh',
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') ?? '7d',
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.refreshToken.create({
      data: {
        token: refresh_token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token, refresh_token };
  }

  private safeUser(user: { id: string; email: string; phone?: string | null; firstName?: string | null; lastName?: string | null; role: UserRole; isVerified: boolean }) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
    };
  }
}

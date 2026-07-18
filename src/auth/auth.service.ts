import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async adminLogin(passcode: string): Promise<{ accessToken: string }> {
    const adminPasscode = this.configService.get<string>('ADMIN_PASSCODE');

    if (passcode !== adminPasscode) {
      throw new UnauthorizedException('Invalid passcode');
    }

    const payload = { role: 'admin', sub: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async sendOtp(phone: string): Promise<{ message: string; expiresIn: number }> {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete old OTPs for this phone
    await this.prisma.otp.deleteMany({ where: { phone } });

    // Create new OTP
    await this.prisma.otp.create({
      data: { phone, code, expiresAt },
    });

    // In production, send SMS via Twilio/MSG91/etc
    // For dev, log to console
    console.log(`[OTP] ${phone}: ${code}`);

    return { message: 'OTP sent successfully', expiresIn: 300 };
  }

  async verifyOtp(phone: string, code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; phone: string; name: string | null; accountType: AccountType | null; isNewUser: boolean };
  }> {
    const testOtpCode =
      this.configService.get<string>('TEST_OTP_CODE')?.trim() || '000000';
    const allowTestOtp = ['1', 'true', 'yes', 'on'].includes(
      (this.configService.get<string>('ALLOW_TEST_OTP') || '').toLowerCase(),
    );
    const isTestOtpCode =
      (process.env.NODE_ENV === 'development' || allowTestOtp) &&
      code === testOtpCode;

    if (!isTestOtpCode) {
      const otp = await this.prisma.otp.findFirst({
        where: {
          phone,
          code,
          verified: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!otp) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Mark OTP as verified
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { verified: true },
      });
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone },
      });
      isNewUser = true;
    }

    // Generate tokens
    const payload = { sub: user.id, phone: user.phone, role: 'user' };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        accountType: user.accountType,
        isNewUser,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        accountType: true,
        addresses: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; accountType?: AccountType }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        accountType: true,
        addresses: true,
      },
    });
  }

  validateToken(token: string): { role: string; sub: string } | null {
    try {
      return this.jwtService.verify(token) as { role: string; sub: string };
    } catch {
      return null;
    }
  }
}

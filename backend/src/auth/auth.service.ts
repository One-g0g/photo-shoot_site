import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthResponse } from './auth.types';
import { toPublicUser } from './auth.mapper';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const role = dto.role ?? 'client';

    this.logger.log(
      `Регистрация: запрос — email=${email}, name=${dto.name.trim()}, role=${role}`,
    );

    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      this.logger.warn(`Регистрация: отклонена — email уже занят (${email})`);
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email,
      passwordHash,
      role: dto.role,
    });

    this.logger.log(
      `Регистрация: успех — id=${user.id}, email=${user.email}, role=${user.role}`,
    );

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    this.logger.log(`Вход: запрос — email=${email}`);

    const user = await this.usersService.findByEmail(email);

    if (!user?.passwordHash) {
      this.logger.warn(`Вход: отклонён — пользователь не найден (${email})`);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      this.logger.warn(`Вход: отклонён — неверный пароль (${email})`);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    this.logger.log(
      `Вход: успех — id=${user.id}, email=${user.email}, role=${user.role}`,
    );

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): AuthResponse {
    const publicUser = toPublicUser(user);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { user: publicUser, accessToken };
  }
}

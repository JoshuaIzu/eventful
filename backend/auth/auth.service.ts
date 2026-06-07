import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from './user-repository.interface';
import { ISignupDTO, ILoginDTO, IAuthResponse, UserRole } from "../types";
import {Redis} from "ioredis";
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
    private readonly jwtSecret: string;
    private readonly workerFactor = 12;

    constructor(private readonly userRepo: IUserRepository, private readonly cache: Redis) {
        const secret = process.env.JWT_SECRET;
        if(!secret) {
            throw new Error('JWT_SECRET variable is required');
        }
        this.jwtSecret = secret;
    }


    public async register(dto: ISignupDTO): Promise<IAuthResponse> {
        const existing = await this.userRepo.findByEmail(dto.email);
        if (existing) {
            throw new Error('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(dto.password, this.workerFactor);
        const user = await this.userRepo.create({
            email: dto.email,
            passwordHash,
            role: dto.role,
        });

        const token = this.mintToken(user.id, user.email, user.role);

        return {
           user: {
             id: user.id,
             email: user.email,
             role: user.role,
             createdAt: user.createdAt,
            },
            token,
        };
    }


    public async authenticate(dto: ILoginDTO): Promise<IAuthResponse> {
        const user = await this.userRepo.findByEmail(dto.email);
        if(!user) {
            throw new Error('Invalid_Credentials');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash)
        if(!valid) {
            throw new Error('Invalid_Credentials');
        }

        const token = this.mintToken(user.id, user.email, user.role);

        return {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          token,
        };
      }

      public async blacklistToken(jti: string, remainingSeconds: number): Promise<void> {
          await this.cache.set(`blacklist:${jti}`, '1', 'EX', Math.ceil(remainingSeconds * 1.2));
      }

      public async isBlackListed(jti: string): Promise<boolean> {
        const result = await this.cache.get(`blacklist:${jti}`);
        return result !== null;
      }

       private mintToken(id: string, email: string, role: UserRole): string {
        return jwt.sign({ sub: id, email, role, jti: uuidv4() }, this.jwtSecret, { expiresIn: '24h' });
      }


}

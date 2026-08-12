import { PrismaClient } from '@prisma/client';
import { IUserRepository, IResetPasswordRepository } from './user-repository.interface';
import { IUser, ICreateUserParams, UserRole } from "../types";

export class UserRepository implements IUserRepository, IResetPasswordRepository {
    constructor(private readonly db: PrismaClient) {}

    public async findByEmail(email: string): Promise<IUser | null> {
        const record = await this.db.user.findUnique({ where: { email } })
        if (!record) return null;
        return this.mapToUser(record);
    }

    public async findById(id: string): Promise<IUser | null> {
        const record = await this.db.user.findUnique({ where: { id }})
        if (!record) return null;
        return this.mapToUser(record);
    }

    public async create(data: ICreateUserParams): Promise<IUser> {
        const user = await this.db.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role,
            },
        });
        return this.mapToUser(user)
    }

   public async findByResetToken(token: string): Promise<IUser | null> {
        const record = await this.db.user.findFirst({
          where: {
            resetToken: token,
            resetTokenExpiresAt: { gt: new Date() }
          }
        })
        if (!record) return null;
        return this.mapToUser(record);
    }


   public async updateResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
        await this.db.user.update({
            where: { id: userId },
            data: { resetToken: token, resetTokenExpiresAt: expiresAt }
        });
    }

   public async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
        await this.db.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash }
        });
    }
   public async clearResetToken(userId: string): Promise<void> {
        await this.db.user.update({
           where: { id: userId },
           data: { resetToken: null, resetTokenExpiresAt: null}
       })
   }

    private mapToUser(record: {
        id: string;
        email: string;
        passwordHash: string;
        role: string;
        createdAt: Date;
    }): IUser {
        return {
            id: record.id,
            email: record.email,
            passwordHash: record.passwordHash,
            role: record.role as UserRole,
            createdAt: record.createdAt,
        };
    }
}
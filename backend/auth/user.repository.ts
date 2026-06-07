import { PrismaClient } from '@prisma/client';
import { IUserRepository } from './user-repository.interface';
import { IUser, ICreateUserParams, UserRole } from "../types";

export class UserRepository implements IUserRepository {
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
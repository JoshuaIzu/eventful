import { IUser, ICreateUserParams } from '../types';

export interface IUserRepository {
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    create(data: ICreateUserParams): Promise<IUser>;
}

export interface IResetPasswordRepository extends IUserRepository {
    findByResetToken(token: string): Promise<IUser | null>;
    updateResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
    updatePassword(userId: string, newPasswordHash: string): Promise<void>;
    clearResetToken(userId: string): Promise<void>;
}
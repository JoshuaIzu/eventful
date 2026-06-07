import { IUser, ICreateUserParams } from '../types';

export interface IUserRepository {
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    create(data: ICreateUserParams): Promise<IUser>;
}
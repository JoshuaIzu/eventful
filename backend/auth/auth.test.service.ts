import 'dotenv/config'
process.env.JWT_SECRET = 'test-secret'
import { AuthService } from './auth.service';
import { IUserRepository } from './user-repository.interface';
import { ISignupDTO, ILoginDTO } from '../types';
import bcrypt  from 'bcrypt'


describe('AuthService', ()=> {
    let authService: AuthService;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockRedis: any;

    beforeEach(() => {
        mockUserRepository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
        };
        mockRedis = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            expire: jest.fn(),
        };
        authService = new AuthService(mockUserRepository, mockRedis);
    });

    describe('register', () => {
        it('new creator can register and receive auth token', async ()=> {
            const dto: ISignupDTO = {
                email: 'creator@sasquash.ng',
                password: 'StrongPass123!',
                role: 'CREATOR',
            };
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue({
                id: 'usr_777',
                email: 'creator@sasquash.ng',
                passwordHash: '$2b$12$hashedvalue',
                role: 'CREATOR',
                createdAt: new Date(),
            });

            const result = await authService.register(dto);

            expect(result.user.email).toBe('creator@sasquash.ng');
            expect(result.token).toBeDefined();
            expect(typeof result.token).toBe('string');
            expect(result.user).not.toHaveProperty('passwordHash')
        });

        it('registration rejects duplicate emails', async ()=> {
            const dto: ISignupDTO = {
                email: 'existing@sasquash.ng',
                password: 'StrongPass123!',
                role: 'EVENTEE',
            };

            mockUserRepository.findByEmail.mockResolvedValue({
                id: 'usr_111',
                email: 'existing@sasquash.ng',
                passwordHash: '$2b$12$somehash',
                role: 'EVENTEE',
                createdAt: new Date(),
            });

            await expect(authService.register(dto)).rejects.toThrow('User with this email already exists');
        });
    });
    describe('authenticate', () =>{
        it('eventee can login with valid credentials and receive token', async () =>{
            const dto: ILoginDTO = {
                email: 'eventee@sasquash.ng',
                password: 'StrongPass123!',
            };

            mockUserRepository.findByEmail.mockResolvedValue({
                id: 'usr_888',
                email: 'eventee@sasquash.ng',
                passwordHash: await bcrypt.hash('StrongPass123!', 12),
                role: 'EVENTEE',
                createdAt: new Date(),
            });

            const result = await  authService.authenticate(dto);

             expect(result.user.email).toBe('eventee@sasquash.ng');
             expect(result.user.role).toBe('EVENTEE');
             expect(result.token).toBeDefined();
             expect(typeof result.token).toBe('string');
             expect(result.user).not.toHaveProperty('passwordHash');
        });
        it('login rejects non-existent email', async () => {
          const dto: ILoginDTO = {
            email: 'nobody@sasquash.ng',
            password: 'StrongPass123!',
          };

          mockUserRepository.findByEmail.mockResolvedValue(null);
          await expect(authService.authenticate(dto)).rejects.toThrow('Invalid_Credentials');
        });
        it('login rejects wrong password', async () => {
            const dto: ILoginDTO = {
                email: 'eventee@eventful.ng',
                password: 'WrongPassword!',
            };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'usr_888',
        email: 'eventee@eventful.ng',
        passwordHash: await bcrypt.hash('StrongPass123!', 12),
        role: 'EVENTEE',
        createdAt: new Date(),
      });

      await expect(authService.authenticate(dto)).rejects.toThrow('Invalid_Credentials');
    });
  });
})
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { IResetPasswordRepository } from './user-repository.interface';
import { IEmailService } from "../queue/services/email.service";

export class ResetPasswordService {
    private readonly workerFactor = 12;

    constructor(private readonly userRepo: IResetPasswordRepository, private readonly emailService: IEmailService) {}

    public async requestPasswordReset(email: string): Promise<void>{
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            return;
        }

        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        try {
            await this.emailService.sendPasswordReset({ to: user.email, resetToken });
            await this.userRepo.updateResetToken(user.id, resetToken, expiresAt);
        } catch (err) {
            console.error('[reset-password]Failed to send password reset email:', err);
        }
    }

    public async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await this.userRepo.findByResetToken(token);
        if(!user) {
            throw new Error('Invalid or expired reset token');
        }
        const passwordHash = await bcrypt.hash(newPassword.trim(), this.workerFactor);
        await this.userRepo.updatePassword(user.id, passwordHash);
        await this.userRepo.clearResetToken(user.id);
    }
}
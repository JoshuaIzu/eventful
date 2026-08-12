import { Job } from 'bullmq';
import { IEmailService, IPasswordResetEmail } from '../services/email.service';
import { JOB_NAMES } from '../job.names';

export interface ISendPasswordResetJobData {
  to: string;
  resetToken: string;
}

export const SEND_PASSWORD_RESET_JOB_NAME = JOB_NAMES.SEND_PASSWORD_RESET;

export function createSendPasswordResetProcessor(emailService: IEmailService) {
  return async (job: Job<ISendPasswordResetJobData>): Promise<void> => {
    const passwordReset: IPasswordResetEmail = {
      to: job.data.to,
      resetToken: job.data.resetToken,
    };
    await emailService.sendPasswordReset(passwordReset);
  };
}

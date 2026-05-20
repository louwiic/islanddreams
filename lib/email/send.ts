import { sendResendEmail } from './resend';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail(options: EmailOptions) {
  return sendResendEmail(options);
}

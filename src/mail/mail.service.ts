import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendVerificationEmail(email: string, firstName: string, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.send(email, 'Verify Your Email - GadTech Store', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#e63946">Welcome to GadTech Store, ${firstName}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${url}" style="background:#e63946;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0">Verify Email</a>
        <p>This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `);
  }

  async sendPasswordResetEmail(email: string, firstName: string, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.send(email, 'Reset Your Password - GadTech Store', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#e63946">Password Reset Request</h2>
        <p>Hi ${firstName}, we received a request to reset your password.</p>
        <a href="${url}" style="background:#e63946;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0">Reset Password</a>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `);
  }

  async sendOrderConfirmation(email: string, firstName: string, orderNumber: string, total: string) {
    await this.send(email, `Order Confirmed #${orderNumber} - GadTech Store`, `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#e63946">Order Confirmed!</h2>
        <p>Hi ${firstName}, your order <strong>#${orderNumber}</strong> has been confirmed.</p>
        <p><strong>Total: GHS ${total}</strong></p>
        <p>We'll send you another email when your order ships.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/orders/${orderNumber}"
           style="background:#e63946;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0">
          Track Order
        </a>
      </div>
    `);
  }

  async sendOrderStatusUpdate(email: string, firstName: string, orderNumber: string, status: string) {
    await this.send(email, `Order Update #${orderNumber} - GadTech Store`, `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#e63946">Order Status Update</h2>
        <p>Hi ${firstName}, your order <strong>#${orderNumber}</strong> status is now: <strong>${status}</strong>.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/orders/${orderNumber}"
           style="background:#e63946;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0">
          View Order
        </a>
      </div>
    `);
  }
}

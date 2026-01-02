import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: `"Auth Service" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Your verification code',
        text: `Your verification code: ${code}`,
      });
    } catch (err) {
      console.error('MAIL ERROR:', err);
      throw new InternalServerErrorException('Email send failed');
    }
  }
}

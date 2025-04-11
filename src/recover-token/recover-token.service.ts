import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RecoverToken, Usuario } from '@prisma/client';
import { Transporter, createTransport } from 'nodemailer';

import Mail from 'nodemailer/lib/mailer';
import { PrismaService } from 'src/prisma/prisma.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class RecoverTokenService {
  private transporter: Transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    } as SMTPTransport.Options);
  }

  async createToken(payload: Partial<RecoverToken>) {
    return await this.prisma.recoverToken.create({
      data: {
        usuario_id: payload.usuario_id,
        token: payload.token,
        expireIn: payload.expireIn,
      },
    });
  }

  async sendRecoverEmail(
    url: string,
    email: Usuario['email'],
    token: RecoverToken['token'],
  ) {
    const options: Mail.Options = {
      from: `Gianluca Bredice Developer <${process.env.SMPT_USER}>`,
      to: email,
      subject: 'Recuperar contraseña | PulveSys',
      html: `
            <div style="display: block; padding: 8px">
                <p>Recuperá tu contraseña ingresando al siguiente link: ${url}/auth/recuperar?token=${token}</p>
            </div>
      `,
    };

    try {
      await this.transporter.verify();
      return await this.transporter.sendMail(options);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(
        'Se produjo un error al enviar el email.',
      );
    }
  }

  async findOne(token: string) {
    return await this.prisma.recoverToken.findUnique({ where: { token } });
  }

  async deleteByToken(token: RecoverToken['token']) {
    return await this.prisma.recoverToken.delete({ where: { token } });
  }
}

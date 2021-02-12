// file deepcode ignore object-literal-shorthand: temporary
// file deepcode ignore no-any: temporary
import { BasicService } from '@backapirest/express';
import { PersistenceInput, PersistencePromise } from 'flexiblepersistence';
import nodemailer from 'nodemailer';

export default class EmailService extends BasicService {
  async sendEmail(transporter, content): Promise<any> {
    const message = await transporter.sendMail(content);
    console.log('Message sent: %s', message.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
    return message;
  }

  async send(content, info?) {
    try {
      if (process.env.IS_FAKE) {
        const account = await nodemailer.createTestAccount();
        info = {
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        };
        console.log(info);

        this.sendEmail(nodemailer.createTransport(info), content);
      } else {
        this.sendEmail(nodemailer.createTransport(info), content);
      }
    } catch (error) {
      console.error(error);
    }
  }

  generateEmail(user?: string, sufix?: string): string {
    // console.log(user);
    const aSufix = user && user.includes('@') ? '' : sufix;

    return '' + user + aSufix;
  }

  generateRecoverUrl(token: string, url?: string): string {
    const aUrl = '' + url + '?token=' + token;
    return aUrl;
  }

  generateVerificationUrl(token: string, id?: string, url?: string): string {
    const aUrl = '' + url + '/' + id + '?token=' + token;
    return aUrl;
  }

  async sendInfo(info: {
    name: string;
    email: string;
    text?: string;
    html?: string;
    service: {
      name?: string;
      email?: string;
      service?: string;
      username?: string;
      password?: string;
    };
    subject?: string;
  }): Promise<any> {
    const content = {
      from: {
        name: info.service.name
          ? info.service.name
          : await this.journaly?.publish(
              'AuthenticationService.getServiceName'
            ),
        address: info.service.email
          ? info.service.email
          : this.generateEmail(process.env.MAIL_USER, process.env.MAIL_SUFIX),
      },
      to: {
        name: info.name,
        address: info.email,
      },
      subject: info.subject,
      text: info.text,
      html: info.html,
    };

    const emailInfo = {
      service: info.service.service
        ? info.service.service
        : process.env.MAIL_SERVICE,
      auth: {
        user: info.service.username
          ? info.service.username
          : process.env.MAIL_USER,
        pass: info.service.password
          ? info.service.password
          : process.env.MAIL_PASSWORD,
      },
    };
    return this.send(content, emailInfo);
  }

  async sendRecover(recoverInfo: {
    name: string;
    email: string;
    token: string;
    service: {
      url: string;
      name?: string;
      email?: string;
      service?: string;
      username?: string;
      password?: string;
    };
    language?: string;
  }): Promise<any> {
    const language = recoverInfo.language || process.env.LANGUAGE || '';
    const subject = language.includes('en')
      ? 'Recover Password'
      : 'Recuperação de Senha';
    return this.sendInfo({
      name: recoverInfo.name,
      email: recoverInfo.email,
      text: this.generateRecoverUrl(recoverInfo.token, recoverInfo.service.url),
      service: recoverInfo.service,
      subject: subject,
    });
  }

  sendVerification(verificationInfo: {
    name: string;
    email: string;
    token: string;
    id: string;
    service: {
      url: string;
      name?: string;
      email?: string;
      service?: string;
      username?: string;
      password?: string;
    };
    language?: string;
  }): Promise<any> {
    const language = verificationInfo.language || process.env.LANGUAGE || '';
    const subject = language.includes('en')
      ? 'Email Verification'
      : 'Verificação de Email';
    return this.sendInfo({
      name: verificationInfo.name,
      email: verificationInfo.email,
      text: this.generateVerificationUrl(
        verificationInfo.token,
        verificationInfo.id,
        verificationInfo.service.url
      ),
      service: verificationInfo.service,
      subject: subject,
    });
  }

  //! verify email needs id
  async read(input: PersistenceInput<any>): Promise<PersistencePromise<any>> {
    // timeout de checagem se a conta foi verificada.
    return new Promise(async (resolve) => {
      resolve({
        receivedItem: input.item,
        result: input.item,
        selectedItem: input.selectedItem,
        sentItem: input.item,
      });
    });
  }

  //! send email
  async create(input: PersistenceInput<any>): Promise<PersistencePromise<any>> {
    return new Promise(async (resolve) => {
      resolve({
        receivedItem: input.item,
        result: input.item,
        selectedItem: input.selectedItem,
        sentItem: input.item,
      });
    });
  }
}

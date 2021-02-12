// file deepcode ignore object-literal-shorthand: temporary
// file deepcode ignore no-any: temporary
import { BasicService } from '@backapirest/express';
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

  //! verify email
  async read(input) {
    // input: {
    //   single: true,
    //   scheme: 'Email',
    //   id: '601ab5794263c93a0c5fa7ed',
    //   selectedItem: {
    //     token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJnaXZlbk5hbWUiOiJTb21lIiwiZmFtaWx5TmFtZSI6Ik9uZSIsInBlcm1pc3Npb25zIjp7ImF1dGgiOnsiRW1haWwiOlsicmVhZCJdfX0sImlkIjoiNjAxYWI1Nzk0MjYzYzkzYTBjNWZhN2VkIiwiX2lkIjoiNjAxYWI1Nzk0MjYzYzkzYTBjNWZhN2VkIiwiaWRlbnRpZmljYXRpb24iOiJqdWRhaGhvbGFuZGE3OEBnbWFpbC5jb20iLCJ0eXBlIjoiTE9DQUwiLCJpYXQiOjE2MTIzNjMxMjksImV4cCI6MTYxMjM2NDAyOX0.Au_XNHyZvp-vYxi7I6XPohPZxpRIy7Gq1oLUYHb5yVs44SgBxMWDgtIFiY6sS_Qc3RuT6dlnN9GXrvNu1iKCNTCS6NjHkvb8UneAPmIVHMk7Yp38VvCEQ8eV4fIxEA9bUVtRE6IxFZtYzjRuiccAa77AM7MTAKlzKm7St-FMd5H6Oex2KMrMnLVHDf_Mra7rxwhXD_l2ispA1i5qF3LaAPxOe9hkkG3lU1VfN9lI1guaMF609mouOhBfUpmd2U5vacu4EJ3hvWOyeHMM4wmLSmV170A0TvwIEseL-R8dun2tAiJUExFswU87U0OBYDoW0A2g7rQHvqxX0QsWBrCrCA',
    //     id: '601ab5794263c93a0c5fa7ed'
    //   },
    //   item: {},
    //   eventOptions: {
    //     host: 'localhost:3000',
    //     'user-agent': 'insomnia/2020.5.2',
    //     'content-type': 'application/json',
    //     accept: '*/*',
    //     'content-length': '0'
    //   }
    // }
    const subScheme = 'Person';
    const method = 'update';
    const token = JSON.parse(JSON.stringify(input.selectedItem.token));
    const auth = await this.journaly?.publish(
      'AuthenticationService.authentication',
      token
    );
    // console.log(auth);
    const identification = {
      identification: auth.identification,
      type: auth.type,
    };
    // console.log(identification);
    const newSubInput = {
      single: true,
      selectedItem: {
        identifications: {
          $elemMatch: identification,
        },
        'identifications.type': identification.type,
        'identifications.identification': identification.identification,
      },
      item: {
        $set: {
          'identifications.$.unverified': false,
        },
      },
    };
    // console.log(newSubInput);

    const person: any = await this.journaly?.publish(
      subScheme + 'Service.' + method,
      newSubInput
    );
    // console.log(person.receivedItem);
    await this.journaly?.publish('PersonService.removeKeys', person);
    return person;
  }
}

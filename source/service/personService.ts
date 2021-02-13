/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
// file deepcode ignore no-any: temporary
// file deepcode ignore object-literal-shorthand: temporary
import { BasicService } from '@backapirest/express';
import { PersistenceInput, PersistencePromise } from 'flexiblepersistence';
import { default as email } from '../config/email.json';

export default class PersonService extends BasicService {
  private resetScheme(input) {
    input.scheme = this.getName().replace('DAO', '');
  }
  private async reset(input) {
    this.resetScheme(input);
  }

  async deleteSponsoredAccount(sponsorId: string) {
    const subScheme = 'Person';
    const newSubInput = {
      single: false,
      scheme: subScheme,
      selectedItem: {
        sponsorId: sponsorId,
      },
    };

    // console.log('delete:', newSubInput);
    this.delete(newSubInput);
  }

  async deleteIdentification(personId, identification) {
    const newSubInput = {
      single: true,
      selectedItem: {
        id: personId,
      },
      item: { $pull: { identifications: { id: identification.id } } },
    };
    // console.log('delete identification:', newSubInput);
    this.update(newSubInput);
  }

  async deleteUnverified(identification) {
    // console.log('delete:', identification);
    if (!identification) {
      return;
    }
    const subScheme = 'Person';

    // console.log('identification:', identification);

    const tIdentification = JSON.parse(JSON.stringify(identification));
    delete tIdentification.key;
    delete tIdentification.id;
    delete tIdentification.unverified;

    const newSubInput = {
      single: true,
      scheme: subScheme,
      selectedItem: {
        identifications: { $elemMatch: tIdentification },
      },
    };

    const person: any = await this.read(newSubInput);

    if (!person.receivedItem) {
      return;
    }
    const rPerson = JSON.parse(JSON.stringify(person.receivedItem));
    // const rePerson = JSON.parse(JSON.stringify(person.result));
    // console.log(rePerson);
    for (const existentIdentification of rPerson.identifications) {
      if (
        identification.type === existentIdentification.type &&
        identification.identification ===
          existentIdentification.identification &&
        existentIdentification.unverified
      ) {
        // console.log(rPerson);

        if (rPerson.identifications.length === 1) {
          this.delete({ id: rPerson.id, scheme: subScheme });
        } else {
          this.deleteIdentification(rPerson.id, identification);
        }
      }
    }
  }

  async sendVerification(
    input: PersistenceInput<any>,
    identification
  ): Promise<void> {
    return new Promise(async () => {
      //! send email do verify
      if (identification.type === 'LOCAL') {
        const cleanPerson = JSON.parse(
          JSON.stringify(
            input.item['$setOnInsert'] ? input.item['$setOnInsert'] : input.item
          )
        );
        // console.log(cleanPerson);
        delete cleanPerson.instances;
        delete cleanPerson.identifications;
        cleanPerson.identification = identification.identification;
        cleanPerson.type = identification.type;
        cleanPerson.permissions = { auth: { Email: ['read'] } };
        // console.log('this.journaly:', this.journaly);
        const key = await this.journaly?.publish('SignInService.key');
        // console.log('key:', key);
        const token = await this.journaly?.publish(
          'JsonWebTokenService.sign',
          cleanPerson,
          key,
          input.item.type
        );
        // console.log('token:', token);
        const service = input.item.service;
        const info = {
          name: cleanPerson.givenName,
          email: cleanPerson.identification,
          token: token,
          id: cleanPerson.id,
          service: service,
          language: input.item.language,
        };

        if (!info.service) info.service = {};
        info.service.url =
          (info.service.url
            ? info.service.url
            : input.eventOptions
            ? input.eventOptions.host
            : 'localhost') + process.env.EMAIL_PATH;

        // console.log(info);

        //! send email with token and url (async) with axios
        this.journaly?.publish('EmailService.sendVerification', info);
      }
    });
  }

  async programUnverified(identification, index: number): Promise<void> {
    return new Promise(async () => {
      setTimeout(
        () => {
          this.deleteUnverified(identification);
        },
        process.env.MAIL_TIMEOUT && process.env.MAIL_JITTER
          ? +process.env.MAIL_TIMEOUT + +process.env.MAIL_JITTER * index
          : email.verificationTimeout + email.verificationJitter * index
      );
    });
  }

  async checkUnverified(input: PersistenceInput<any>): Promise<void> {
    return new Promise(async () => {
      const identifications = input.item['$setOnInsert']
        ? input.item['$setOnInsert'].identifications
        : input.item.identifications;
      // console.log('deleteUnverified');

      if (identifications)
        for (let index = 0; index < identifications.length; index++) {
          const identification = identifications[index];
          // console.log('deleteUnverified id: ', identification);

          this.sendVerification(input, identification);
          if (identification.unverified) {
            this.programUnverified(identification, index);
          }
        }
    });
  }
  async read(input: PersistenceInput<any>): Promise<PersistencePromise<any>> {
    // console.log('read');
    // console.log(input);
    this.resetScheme(input);
    // console.log(input);
    return super.read(input);
  }
  async update(input): Promise<PersistencePromise<any>> {
    //! check new identification (LOCAL mainly)
    await this.reset(input);
    return super.update(input);
  }
  async delete(input: PersistenceInput<any>): Promise<PersistencePromise<any>> {
    this.resetScheme(input);
    // console.log('delete:', newSubInput);
    const returned = (await super.delete(input)) as PersistencePromise<any>;
    if (returned && returned.receivedItem && returned.receivedItem.id)
      this.deleteSponsoredAccount(returned.receivedItem.id);
    return returned;
  }
}

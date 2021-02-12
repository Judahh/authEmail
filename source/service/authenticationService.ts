// file deepcode ignore no-any: any needed
import { BasicService } from '@backapirest/express';

export default class AuthenticationService extends BasicService {
  authentication(key): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (key === process.env.Key) resolve(true);
      else {
        const error = new Error('Unauthorized.');
        error.name = 'Unauthorized';
        reject(error);
      }
    });
  }

  getInstance() {
    return process.env.INSTANCE || 'authEmail';
  }

  getServiceName() {
    return process.env.SERVICE_NAME || 'AUTHEMAIL';
  }
}

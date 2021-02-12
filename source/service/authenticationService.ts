// file deepcode ignore no-any: any needed
import { BasicService } from '@backapirest/express';
import { Operation } from 'flexiblepersistence';

export default class AuthenticationService extends BasicService {
  key() {
    return (
      process.env.JWT_PUBLIC_KEY ||
      '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3POpb9/1PwBK9A3vBfXX\nTJuGhTMy8CreeFXEM19/WB6bLqhIXE7IzH40KNnfWnQn1twMshViJBN9eHAiYErn\nF5dJrzjWtIp9xrFhmquYvz/2RyeVflWXH/ZmfO1v15nF7tKjN3+WTM4rAY9wGssl\nGahvs6ET0rp2PG0PLJXXEvYNxHp1OpP21xrWepb3RXCxlCqARq//UNENgFyazpsx\n9Q/V15xvlmUT74mYOGMMEhy/Xw71SEMr/rOElXj2cGZ65fgeBl+vi7Fj/0Z7jk23\nKa4iuaXxElys8cieok77KJrhwFoRae4cJgjY86SfYgipc5PwepOtu1S5k3NRtIEV\nAQIDAQAB\n-----END PUBLIC KEY-----\n'
    );
  }

  authentication(token): Promise<any> {
    // console.log(token);
    return new Promise(async (resolve, reject) => {
      try {
        const permission = await this.journaly?.publish(
          'JsonWebTokenService.verify',
          token,
          this.key()
        );

        // console.log('permission:', permission);

        resolve(permission);

        //! TODO: check permissions
      } catch (error) {
        reject(error);
      }
    });
  }

  getInstance() {
    return process.env.INSTANCE || 'auth';
  }

  getServiceName() {
    return process.env.SERVICE_NAME || 'AUTH';
  }

  permission(event, permissions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        //! TODO: change auth to auth instance
        // console.log('permissions:', permissions);
        // console.log('event:', event);
        const instanceName = this.getInstance();
        const instance = permissions['all'] || permissions[instanceName];
        // console.log('instance:', instance);
        if (instance) {
          const service = instance['all'] || instance[event.name];
          // console.log('service:', service);
          if (service) {
            const operationName = Operation[event.operation];
            // console.log('operationName:', operationName);
            const operation =
              service.includes('all') || service.includes(operationName);
            // console.log('operation:', operation);
            if (operation) resolve(true);
          }
        }
        const error = new Error('Unauthorized');
        error.name = 'Unauthorized';
        reject(error);
      } catch (error) {
        reject(error);
      }
    });
  }
}

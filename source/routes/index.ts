import EmailRouter from './emailRouter';

// import dBHandler from '../dBHandler';
// import getConfig from 'next/config';
// const config = getConfig();
// console.log('config:', config);

import Authentication from '../middleware/authentication';

import { RouterSingleton, RouterInitializer } from '@backapirest/express';

import Helmet from 'helmet';
import Limit from 'express-rate-limit';

import { default as limitConfig } from '../config/limit.json';

// Initializing the limit middleware
const limit = Limit(limitConfig);

class Index extends RouterSingleton {
  createRoutes(initDefault?: RouterInitializer): void {
    // console.log('New ROUTES');
    if (initDefault) {
      const routes = this.getRoutes();
      if (!initDefault.middlewares || initDefault.middlewares.length > 0)
        initDefault.middlewares = [];
      initDefault.middlewares.push(Helmet());
      initDefault.middlewares.push(limit);

      const authentication = new Authentication(initDefault);
      initDefault.middlewares.push(
        authentication.authentication.bind(authentication)
      );
      initDefault.middlewares.push(
        authentication.permission.bind(authentication)
      );

      EmailRouter(routes, initDefault);
    } else {
      throw new Error('Must init Init Default');
    }
  }
}

// console.log('Initializing Routes...');
// Index.getInstance().createRoutes(dBHandler.getInit());
// console.log('Routes Initialized.');

export default Index.getInstance();

import { BaseControllerDefault } from '@backapirest/next';
export default class Authentication extends BaseControllerDefault {
  getBearerAuthentication(bearer?: string) {
    const newBearer = bearer
      ? bearer.includes('Bearer ')
        ? bearer.replace('Bearer ', '')
        : bearer.includes('Bearer')
        ? bearer.replace('Bearer', '')
        : bearer
      : bearer;
    return newBearer && newBearer.length > 0 ? newBearer : undefined;
  }

  getAuthentication(req) {
    const bearer = req.headers
      ? this.getBearerAuthentication(req.headers.authorization)
      : undefined;
    const token = req.query ? req.query.token : undefined;
    return bearer || token;
  }
  async authentication(req, _res, fn) {
    if (
      (req.query && req.query.token) ||
      (req.headers && req.headers.authorization)
    ) {
      req.authorization = this.getAuthentication(req);
      const service = this.getClassName() + 'Service';
      // console.log(req.authorization);
      // console.log(req.headers);
      // console.log(req.query);
      req.headers.authorization = req.authorization;
      try {
        const auth = await this.journaly?.publish(
          service + '.authentication',
          req.authorization
        );
        // console.log('authentication', auth);
        req.permissions = auth.permissions;
        await fn(auth);
      } catch (error) {
        // console.log('Error NAME:' + error.name);
        error.name = 'Unauthorized';
        await fn(error);
      }
    } else {
      const error = new Error('Missing Credentials.');
      error.name = 'Unauthorized';
      await fn(error);
    }
  }

  async permission(req, _res, fn) {
    // console.log('permission:', req.permissions);
    // console.log('event:', req.event);
    if (req.event && req.permissions) {
      const service = this.getClassName() + 'Service';
      // console.log(service);
      try {
        const permission = await this.journaly?.publish(
          service + '.permission',
          req.event,
          req.permissions
        );
        // console.log('permission', permission);
        fn(permission);
      } catch (error) {
        // console.log('Error NAME:' + error.name);
        error.name = 'Unauthorized';
        await fn(error);
      }
    } else {
      const error = new Error('Missing Permissions.');
      error.name = 'Unauthorized';
      await fn(error);
    }
  }

  async selfRestriction(req, _res, fn) {
    if (req.authorization) {
      const service = this.getClassName() + 'Service';
      // console.log(service);
      try {
        const auth = await this.journaly?.publish(
          service + '.authentication',
          req.authorization
        );
        // console.log('authentication', auth);
        if (
          (req.query && req.query.id === auth.id) ||
          (req['params'] && req['params'].filter === auth.id) ||
          (req['params'] &&
            req['params'].filter &&
            req['params'].filter.id === auth.id)
        )
          await fn(auth);
        else {
          const error = new Error('Missing ID or Wrong ID.');
          error.name = 'Unauthorized';
          await fn(error);
        }
      } catch (error) {
        // console.log('Error NAME:' + error.name);
        error.name = 'Unauthorized';
        await fn(error);
      }
    } else {
      const error = new Error('Missing Credentials.');
      error.name = 'Unauthorized';
      await fn(error);
    }
  }
}

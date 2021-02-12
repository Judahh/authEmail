import { BaseControllerDefault } from '@backapirest/express';
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
    const key = req.query ? req.query.key : undefined;
    return bearer || key;
  }
  async authentication(req, _res, fn) {
    if (
      (req.query && req.query.key) ||
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
}

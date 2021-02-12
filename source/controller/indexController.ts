/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BaseControllerOptions } from '@backapirest/next';
export default class IndexController extends BaseControllerOptions {
  async option(req, res) {
    console.log('option', req);
    return res.status(status).json({});
  }
}

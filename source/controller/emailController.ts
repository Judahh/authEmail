import {
  BaseControllerRead,
  BaseControllerStore,
  Mixin,
} from '@backapirest/express';
export default class EmailController extends Mixin(
  BaseControllerStore,
  BaseControllerRead
) {}

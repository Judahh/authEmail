import { DatabaseHandlerInitializer } from '@backapirest/express';
import { Router } from 'express';
import EmailController from '../controller/emailController';

export default function EmailRouter(
  routes: Router,
  initDefault: DatabaseHandlerInitializer
): void {
  // console.log('EmailRouter');
  const emailController = new EmailController(initDefault);
  routes.get('/email/:id', emailController.index.bind(emailController));
  routes.get('/email', emailController.show.bind(emailController));
}

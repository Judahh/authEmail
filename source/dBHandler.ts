/* eslint-disable @typescript-eslint/ban-ts-comment */
// file deepcode ignore object-literal-shorthand: argh
// file deepcode ignore no-any: any needed
import { Handler, MongoDB, PersistenceInfo } from 'flexiblepersistence';
import {
  DatabaseHandler,
  Journaly,
  SubjectObserver,
} from '@backapirest/express';
import { ServiceHandler } from '@flexiblepersistence/service';
// import PermissionService from './service/permissionService';
import { eventInfo, readInfo } from './config/databaseInfos';
import AuthenticationService from './service/authenticationService';
import EmailService from './service/emailService';

console.log('Initializing DatabaseHandler...');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const journaly = Journaly.newJournaly() as SubjectObserver<any>;
const readDatabase = new PersistenceInfo(readInfo, journaly);
const eventDatabase = new PersistenceInfo(eventInfo, journaly);

// console.log(readDatabase);
// console.log(eventDatabase);

const database = new MongoDB(readDatabase);

const read = new ServiceHandler(
  readDatabase,
  {
    authentication: new AuthenticationService(),
    email: new EmailService(),
  },
  database
);
const write = new MongoDB(eventDatabase);

const handler = new Handler(write, read);

console.log('DatabaseHandler Initialized.');

export default DatabaseHandler.getInstance({
  handler: handler,
  journaly: journaly,
}) as DatabaseHandler;

/* eslint-disable no-unused-vars */
// file deepcode ignore no-any: any needed
import { Event, Operation } from '@backapirest/next';
import dBHandler from '../../src/dBHandler';
import SignUpController from '../../src/controller/signUpController';
// import SessionController from '../../src/controller/sessionController';
import { NextApiRequest as Request, NextApiResponse as Response } from 'next';
import { Master0 /*, Master1, Master2*/ } from './defaultElements';
import { mockResponse } from './response.mock';

const normalize = (identifications) => {
  if (identifications)
    // eslint-disable-next-line no-unused-vars
    identifications = identifications.map((value) => {
      if (value.id) value.id = value.id.toString();
      if (value.key) delete value.key;
      return value;
    });
};

const normalizeSingleReceived = (received) => {
  if (received.identifications) {
    if (received.identifications.toObject)
      received.identifications = received.identifications.toObject();
    if (received.instances.toObject)
      received.instances = received.instances.toObject();
  }
  normalize(received.identifications);
};

// const SmartNormalize = (received) => {
//   if (Array.isArray(received))
//     for (const item of received) {
//       item.instances = [];
//       normalize(item.identifications);
//     }
//   else {
//     received.instances = [];
//     normalize(received.identifications);
//   }
//   return received;
// };

const getReceived = (returned) => {
  returned = JSON.parse(JSON.stringify(returned));
  if (Array.isArray(returned['received']))
    for (const received of returned['received']) {
      normalizeSingleReceived(received);
    }
  else normalizeSingleReceived(returned['received']);
  return returned['received'];
};

test('store person, update, select all, select by id person and delete it', async (done) => {
  const handler = dBHandler.getHandler();
  const signUp = new SignUpController(dBHandler.getInit());
  // const session = new SessionController(dBHandler.getInit());
  await handler.addEvent(
    new Event({ operation: Operation.delete, name: 'Person', single: false })
  );
  await handler.getWrite().clear();

  try {
    const createdPerson = await signUp.store(
      ({
        body: Master0,
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );

    const basicPermissions = {
      auth: {
        Profile: ['read', 'update', 'delete'],
        SignIn: ['read', 'update'],
      },
    };

    // console.log('createdPerson', createdPerson);

    normalize(Master0.identifications);
    const receivedCreatedPerson = getReceived(createdPerson);
    expect(receivedCreatedPerson).toStrictEqual({
      givenName: Master0.givenName,
      id: receivedCreatedPerson.id,
      identifications: Master0.identifications,
      instances: [],
      permissions: basicPermissions,
    });

    // const createdPeople = await signUp.store(
    //   ({
    //     body: [Master1, Master2],
    //     params: { single: false },
    //   } as unknown) as Request,
    //   (mockResponse as unknown) as Response
    // );

    // normalize(Master1.identifications);
    // normalize(Master2.identifications);

    // expect(createdPeople['received']).toStrictEqual([
    //   {
    //     givenName: Master1.givenName,
    //     id: createdPeople['received'][0].id,
    //     identifications: Master1.identifications,
    //   },
    //   {
    //     givenName: Master2.givenName,
    //     id: createdPeople['received'][1].id,
    //     identifications: Master2.identifications,
    //   },
    // ]);
    // // console.log(Master0);

    // if (Master0 && Master0.identifications && Master0.identifications[0]) {
    //   const createdSession = await session.store(
    //     ({
    //       body: { identification: Master0.identifications[0] },
    //     } as unknown) as Request,
    //     (mockResponse as unknown) as Response
    //   );
    //   console.log(createdSession['received']);
    // }
  } catch (error) {
    console.error(error);
    await handler.getWrite().clear();
    await handler.addEvent(
      new Event({ operation: Operation.delete, name: 'Person', single: false })
    );
    expect(error).toBe(null);
    done();
  }
  await handler.getWrite().clear();
  await handler.addEvent(
    new Event({ operation: Operation.delete, name: 'Person', single: false })
  );
  done();
});

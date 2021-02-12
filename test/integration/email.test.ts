// file deepcode ignore no-any: any needed
import { Event, Operation } from '@backapirest/express';
import dBHandler from '../../src/dBHandler';
import SignUpController from '../../src/controller/signUpController';
import PersonController from '../../src/controller/personController';
import { NextApiRequest as Request, NextApiResponse as Response } from 'next';
import { Bob, Master, Master1, Master2 } from './defaultElements';
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

// const timeout = (ms) => {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// };

const normalizeSingleReceived = (received) => {
  if (received.identifications) {
    if (received.identifications.toObject)
      received.identifications = received.identifications.toObject();
    if (received.instances.toObject)
      received.instances = received.instances.toObject();
  }
  normalize(received.identifications);
};

const SmartNormalize = (received) => {
  if (Array.isArray(received))
    for (const item of received) {
      item.instances = [];
      item._id = undefined;
      delete item._id;
      if (item.id) item.id = item.id.toString();
      normalize(item.identifications);
    }
  else {
    received.instances = [];
    received._id = undefined;
    delete received._id;
    if (received.id) received.id = received.id.toString();
    normalize(received.identifications);
  }
  return received;
};

const getReceived = (returned) => {
  returned = JSON.parse(JSON.stringify(returned));
  if (Array.isArray(returned['received']))
    for (const received of returned['received']) {
      normalizeSingleReceived(received);
    }
  else normalizeSingleReceived(returned['received']);
  return returned['received'];
};
const OLD_ENV = process.env;

beforeEach(async (done) => {
  // jest.resetModules(); // Most important - it clears the cache
  process.env = { ...OLD_ENV }; // Make a copy
  done();
});

afterAll(async (done) => {
  process.env = OLD_ENV; // Restore old environment
  done();
});

test('store person, update, select all, select by id person and delete it', async (done) => {
  process.env.IS_FAKE = 'true';
  const handler = dBHandler.getHandler();

  const signUp = new SignUpController(dBHandler.getInit());
  const person = new PersonController(dBHandler.getInit());

  await handler.addEvent(
    new Event({ operation: Operation.delete, name: 'Person', single: false })
  );
  await handler.getWrite().clear();
  try {
    const createdPerson = await signUp.store(
      ({
        body: Master,
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

    normalize(Master.identifications);
    const expectMaster = JSON.parse(
      JSON.stringify({
        givenName: Master.givenName,
        id: createdPerson['received'].id,
        identifications: Master.identifications,
        instances: [],
        permissions: basicPermissions,
      })
    );
    expect(getReceived(createdPerson)).toStrictEqual(expectMaster);

    // console.log('readPeople');

    let readPeople = await person.show(
      ({
        params: { filter: {} },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );

    // console.log(readPeople);

    expect(getReceived(readPeople)).toStrictEqual([expectMaster]);

    // console.log('ReCreate');

    try {
      expect(
        await signUp.store(
          ({
            body: Master,
          } as unknown) as Request,
          (mockResponse as unknown) as Response
        )
      ).toThrow(new Error('One or more identifications are already in use.'));
    } catch (e) {}

    // console.log('Masters');

    const createdPeople = await signUp.store(
      ({
        body: [Master1, Master2],
        params: { single: false },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );

    normalize(Master1.identifications);
    normalize(Master2.identifications);

    const receivedCreatedPeople = getReceived(createdPeople);
    // console.log(receivedCreatedPeople);

    expect(receivedCreatedPeople.ops).toStrictEqual([
      {
        givenName: Master1.givenName,
        id: receivedCreatedPeople.ops[0].id,
        _id: receivedCreatedPeople.ops[0].id,
        identifications: Master1.identifications,
        instances: [],
        permissions: basicPermissions,
      },
      {
        givenName: Master2.givenName,
        id: receivedCreatedPeople.ops[1].id,
        _id: receivedCreatedPeople.ops[1].id,
        identifications: Master2.identifications,
        instances: [],
        permissions: basicPermissions,
      },
    ]);

    // console.log('Masters2');

    readPeople = await person.show(
      ({
        params: { filter: {} },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );
    const receivedReadPeople = getReceived(readPeople);
    // console.log(receivedReadPeople);

    const expectMaster1 = JSON.parse(
      JSON.stringify({
        givenName: Master1.givenName,
        id: receivedCreatedPeople.ops[0].id,
        identifications: Master1.identifications,
        instances: [],
        permissions: basicPermissions,
      })
    );

    const expectMaster2 = JSON.parse(
      JSON.stringify({
        givenName: Master2.givenName,
        id: receivedCreatedPeople.ops[1].id,
        identifications: Master2.identifications,
        instances: [],
        permissions: basicPermissions,
      })
    );

    expect(receivedReadPeople).toStrictEqual([
      expectMaster,
      expectMaster1,
      expectMaster2,
    ]);

    const readPerson = await person.index(
      ({
        params: { filter: { givenName: expectMaster.givenName } },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );
    // console.log(createdPerson);
    // console.log(readPerson);
    expect(getReceived(readPerson)).toStrictEqual({
      givenName: Master.givenName,
      id: expectMaster.id,
      identifications: Master.identifications,
      instances: [],
      permissions: basicPermissions,
    });

    readPeople = await person.show(
      ({
        params: { filter: {} },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );
    // console.log(Master);
    const masters = [expectMaster, expectMaster1, expectMaster2];
    SmartNormalize(masters);

    // console.log(readPeople);

    expect(getReceived(readPeople)).toStrictEqual(masters);

    // console.log('Master3');

    // await timeout(10000);

    const updateMaster = { ...expectMaster, givenName: 'Master3' };
    delete updateMaster.id;

    const updatePeople = await person.update(
      ({
        body: updateMaster,
        params: { filter: { givenName: expectMaster.givenName } },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );

    // console.log('Master3E');

    // await timeout(10000);

    const receivedUpdatePeople = getReceived(updatePeople);
    // console.log(receivedUpdatePeople);

    expect(receivedUpdatePeople).toStrictEqual({
      givenName: Master.givenName,
      id: expectMaster.id,
      identifications: Master.identifications,
      instances: [],
      permissions: basicPermissions,
    });
    // console.log(updatePeople);
    // console.log('Master4');

    const readPerson2 = await person.index(
      ({
        params: { filter: { identifications: expectMaster.identifications } },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );

    const receivedReadPerson2 = getReceived(readPerson2);

    // console.log(receivedReadPerson2);

    // await timeout(10000);

    expect(receivedReadPerson2).toStrictEqual({
      givenName: 'Master3',
      id: expectMaster.id,
      identifications: Master.identifications,
      instances: [],
      permissions: basicPermissions,
    });
    // console.log('createdPerson2');

    const createdPerson2 = await signUp.store(
      ({
        body: Bob,
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );

    // console.log('createdPerson2:', createdPerson2);

    SmartNormalize(Bob);
    const receivedCreatedPerson2 = getReceived(createdPerson2);
    // console.log(Bob);
    // console.log(receivedCreatedPerson2);

    expect(receivedCreatedPerson2).toStrictEqual(Bob);

    const deletedPerson = await person.delete(
      ({
        params: { filter: { givenName: 'Master3' } },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );
    expect(getReceived(deletedPerson)).toStrictEqual({
      givenName: 'Master3',
      id: expectMaster.id,
      identifications: Master.identifications,
      instances: [],
      permissions: basicPermissions,
    });

    const readPeople2 = await person.show(
      ({
        params: { filter: {} },
      } as unknown) as Request,
      (mockResponse as unknown) as Response
    );
    const masters2 = [
      expectMaster1,
      expectMaster2,
      {
        ...Bob,
        id: receivedCreatedPerson2.id,
      },
    ];
    expect(getReceived(readPeople2)).toStrictEqual(masters2);
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

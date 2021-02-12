const eventInfo = {
  uri: process.env.MONGO_URI,
  connectionType: process.env.MONGO_CONNECTION_TYPE,
  options: process.env.MONGO_OPTIONS,
  database: process.env.MONGO_WRITE_DATABASE || 'write',
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT,
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
};

const readInfo = {
  uri: process.env.MONGO_URI,
  connectionType: process.env.MONGO_CONNECTION_TYPE,
  options: process.env.MONGO_OPTIONS,
  database: process.env.MONGO_READ_DATABASE || 'read',
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT,
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
};
export { eventInfo, readInfo };

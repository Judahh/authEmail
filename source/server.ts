import dBHandler from './dBHandler';
import { SimpleApp } from '@backapirest/express';
import Index from './routes/index';

const app = new SimpleApp(Index, dBHandler).express;
// databaseHandler.getInstance().migrate();
const port = process.env.PORT || 3333;

// console.log(port);
app.listen(port);

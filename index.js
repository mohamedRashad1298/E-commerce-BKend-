const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({path:'./config.env'});

const { DB } = process.env;
const password = process.env.DB_PASSWORD;

mongoose.connect(DB.replace('<password>', password)).then(() => {
  console.log('DB connected');
});

// const localDB = process.env.LOCAL_DB;
// mongoose.connect(localDB).then(() => {
//   console.log('DB connected');
// });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('working');
});

process.on('unhandledRejection', (err) => {
  console.log('unhandled Rejection error! shuting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtExpection', (err) => {
  console.log('unhandled Rejection error! shuting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

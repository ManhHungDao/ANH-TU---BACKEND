const app = require('./app');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');

connectDatabase();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET_KEY 
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Started on PORT: ${process.env.PORT} in  ${process.env.NODE_ENV}`);
})

//Handle unhandle promise rejection error
process.on('unhandledRejection', err => {
  console.log(`ERROR: ${err.message}`);
  console.log('Shutting down the server due to unhandled Promise rejection');
  server.close(() => {
      process.exit(1);
  });
})


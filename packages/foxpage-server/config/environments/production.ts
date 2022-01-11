const mongoConfig = process.env.MONGO_CONFIG;

export default {
  host: '',
  port: 50000,
  jwtKey: 'mock',
  ignoreTokenPath: [
    '/swagger/swagger.json',
    '/swagger/swagger',
    '/users/login',
    '/users/register',
    '/healthcheck',
  ],
  mongodb: mongoConfig || 'mongodb://127.0.0.1:45201/foxpage?retryWrites=false',
  locale: 'en', // Current language
  plugins: [],
  resourceConfig: { },
};

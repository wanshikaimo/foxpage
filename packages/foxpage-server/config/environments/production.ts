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
  mongodb: mongoConfig || '',
  plugins: [],
  resourceConfig: {
    unpkg: {},
  },
};

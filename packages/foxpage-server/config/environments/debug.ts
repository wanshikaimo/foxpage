const mongoConfig = process.env.MONGO_CONFIG;

export default {
  host: '',
  port: 50000,
  jwtKey: 'mock', // Generate jwt key text
  ignoreTokenPath: [
    '/swagger/swagger.json',
    '/swagger/swagger',
    '/users/login',
    '/users/register',
    '/healthcheck',
  ], // Skip to verify the interface of the token
  mongodb: mongoConfig || 'mongodb://127.0.0.1:45201/test?retryWrites=false', // Database connection string
  locale: 'en', // Current language
  plugins: [
    '@foxpage/foxpage-plugin-aws-s3',
    '@foxpage/foxpage-plugin-ares',
    '@foxpage/foxpage-plugin-unpkg',
  ],
  allLocales: ['en-US', 'zh-HK', 'en-HK', 'ko-KR', 'ja-JP'], // Supported locales
  storageConfig: {
    bucket: 'foxpage',
    config: {
      region: 'ap-southeast-1',
      credentials: {
        accessKeyId: 'AKIASBTKBMEZFDKETTFX',
        secretAccessKey: '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',
      },
    },
  },
  resourceConfig: {
    ares: {
      registry: 'http://registry.ares.fws.qa.nt.ctripcorp.com',
      static: 'http://static.fws.qa.nt.ctripcorp.com',
    },
    unpkg: {},
  },
};

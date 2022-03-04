module.exports = {
  dev: {
    env: 'dev',
    foxpageApi: 'http://127.0.0.1:50000/',
    // foxpageApi: 'api.foxfamily.io/',
    ssrApi: 'http://127.0.0.1:50000/',
    slug: '',
  },
  fat: {
    env: 'fat',
    foxpageApi: 'http://127.0.0.1:50000/',
    ssrApi: 'http://127.0.0.1:50000/',
    slug: 'foxpage-admin',
  },
  prd: {
    env: 'prd',
    foxpageApi: 'http://127.0.0.1:50000/',
    ssrApi: 'http://127.0.0.1:50000/',
    slug: 'foxpage-admin',
  },
};

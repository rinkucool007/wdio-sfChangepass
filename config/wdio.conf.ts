export const config: WebdriverIO.Config = {
    runner: 'local',
    autoCompileOpts: {
      autoCompile: true,
      tsNodeOpts: {
        transpileOnly: true,
        project: 'tsconfig.json'
      }
    },
    
    specs: ['../src/tests/**/*.ts'],
    capabilities: [{
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless', '--disable-gpu']
      }
    }],
    
    logLevel: 'info',
    baseUrl: 'https://login.salesforce.com',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    services: ['chromedriver'],
    framework: 'mocha',
    reporters: ['spec'],
    
    mochaOpts: {
      ui: 'bdd',
      timeout: 60000
    }
  }
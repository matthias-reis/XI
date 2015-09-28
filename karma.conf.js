// Karma configuration
// Generated on Fri Sep 25 2015 10:27:39 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
      'client/js/x1/x1.bootstrap.js',
      {pattern: 'client/js/x1/x1.*.js', watched: true, included: false, served: true},
      {pattern: 'test/fixtures/*.js', watched: true, included: false, served: true},
      'test/config.js',
      'test/basics.spec.js',
      'test/ready.spec.js',
      'test/require.spec.js',
      'test/streams.spec.js'
    ],
    exclude: [],
    preprocessors: {},
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  })
};

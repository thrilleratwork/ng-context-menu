var GulpSelenium = require('gulp-selenium');
var gulpSelenium = GulpSelenium(),
    outputDir = process.env.CIRCLE_TEST_REPORTS || 'test-result';

exports.config = {
//  seleniumServerJar: gulpSelenium.path,
//  chromeDriver: gulpSelenium.chromeDriverPath,
  seleniumAddress: 'http://localhost:4444/wd/hub', // Using JAR instead of address
  capabilities: {
    browserName: 'chrome'
  },
  onPrepare: function() {
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      new jasmine.JUnitXmlReporter(outputDir, true, true)
    );
  },
  specs: ['test/ui/**/*.spec.js']
};
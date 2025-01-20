const validator = require('html-validate');
const { firefox } = require('playwright');

const validateLocalhost = async () => {
  let browser;
  try {
    // Launch firefox instead of chromium
    browser = await firefox.launch();
    const page = await browser.newPage();

    // Wait for React to finish rendering
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
    });

    // Get the fully rendered HTML
    const html = await page.content();

    // Create validator instance with default config
    const htmlvalidate = new validator.HtmlValidate();
    const report = await htmlvalidate.validateString(html);

    if (report.valid) {
      console.log('✅ HTML validation passed');
      await browser.close();
      process.exit(0);
    } else {
      const errorCount = report.results[0].messages.length;
      console.log(
        `❌ HTML validation failed with ${errorCount} error${errorCount === 1 ? '' : 's'}`,
      );
      report.results[0].messages.forEach((error, index) => {
        console.log(`\n🔍 Validation Error (${index + 1}/${errorCount}):`);
        console.log(`Rule:     ${error.ruleId}`);
        console.log(`Message:  ${error.message}`);
        console.log(`Location: Line ${error.line}, Column ${error.column}`);
        if (error.ruleUrl) {
          console.log(`More Info: ${error.ruleUrl}`);
        }
      });
      await browser.close();
      process.exit(1);
    }
  } catch (error) {
    console.error('Error validating HTML:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
};

// Run validation
validateLocalhost();

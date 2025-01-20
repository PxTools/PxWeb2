const validator = require('html-validate');
const { firefox } = require('playwright');

const validateLocalhost = async () => {
  try {
    // Launch firefox instead of chromium
    const browser = await firefox.launch();
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
    } else {
      console.log('❌ HTML validation failed');
      console.log(report.results[0].messages);
    }

    await browser.close();
  } catch (error) {
    console.error('Error validating HTML:', error);
  }
};

// Run validation
validateLocalhost();

import { HtmlValidate } from 'html-validate';
import { firefox } from 'playwright';

const DETAILED_RULE_ID = ''; // ex: 'element-permitted-content'
const ERROR_SEVERITY = 2;
const WARNING_SEVERITY = 1;

const TARGETS = [
  { name: 'Start page (en)', url: 'http://localhost:4300/en/' },
  { name: 'Table TAB6458 (en)', url: 'http://localhost:4300/en/table/TAB6458' },
];

const groupByRule = (messages) =>
  messages.reduce((acc, msg) => {
    const rule = msg.ruleId ?? 'unknown-rule';
    if (!acc[rule]) {
      acc[rule] = [];
    }
    acc[rule].push(msg);
    return acc;
  }, {});

const sortGroupsByCount = (groups) =>
  Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

const getMessages = (report) =>
  (report.results ?? []).flatMap((result) => result.messages ?? []);

const splitBySeverity = (messages) => ({
  errors: messages.filter((msg) => msg.severity === ERROR_SEVERITY),
  warnings: messages.filter((msg) => msg.severity === WARNING_SEVERITY),
});

const printRuleSummary = (title, sortedRules) => {
  console.log(`\n${title}`);
  if (sortedRules.length === 0) {
    console.log('- none');
    return;
  }

  sortedRules.forEach(([ruleId, messages]) => {
    console.log(`- ${ruleId}: ${messages.length}`);
  });
};

const printSamples = (title, rules) => {
  console.log(`\n${title}`);
  if (rules.length === 0) {
    console.log('- none');
    return;
  }

  rules.forEach(([ruleId, messages], index) => {
    const sample = messages[0];
    console.log(`\n${index + 1}. Rule: ${ruleId} (${messages.length} total)`);
    console.log(`   Message: ${sample.message ?? 'n/a'}`);
    console.log(
      `   Location: Line ${sample.line ?? '?'}, Column ${sample.column ?? '?'}`,
    );
    if (sample.selector) {
      console.log(`   Selector: ${sample.selector}`);
    }
  });
};

const printDetailedRuleErrors = (ruleId, errors) => {
  const filteredErrors = errors.filter((error) => (error.ruleId ?? '') === ruleId);

  console.log(`\n🔍 Detailed errors for rule: ${ruleId}`);
  if (filteredErrors.length === 0) {
    console.log('- none');
    return;
  }

  filteredErrors.forEach((error, index) => {
    console.log(`\n🔍 Validation Error (${index + 1}/${filteredErrors.length}):`);
    console.log(`Rule:     ${error.ruleId}`);
    console.log(`Message:  ${error.message}`);
    console.log(`Location: Line ${error.line}, Column ${error.column}`);
    if (error.selector) {
      console.log(`Selector: ${error.selector}`);
    }
    if (error.ruleUrl) {
      console.log(`More Info: ${error.ruleUrl}`);
    }
  });
};

const printValidationFailure = (report, detailedRuleId) => {
  const allMessages = getMessages(report);
  const { errors, warnings } = splitBySeverity(allMessages);

  const sortedErrorRules = sortGroupsByCount(groupByRule(errors));
  const sortedWarningRules = sortGroupsByCount(groupByRule(warnings));

  console.log(
    `❌ HTML validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}`,
  );

  printRuleSummary('📊 Error summary by rule:', sortedErrorRules);
  printRuleSummary('📊 Warning summary by rule:', sortedWarningRules);

  if (detailedRuleId) {
    printDetailedRuleErrors(detailedRuleId, errors);
    return;
  }

  printSamples('🔎 One example error per rule:', sortedErrorRules);
  printSamples('🔎 One example warning per rule:', sortedWarningRules);
};

const validateTarget = async (browser, target) => {
  const page = await browser.newPage();

  try {
    await page.goto(target.url, { waitUntil: 'networkidle' });

    const html = await page.content();
    const htmlvalidate = new HtmlValidate();
    const report = await htmlvalidate.validateString(html);

    console.log('\n==================================================');
    console.log(`Target: ${target.name}`);
    console.log(`URL:    ${target.url}`);
    console.log('==================================================');

    if (report.valid) {
      console.log('HTML validation passed');
      return { target, valid: true };
    }

    printValidationFailure(report, DETAILED_RULE_ID);
    return { target, valid: false };
  } catch (error) {
    console.error(`Error validating target "${target.name}":`, error);
    return { target, valid: false };
  } finally {
    await page.close();
  }
};

const validateTargets = async () => {
  let browser;

  try {
    browser = await firefox.launch();

    const results = [];
    for (const target of TARGETS) {
      const result = await validateTarget(browser, target);
      results.push(result);
    }

    const failed = results.filter((result) => !result.valid);

    console.log('\n==================== Final Summary ====================');
    console.log(`Total targets: ${results.length}`);
    console.log(`Passed: ${results.length - failed.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed targets:');
      failed.forEach(({ target }) => {
        console.log(`- ${target.name}: ${target.url}`);
      });
      return 1;
    }

    console.log('\nAll targets passed HTML validation.');
    return 0;
  } catch (error) {
    console.error('Error validating HTML:', error);
    return 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const exitCode = await validateTargets();
process.exit(exitCode);

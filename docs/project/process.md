# Scrum process
- The project group work in sprints of three weeks.
- We have daily stand-up.
- Developers have an open Teams-link where they cooperate daily.
- The sprints end with a demo on Monday every third week at twelve o'clock.
- The project group meet physically once a quarter.
## Test tools
**We are exploring what text tools we are going to use so this list can be changed. **

| Type of test | Testing tools |
| --- | ----------- |
|Unit and integration tests | Vitest/Jest |
| |Stories in Storybook |
|Static code analysis | CodeQL (in GitHub) |
| Thirdparty code | Dependabot security and version updates,  |
| | Dependabot alerts |
|  | Use Snyk Advisor to check development and maintenance health of libraries |
| Automated end-to-end tests | Playwright |
| Acceptancetests | Playwright, Chromatic: UI Review (Manual test) |
| Regressiontests  | Playwright  |
| |Chromatic: UI Test |
| Accessibility testing |  @storybook/addon-a11ly Shows relevant results automatically in Storybook,  | 
|  | Axe browser extension, Lighthouse, Playwright with Axe? Valid HTML5 (W3C validator) |
| Security tests | [http://securityheaders.io/](http://securityheaders.io/)|
| |Dynamic analysis:  |
| |Detectify | 
| |Nessus  |
| Performance tests | Lighthouse |
| Container security | Trivy? |



## Sketch over the systems


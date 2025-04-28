# Scrum process 
- The project group work in sprints of three weeks.
- The group follow the scrum rituals with sprintplanning, refinement, retro and daily stand-up.
- The sprints end with a demo (sprint review) on Monday every third week at twelve o'clock.
- Developers have an open Teams-link where they cooperate daily.
- The project group meet physically once a quarter.
## Test tools

| Type of test | Testing tools |
| --- | ----------- |
|Unit and integration tests | Vitest/Jest |
| |Stories in Storybook |
|Static code analysis | CodeQL (in GitHub) |
| Thirdparty code | Dependabot security and version updates,  |
| | Dependabot alerts |
|  | Use Snyk Advisor to check development and maintenance health of libraries |
| Automated end-to-end tests | Mabl|
| Acceptancetests | Mabl, Chromatic: UI Review (Manual test) |
| Regressiontests  | Mabl  |
| |Chromatic: UI Test |
| Accessibility testing |  @storybook/addon-a11ly    Shows relevant results automatically in Storybook,  | 
|  | Axe browser extension |
| |Lighthouse|
| |Mabl with Axe| 
| |Valid HTML5 (W3C validator)  |
| Security tests | [http://securityheaders.io/](http://securityheaders.io/)|
| |Dynamic analysis:  |
| |Detectify | 
| |Nessus  |
| Performance tests | JMeter |
| Container security | Trivy? |

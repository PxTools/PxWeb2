# Maintainers Guide

This guide is intended for maintainers - those who are maintaining PxWeb by providing or reviewing pull requests.

## Getting Started

1. Familiarize yourself with the project structure and our [CONTRIBUTING.md](./CONTRIBUTING.md) guide as well as this guide.
2. Setup the project locally and make sure that you can run PxWeb.

## Development Tools we use

We recommend the following tools for our development environment:

- **Code Editor**: [Visual Studio Code (VS Code)](https://code.visualstudio.com/) is our preferred code editor. It provides a rich set of features, extensions, and integrations that enhance productivity and make development easier.

- **Build & Development Environment**: [Vite](https://vitejs.dev/) is our preferred build and development environment. It is a fast and lightweight build tool that optimizes the development experience by providing instant server startup, hot module replacement, and efficient bundling.

- **Accessibility**: [Axe](https://www.deque.com/axe/) is our preferred tool to help us comply with wcag

By using these tools, we ensure a streamlined and efficient development process, enabling us to deliver high-quality code.

## Technical debt

An overview of the current technical debt in the project:

### Long running tasks

1. Updating the packages used in the project. This includes both Dependabot PRs and other outdated packages.
   - For security reasons, we want to wait atleast 9 days before updating packages.
   Use NPM '--before' or npm-check-updates '--cooldown' flags.
   E.g: npm-check-updates --format group --deep --cooldown 9 -iu
2. Fix [SonarQube issues/codesmells](https://sonarcloud.io/project/overview?id=PxTools_PxWeb2)
3. Fix warnings when running `npm run lint`

### Onetime tasks

1. The package we use to generate the api-client is no longer maintained, and needs to be updated. It recommends a fork that is activly maintained.
2. We should split up the Selection.tsx component a bit. That would make it easier to write unit tests for the code.

## Git Branching Strategy

We use a simple and effective Git branching strategy to keep our project organized and maintainable.

1. **Main Branch**: The `main` branch is the primary branch where the source code of HEAD always reflects a "production-ready" state.

2. **Feature Branches**: For new features and non-emergency bug fixes, we create a new branch off of `main`. Name your branch descriptively, indicating the purpose of your changes. Branch names should be lowercased and should be prefixed with `feature/`.

   Example: `feature/PXWEB2-1-new-login-screen`

3. **Fix Branches**: For bug fixes, we create a new branch off of `main`. Name your branch descriptively, indicating the purpose of your changes. Branch names should be lowercased and prefixed with `fix/`.

   Example: `fix/PXWEB2-1-login-screen-bug`

4. **Patch Branches**: For minor changes and patches, we create a new branch off of `main`. Name your branch descriptively, indicating the purpose of your changes. Branch names should be lowercased and prefixed with `patch/`.

   Example: `patch/PXWEB2-1-update-login-screen-docs`

5. **Pull Requests**: After making your changes in these branches, merge them back into `main` via a pull request. The pull request should be reviewed and tested before it is merged.

> Make sure that the JIRA id is included in the branch name and that this should be in capital letters.
>
> We prefer hyphens instead of underscores for word separator in branch names.

This strategy ensures that our `main` branch always has "production-ready" code that has been reviewed and tested.

## Create Pull Requests

To get started with contributing code, please follow these steps:

1. Clone the repository to your local machine.
2. Create a new branch from the `main` branch. Name your branch descriptively, indicating the purpose of your changes.
3. Make your changes and ensure that the code follows the project's coding conventions.
4. Test your changes thoroughly to ensure they work as expected.
5. Commit your changes with a clear and descriptive commit message.
6. Push your changes.
7. Open a pull request against the `main` branch and make sure that it has:
   - A descriptive title.
   - A clear and concise description of the changes, including the purpose and benefits of the change.
   - A reference to the related issue(s) or ticket(s).
   - Screenshots or gifs if the changes include UI/UX changes.
   - New tests that cover the added features or bug fixes.
   - Documentation updates if necessary.
   - Passed all the continuous integration checks (like build, linting and tests).

   > Your PR will have automatic deploys to Cloudflare Pages that can be used by the reviewers

8. Reviewers will be automatically assigned from [CODEOWNERS](CODEOWNERS) to your PR and once approved by at least one reviewer you can continue with one of the following options
   - Create a merge commit
   - Squash and merge (recomended for most/smaller changes)
   - Rebase and merge

> [!IMPORTANT]
> We use [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
> so a descriptive PR title is essential for the release notes.

## Reviewing Pull Requests

1. Ensure that the PR is related to a filed issue.
2. Check that the code follows the project's coding standards.
3. Test the code locally to ensure it works as expected.
4. Review the tests included with the PR to ensure they cover the new functionality or bug fix.

## Communicating

1. Be respectful and kind to the contributors.
2. Provide clear, constructive feedback on PRs.
3. Promote a collaborative and learning environment.

Remember, this project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 3rd Party Components

While developing for this project, we aim to minimize the number of dependencies. This is to keep the project lightweight, maintainable, and to reduce potential security risks.

Before adding a new 3rd party component or library, please consider the following:

1. Is the component necessary? Can the functionality be achieved without it?
2. Is the component actively maintained? An unmaintained component can pose a security risk and may lack support.
3. Does the component have a large community? Larger communities often mean more resources for troubleshooting and learning.
4. Is the component's license compatible with our project?
5. Consult with another maintainer if it is the right component for the job.
6. Consult [snyk Advisor](https://snyk.io/advisor/) to get a summary for the component.

For existing third-party component dependencies, we will utilize Dependabot to help us stay up to date. Dependabot is an automated dependency management tool that regularly checks for updates to our dependencies and creates pull requests to update them. This helps us ensure that we are using the latest versions of our dependencies, which can include important bug fixes, security patches, and new features.

We are committed to continuously updating our dependencies to ensure that we are using the latest versions. However, in some cases, we may encounter conflicts with NX plugins that prevent us from updating to the latest versions. In such situations, we carefully evaluate the impact and risks before deciding on the appropriate course of action.

In the event of a security vulnerability being discovered in any of our dependencies, we will prioritize attending to it urgently. Our team will take immediate action to mitigate the risk and apply necessary patches or updates.

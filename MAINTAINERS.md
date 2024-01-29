# Maintainers Guide

This guide is intended for maintainers - those who are maintaining PxWeb by providing or reviewing pull requests.

## Getting Started

1. Familiarize yourself with the project structure and our [CONTRIBUTING.md](./CONTRIBUTING.md) guide aswell as this guide.
2. Setup the project locally and make sure that you can run PxWeb.

## Git Branching Strategy

We use a simple and effective Git branching strategy to keep our project organized and maintainable.

1. **Main Branch**: The `main` branch is the primary branch where the source code of HEAD always reflects a "production-ready" state.

2. **Feature Branches**: For new features and non-emergency bug fixes, we create a new branch off of `main`. Name your branch descriptively, indicating the purpose of your changes. Branch names should be lowercased and should be prefixed with `feature/`.

    Example: `feature/new-login-screen`

3. **Fix Branches**: For bug fixes, we create a new branch off of `main`. Name your branch descriptively, indicating the purpose of your changes. Branch names should be lowercased and prefixed with `fix/`.

    Example: `fix/login-screen-bug`

4. **Patch Branches**: For minor changes and patches, we create a new branch off of `main`. Name your branch descriptively, indicating the purpose of your changes. Branch names should be lowercased and prefixed with `patch/`.

    Example: `patch/update-login-screen-docs`

5. **Pull Requests**: After making your changes in these branches, merge them back into `main` via a pull request. The pull request should be reviewed and tested before it is merged.

This strategy ensures that our `main` branch always has "production-ready" code that has been reviewed and tested.

## Create Pull Requests
To get started with contributing code, please follow these steps:

1. Clone the repository to your local machine.
2. Create a new branch from the `main` branch. Name your branch descriptively, indicating the purpose of your changes.
3. Make your changes and ensure that the code follows the project's coding conventions.
4. Test your changes thoroughly to ensure they work as expected.
4. ???CHANGE LOG see https://keepachangelog.com/en/1.1.0/???
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

> Your PR will have automatic deploys to Netlify that can be used by the reviewers    

8. Assign reviewers to your PR and once approved by at least one reviewer you can continue and merge the PR.


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
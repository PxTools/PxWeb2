# Changelog

## [2.10.0](https://github.com/PxTools/PxWeb2/compare/v2.9.2...v2.10.0) (2026-08-18)


### :sparkles: Features

* add chart filter feedback feature with fade effect ([#1359](https://github.com/PxTools/PxWeb2/issues/1359)) ([f5acd23](https://github.com/PxTools/PxWeb2/commit/f5acd23dfea19503206b52d808483767dff44402))
* enhance WIP status message with markdown support and update welcome message ([#1357](https://github.com/PxTools/PxWeb2/issues/1357)) ([53f54ed](https://github.com/PxTools/PxWeb2/commit/53f54ed6ceffc0c7ac048eba2a3ba09c2a455833))
* show PxWeb version ([2584818](https://github.com/PxTools/PxWeb2/commit/25848189b38f5c6a6588aff199e79cd91f8463ff))


### :bug: Bug Fixes

* definitionstab show only statistics homepage if wanted ([#1442](https://github.com/PxTools/PxWeb2/issues/1442)) ([e201188](https://github.com/PxTools/PxWeb2/commit/e201188115f653a7e3c33ae97e0a8544518d91c2))


### :art: Styles

* Enhance footer layout for table page ([#1431](https://github.com/PxTools/PxWeb2/issues/1431)) ([133ee55](https://github.com/PxTools/PxWeb2/commit/133ee55d050663ed6002d2eb9fa3a23daf220ac3))


### :building_construction: Build System and dependencies

* **deps-dev:** bump jsdom from 29.1.1 to 30.0.1 ([#1435](https://github.com/PxTools/PxWeb2/issues/1435)) ([749cffa](https://github.com/PxTools/PxWeb2/commit/749cffa2a2517e97a89608a3557667405906f577))
* **deps:** bump actions/setup-node from 6.4.0 to 7.0.0 ([#1445](https://github.com/PxTools/PxWeb2/issues/1445)) ([f22c74a](https://github.com/PxTools/PxWeb2/commit/f22c74a93e790ce2284fd3360f7d85a6eb60aa11))
* **deps:** bump docker/login-action from 4.2.0 to 4.6.0 ([#1443](https://github.com/PxTools/PxWeb2/issues/1443)) ([b8713ea](https://github.com/PxTools/PxWeb2/commit/b8713ea07bcf5a55c442c488742b5a3901cfd2bb))
* **deps:** bump github/codeql-action/upload-sarif ([#1452](https://github.com/PxTools/PxWeb2/issues/1452)) ([46c8315](https://github.com/PxTools/PxWeb2/commit/46c83155431e73209ca596962ddd876205d3d4b1))
* **deps:** bump motion from 12.43.0 to 13.0.0 ([#1449](https://github.com/PxTools/PxWeb2/issues/1449)) ([39660a6](https://github.com/PxTools/PxWeb2/commit/39660a6e2044888b10568ef95612689bccb4e65e))


### :broom: Chores

* Upgrade all non-major dependencies ([#1441](https://github.com/PxTools/PxWeb2/issues/1441)) ([fd39d5a](https://github.com/PxTools/PxWeb2/commit/fd39d5aebd3dc4840dbab225842407fb323cd348))

## [2.9.2](https://github.com/PxTools/PxWeb2/compare/v2.9.1...v2.9.2) (2026-08-13)


### :bug: Bug Fixes

* Wrap the search in FilterSidebar in useMemo ([#1420](https://github.com/PxTools/PxWeb2/issues/1420)) ([a0d9944](https://github.com/PxTools/PxWeb2/commit/a0d9944346c4fa3345af01f518d3af07278b780d))


### :building_construction: Build System and dependencies

* Add "nodejs_compat" flag to wrangler configuration ([#1433](https://github.com/PxTools/PxWeb2/issues/1433)) ([23b2239](https://github.com/PxTools/PxWeb2/commit/23b2239a37d26e207deeb2b6bd2e8aa9b2ef5a9f))
* Add vars NODE_VERSION to wrangler.jsonc ([#1434](https://github.com/PxTools/PxWeb2/issues/1434)) ([34eee08](https://github.com/PxTools/PxWeb2/commit/34eee0878816d9b670f3189402a6f73db47d583e))
* **deps-dev:** bump fast-uri from 3.1.4 to 3.1.5 ([#1407](https://github.com/PxTools/PxWeb2/issues/1407)) ([481de9e](https://github.com/PxTools/PxWeb2/commit/481de9ee4fffd6ac342dff53ca6df3cee7b73119))
* **deps-dev:** bump js-yaml from 4.3.0 to 4.3.1 ([#1418](https://github.com/PxTools/PxWeb2/issues/1418)) ([29979db](https://github.com/PxTools/PxWeb2/commit/29979dbe56f955544005fdc9fdac4a3c9d1ee2e6))
* **deps-dev:** bump shiki from 4.3.1 to 4.4.1 ([#1412](https://github.com/PxTools/PxWeb2/issues/1412)) ([5002d38](https://github.com/PxTools/PxWeb2/commit/5002d386dba607f456189e5d507b02603c1a1041))
* **deps:** bump actions/checkout from 7.0.0 to 7.0.1 ([#1426](https://github.com/PxTools/PxWeb2/issues/1426)) ([ad5c123](https://github.com/PxTools/PxWeb2/commit/ad5c123aaf8d32eadda8f78f5a4060111fde663f))
* **deps:** bump docker/build-push-action from 7.2.0 to 7.3.0 ([#1427](https://github.com/PxTools/PxWeb2/issues/1427)) ([cee95c5](https://github.com/PxTools/PxWeb2/commit/cee95c52725c4295384d0833c4e2a8bb03d9bf84))
* **deps:** bump docker/login-action from 4.5.1 to 4.6.0 ([#1413](https://github.com/PxTools/PxWeb2/issues/1413)) ([607b393](https://github.com/PxTools/PxWeb2/commit/607b393a35141d1ad44fae7ab5a0beca3697dc9e))
* **deps:** bump docker/metadata-action from 6.1.0 to 6.2.0 ([#1425](https://github.com/PxTools/PxWeb2/issues/1425)) ([cd07961](https://github.com/PxTools/PxWeb2/commit/cd07961b510c539e566cd64ac096634077e2bb52))
* **deps:** bump docker/setup-buildx-action from 4.1.0 to 4.2.0 ([#1424](https://github.com/PxTools/PxWeb2/issues/1424)) ([e21d76f](https://github.com/PxTools/PxWeb2/commit/e21d76fdb9fc6bac93eb16dde877e623d6249c56))
* **deps:** bump docker/setup-qemu-action from 4.1.0 to 4.2.0 ([#1423](https://github.com/PxTools/PxWeb2/issues/1423)) ([baa6404](https://github.com/PxTools/PxWeb2/commit/baa6404ab047a9bfda2e1017864de37b4ec936ae))
* **deps:** bump github/codeql-action/upload-sarif ([#1417](https://github.com/PxTools/PxWeb2/issues/1417)) ([048f271](https://github.com/PxTools/PxWeb2/commit/048f2716128550eeae594411b82f6383ffe30bc6))
* **deps:** bump motion from 12.42.2 to 12.43.0 ([#1415](https://github.com/PxTools/PxWeb2/issues/1415)) ([c49ff92](https://github.com/PxTools/PxWeb2/commit/c49ff92876ddd393305f6f0c4a6368914336220c))
* **deps:** bump node from 24.18.0-slim to 24.18.1-slim ([#1414](https://github.com/PxTools/PxWeb2/issues/1414)) ([97cb2ad](https://github.com/PxTools/PxWeb2/commit/97cb2ad7a90e31831264c88b75cd4e09c3de62c9))
* Enforce npm and node minimum versions ([#1411](https://github.com/PxTools/PxWeb2/issues/1411)) ([ce36ca4](https://github.com/PxTools/PxWeb2/commit/ce36ca4ec7965a0d622a5784a4b61a64a531edc2))


### :broom: Chores

* Add missing engine.npm version to pkg-lock ([#1436](https://github.com/PxTools/PxWeb2/issues/1436)) ([86fb730](https://github.com/PxTools/PxWeb2/commit/86fb7308a57af4d4e3e4b8799a09f4a940195244))
* Add release-please configuration and workflow files ([#1360](https://github.com/PxTools/PxWeb2/issues/1360)) ([d820f17](https://github.com/PxTools/PxWeb2/commit/d820f17d142527858e8b4ac8fdd9b599189cef06))
* Update initial version to 2.10.0 in release and prerelease configuration ([#1422](https://github.com/PxTools/PxWeb2/issues/1422)) ([56ebb54](https://github.com/PxTools/PxWeb2/commit/56ebb549924afbb24065e66ba0e4c82fff422398))
* Update project minor and patch dependencies ([#1419](https://github.com/PxTools/PxWeb2/issues/1419)) ([8d7c7a6](https://github.com/PxTools/PxWeb2/commit/8d7c7a6bba58a1ca794a63b9dc9ab733caf3ccbe))

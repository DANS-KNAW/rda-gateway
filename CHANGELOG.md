# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.1](https://github.com/DANS-KNAW/rda-gateway/compare/v0.2.0...v0.2.1) (2026-02-02)


### Features

* **iam:** add Keycloak JWT authentication with JWKS validation ([3330e2f](https://github.com/DANS-KNAW/rda-gateway/commit/3330e2fac9554adb9597321cbd217b0a8cd198c5))
* **ingests:** add row-based CSV ingestion mode ([d285ef1](https://github.com/DANS-KNAW/rda-gateway/commit/d285ef19edfb8cd3a4a02043329ecb53389da1d9))
* **knowledge-base:** protect annotation endpoints with JWT auth ([72dc66b](https://github.com/DANS-KNAW/rda-gateway/commit/72dc66b0489d64bbfb67a1bacdb341b0de39aba3))
* move eosc_task_forces, erics, he_projects to keyword vocabulary ([9154293](https://github.com/DANS-KNAW/rda-gateway/commit/9154293d96de9d69e974d2764208c232a92c3132))


### Bug Fixes

* **knowledge-base:** loosen selector validation in annotation DTO ([8647070](https://github.com/DANS-KNAW/rda-gateway/commit/8647070960af11e9be54f08bc6d51725b438c06b))


### Tests

* update tests for JWT authentication requirements ([5336feb](https://github.com/DANS-KNAW/rda-gateway/commit/5336feb8b7ac6b2071500f6d6e38f973807a112d))


### Code Refactoring

* **auth:** move API key guard from global to controller-level ([0376095](https://github.com/DANS-KNAW/rda-gateway/commit/0376095a376bec069ac8b5088a294c8b9195bcfa))

## [0.2.0](https://github.com/DANS-KNAW/rda-gateway/compare/v0.1.0...v0.2.0) (2026-01-26)


### Features

* **auth:** add ApiKeyGuard for API key authentication ([0299198](https://github.com/DANS-KNAW/rda-gateway/commit/029919814f6d498ebeb086c6f80bce0eaa6189b4))
* **auth:** add Public decorator for bypassing authentication ([5270e2e](https://github.com/DANS-KNAW/rda-gateway/commit/5270e2ef8c8d387d93d3638c5db24f15235989b7))
* **auth:** register ApiKeyGuard globally and mark public routes ([50a9ec6](https://github.com/DANS-KNAW/rda-gateway/commit/50a9ec6511711096c5e4ba7d2dbdd6d41bb5dbcd))
* **config:** add API_KEY to IAM configuration schema ([0a50fce](https://github.com/DANS-KNAW/rda-gateway/commit/0a50fce1509a8ecb853d9ec95333db10c9427756))


### Tests

* **e2e:** add API key authentication tests ([d6b67fa](https://github.com/DANS-KNAW/rda-gateway/commit/d6b67fa108d0cfe328080362d282e2f8b7125618))


### Documentation

* **swagger:** add API key security scheme ([a147d19](https://github.com/DANS-KNAW/rda-gateway/commit/a147d19d16cb0e805b389444bf9dbd59774cdda7))

## 0.1.0 (2026-01-23)


### Features

* add annotation index and dynamic alias ([adff2af](https://github.com/DANS-KNAW/rda-gateway/commit/adff2afd4acc4a28ff59f0d33090783a6d995f57))
* add annotation open vocabularies support ([93ba155](https://github.com/DANS-KNAW/rda-gateway/commit/93ba155e3d946650090b505f47d0d7b1762e6c06))
* add annotation support ([306b08f](https://github.com/DANS-KNAW/rda-gateway/commit/306b08fe212e163cdf5e98a02418eb91f7990b83))
* add annotator update url ([d452502](https://github.com/DANS-KNAW/rda-gateway/commit/d45250251ead28bf7d48a7cd905c982252fb8d3d))
* add deposit indexing and search ([0bb22d0](https://github.com/DANS-KNAW/rda-gateway/commit/0bb22d0c584ff02e4cf6ecdd599fda284bacf6e8))
* add entities new dataset ([b7dc8aa](https://github.com/DANS-KNAW/rda-gateway/commit/b7dc8aa9d212182c18517d5aba7bff876ee10944))
* add force annotator check ([021f3a8](https://github.com/DANS-KNAW/rda-gateway/commit/021f3a83b4e6c7336ce97cfa2d0d50e630032b22))
* add metric and target annotation ([c5324c2](https://github.com/DANS-KNAW/rda-gateway/commit/c5324c2b48761c65962495304152d9dcbdb2b7a3))
* add more robust error handling ([0ed3c6d](https://github.com/DANS-KNAW/rda-gateway/commit/0ed3c6d899e52bdaffcdd6385ac9f1374d3e3555))
* add non generic vocabs to vocab endpoint ([2f6f7ad](https://github.com/DANS-KNAW/rda-gateway/commit/2f6f7ad2c89419732c13033812481da85a2f0d5a))
* add openvocabulary ingest ([38e2d02](https://github.com/DANS-KNAW/rda-gateway/commit/38e2d0256273ff65ee39064a5dc735a60fd64f33))
* add orcid name to annotation creation ([04fe0de](https://github.com/DANS-KNAW/rda-gateway/commit/04fe0de40a4d6fa02b5178e4a76aebb3e007e45c))
* **annotator:** add get min version annotator ([4d7a67e](https://github.com/DANS-KNAW/rda-gateway/commit/4d7a67e345493c6c55bbc98bef476928b3b17080))
* **config:** add IAM config ([bc72569](https://github.com/DANS-KNAW/rda-gateway/commit/bc725696b69c694dd8fdfced7483c61d55d2bc2c))
* **config:** configured config module and zod ([831d738](https://github.com/DANS-KNAW/rda-gateway/commit/831d7382362201e4d41ae59e28aa32fc31407f7a))
* **config:** set config params and core config ([e01a9f8](https://github.com/DANS-KNAW/rda-gateway/commit/e01a9f8582a0be3d927b7b008821380990cc1021))
* create elasticsearch config ([53e1947](https://github.com/DANS-KNAW/rda-gateway/commit/53e19476787a3a3073348827a9003258d61f4554))
* **exceptions:** add error-handler decorator ([bd6515e](https://github.com/DANS-KNAW/rda-gateway/commit/bd6515e16dd0f11273489d353068ece66811d444))
* **ingests:** add pipe for file validation ([c773e3e](https://github.com/DANS-KNAW/rda-gateway/commit/c773e3ee9b17d98fd71663220d021cdf2e41b696))
* **ingests:** initial resource generation ([36e0202](https://github.com/DANS-KNAW/rda-gateway/commit/36e020225d00d675cb171b699b26a27ea7b2aba9))
* **ingests:** setup bullmq configuration ([a19f93a](https://github.com/DANS-KNAW/rda-gateway/commit/a19f93a584b868ef697f8a990462918761f88f76))
* initial nest generation ([d858528](https://github.com/DANS-KNAW/rda-gateway/commit/d8585285ca46c600c3c3424631f0892f1774b5e6))
* **typeorm:** configured inital typeorm client ([480d812](https://github.com/DANS-KNAW/rda-gateway/commit/480d8121f121d564e051f85c50339d1a29c3fb77))
* update elastic ingest for open vocabularies ([acc0a69](https://github.com/DANS-KNAW/rda-gateway/commit/acc0a69f33bde4868913c96dda9b6efe7a6498cd))
* updated extension crow to 10 min ([a3920a8](https://github.com/DANS-KNAW/rda-gateway/commit/a3920a88044d4662b8faab5dfdc3a16cf3ad0f47))
* **validation:** setup global validation pipe ([b567071](https://github.com/DANS-KNAW/rda-gateway/commit/b567071686c29ac48b8e7aeead2930f8f44fd0de))
* **vocabularies:** add archive method ([2a4d4e5](https://github.com/DANS-KNAW/rda-gateway/commit/2a4d4e52e12997c23414704f8d0f11b79e9d35d4))
* **vocabularies:** add create vocabularies method ([26c86e7](https://github.com/DANS-KNAW/rda-gateway/commit/26c86e7e8168dc9819a8a10b9bafc2cc1fefc56f))
* **vocabularies:** add find method ([221768b](https://github.com/DANS-KNAW/rda-gateway/commit/221768b28af57d3cff15bb546746e8e548772070))
* **vocabularies:** add remove method ([db17178](https://github.com/DANS-KNAW/rda-gateway/commit/db171786444e5b5ad0683c1bb05b377aa1b6c680))
* **vocabularies:** add update method ([a5ae5d9](https://github.com/DANS-KNAW/rda-gateway/commit/a5ae5d9ee4ab4db8d0481200c6c00f4dbca17c1e))
* **vocabularies:** add value_scheme primary key ([dc55e90](https://github.com/DANS-KNAW/rda-gateway/commit/dc55e90f9d30d10979734044fd475886a89140c3))
* **vocabularies:** add vocabulary resource ([a62438a](https://github.com/DANS-KNAW/rda-gateway/commit/a62438ae2698aca3eb841c1addcc579c5f72595c))


### Bug Fixes

* **annotations:** resolved wrong uri_type lookup ([c267a58](https://github.com/DANS-KNAW/rda-gateway/commit/c267a5886e321780779bfb13aded9ede7aa17129))
* **config:** Enforced environment being required ([56aa2d5](https://github.com/DANS-KNAW/rda-gateway/commit/56aa2d508890210904364d8727251646a2d379a3))
* **deps:** migrated nest to v11 to resolve security risks ([225061e](https://github.com/DANS-KNAW/rda-gateway/commit/225061ec9bf77e6345968c5ca4ef342189b9f92f))
* **form-data:** updated superset to latest ([ea40c99](https://github.com/DANS-KNAW/rda-gateway/commit/ea40c99b0a3d08e93594ff3432af5cb57e72c3a2))
* **multer:** multer vulnerability patch 2.0.2 ([b97ccf9](https://github.com/DANS-KNAW/rda-gateway/commit/b97ccf908bdcad16cfc7c65a54f9f0ac44576869))
* **multer:** upgraded packages to resolve issue with multer dependency ([bc6e32b](https://github.com/DANS-KNAW/rda-gateway/commit/bc6e32b6631496cceb3e5286b6f1e780514a8edf))
* resolve E2E test failures ([2792fbe](https://github.com/DANS-KNAW/rda-gateway/commit/2792fbe9dd335d180b1b45b58164b2cfc9d3a07f))
* resolve TypeScript compilation errors after lint refactor ([1dbaf76](https://github.com/DANS-KNAW/rda-gateway/commit/1dbaf76ba756343f18bc516fc029b7b66efbacf7))
* resolved bad tests ([df41f6f](https://github.com/DANS-KNAW/rda-gateway/commit/df41f6f2f7840bcdf13fb85cec5e60fe8c16fd1f))
* resolved partial search return ([b92baf8](https://github.com/DANS-KNAW/rda-gateway/commit/b92baf8a61cef9b3f7b9d89be7f9d8fbfbdbc685))


### Styles

* applied style rules of linter and format ([ff7a06d](https://github.com/DANS-KNAW/rda-gateway/commit/ff7a06d23848c601e198784b070ca27cd14f7605))


### Build System

* **debug:** setup docker to allow debugger ([39e9165](https://github.com/DANS-KNAW/rda-gateway/commit/39e9165bafc9b1a49ffb5b645b3f80dc504b47ef))
* **docker:** containerized the application ([d9997ee](https://github.com/DANS-KNAW/rda-gateway/commit/d9997eee534c66d0e651fae1d129313b2aa3f01b))
* **husky:** configured husky as pre-commit hook ([9abbfc8](https://github.com/DANS-KNAW/rda-gateway/commit/9abbfc81372d293f60c844fdf430f616ae0fbf24))


### Documentation

* add debugger and setup documention ([594b764](https://github.com/DANS-KNAW/rda-gateway/commit/594b764ffe7f6da4f9aaa850bebc2d247bda1d5d))
* add documentation both md and swagger ([f79f925](https://github.com/DANS-KNAW/rda-gateway/commit/f79f9254cd1b2b76012e95aa569340a300c5e177))


### Tests

* added test for orcid and create annotation ([8b71512](https://github.com/DANS-KNAW/rda-gateway/commit/8b715120e8e06b6e9e3b9af71f1c7b06eb87f95f))
* **config:** add unit tests for validation schema ([4231a3d](https://github.com/DANS-KNAW/rda-gateway/commit/4231a3dc681e2812eb2bd59453062fd30957f89f))
* **e2e:** add vocabularies e2e tests ([16bf39b](https://github.com/DANS-KNAW/rda-gateway/commit/16bf39bf3687736a1617d8fb2f73ba555dc5541c))
* **vocabularies:** setup mock abstractions ([b594d4e](https://github.com/DANS-KNAW/rda-gateway/commit/b594d4e75d315fd19e07a9505b8c55cbcf4c81d1))


### CI/CD

* add GitHub Actions workflow and conventional versioning ([a4441dc](https://github.com/DANS-KNAW/rda-gateway/commit/a4441dc0aef089cef1ebabc441bee902a0470312))


### Code Refactoring

* env more cleaner and add minio service ([9dafff1](https://github.com/DANS-KNAW/rda-gateway/commit/9dafff1254405cf3cec885b373ebc14a75a03f0f))
* fix all lint errors with proper TypeScript typing ([7f2a751](https://github.com/DANS-KNAW/rda-gateway/commit/7f2a751387d0cc9b9b5b8db1fff214a102fdf41c))

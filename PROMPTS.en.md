# Dev-in.tw Backend — Prompts

This document collects every prompt needed to build this project from scratch, ordered by build phase.
Each block is ready to paste into an AI coding agent (e.g. Claude Code).
Target stack: **NestJS 11 (Express 5) + TypeScript 6 + Mongoose 9 (@nestjs/mongoose) + @nestjs/config + class-validator + @nestjs/swagger + @nestjs/throttler + Biome + pnpm + Jest**.

> Project purpose: the backend of a platform that lets Taiwanese developers register a personal subdomain.
> The backend owns all data and secret exchange — it performs the GitHub OAuth token exchange and talks to
> MongoDB. It runs on `:3001`; the frontend (Next.js) runs on `:3000`.

---

## Phase 0 — Project bootstrap

```
Create a NestJS project with these requirements:
- Use pnpm and TypeScript; keep all source under src/ (NestJS default)
- Platform is Express (@nestjs/platform-express); use @types/express v5
- Pin all packages to the latest stable versions (NestJS 11, TypeScript 6).
  Keep RxJS on 7.x (NestJS 11 peer is ^7 — do NOT jump to RxJS 8)
- Set engines.node to ">=20.19.1" and declare packageManager as pnpm
```

---

## Phase 1 — Tooling: Biome

```
This project uses Biome instead of ESLint + Prettier. Please:
- Install @biomejs/biome (exact/pinned version) and create biome.json
- Code style: double quotes, semicolons, trailing commas "all", 2-space indent, 80 columns, LF
- Enable the recommended rules; turn OFF noExplicitAny; keep noUnusedVariables and
  noUnusedImports at "warn"; noConsole "warn" allowing warn/error
- Enable the import organizer (assist.actions.source.organizeImports)
- CRITICAL for NestJS dependency injection: turn OFF style/useImportType — NestJS DI relies on
  the constructor parameter types emitted via emitDecoratorMetadata, and rewriting injected class
  imports to type-only imports breaks DI at runtime. Also turn off noParameterProperties.
- Set javascript.parser.unsafeParameterDecoratorsEnabled = true (required for @Body()/@Param()/@Inject())
- files.includes should cover the whole project but exclude dist/build/coverage/node_modules;
  enable vcs.useIgnoreFile so .gitignore is respected
- Add package.json scripts: lint = "biome lint --write .", format = "biome format --write .",
  check = "biome check --write .", check:ci = "biome ci ."
```

---

## Phase 2 — TypeScript 6 config (decorator-safe)

```
Configure TypeScript 6 for NestJS. Do NOT rely on TS6's new defaults — pin everything:
- module "commonjs", moduleResolution "node10" (add ignoreDeprecations "6.0"), target "ES2023"
- experimentalDecorators true and emitDecoratorMetadata true
- useDefineForClassFields FALSE — otherwise, at target >= ES2022, declared-but-uninitialised
  class fields are emitted as undefined and clobber decorated DTO / @Prop / entity fields
- esModuleInterop true, types ["node", "jest"], skipLibCheck true
- strict true, but strictPropertyInitialization false (NestJS class fields are populated by
  decorators / the ValidationPipe, so they have no initialiser)
- tsconfig.build.json: extends the base, sets rootDir "./src" (TS6 requires it explicitly),
  and excludes test + **/*spec.ts
- TS6 is ahead of the NestJS peer range (mostly ^5.9); add pnpm.overrides.typescript and
  peerDependencyRules.allowedVersions.typescript so pnpm installs it without peer errors
```

---

## Phase 3 — Environment variables + validation

```
Set up configuration with boot-time validation:
- Install @nestjs/config; register ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env",
  validate: validateEnv })
- src/config/env.validation.ts: an EnvironmentVariables class validated with class-validator
  (MONGO_URI: required string, PORT: optional number, GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET:
  required strings). validateEnv uses plainToInstance + validateSync and throws on any error so
  the app fails fast at boot.
- Always read configuration through the injected ConfigService — never process.env. Use
  getOrThrow() for required values.
- Create .env.example documenting MONGO_URI, PORT, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and make
  sure .gitignore already ignores .env
```

---

## Phase 4 — Database (Mongoose repository pattern)

```
Set up MongoDB using @nestjs/mongoose + mongoose 9, with a repository per model:
- In app.module, register MongooseModule.forRootAsync injecting ConfigService and returning
  { uri: config.getOrThrow("MONGO_URI"), authSource: "admin" }. Do NOT call mongoose.connect manually.
- src/user/schemas/user.schema.ts: a @Schema({ timestamps: true, collection: "user" }) class User
  with @Prop fields githubId, email, name, first_name, last_name, birth, avatar, description,
  badge (string[] via @Prop({ type: [String], default: [] })), beta, warn, disabled, premium.
  Export UserSchema = SchemaFactory.createForClass(User), plus UserWrite = Partial<User> and
  UserLean / UserPublic lean types. Keep collection "user" (the default would pluralise to "users").
- src/user/user.service.ts: an @Injectable UserService injecting the model via @InjectModel.
  Methods readById / createNew / editById / upsertById using .lean(), with a private toPublic()
  mapper that exposes id (from _id) and drops __v.
- src/user/user.module.ts: MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]);
  provide and export UserService.
```

---

## Phase 5 — Cross-cutting infrastructure (src/common)

```
Create the shared infrastructure:
- common/filters/all-exceptions.filter.ts: a @Catch() AllExceptionsFilter that serialises every
  error into { statusCode, error, message, timestamp, path }. HttpExceptions keep their status and
  message; Mongoose CastError / ValidationError map to 400; any 5xx is logged via Nest Logger and
  returned with a generic message (never leak internals). Guard against response.headersSent.
- common/middleware/logger.middleware.ts: a LoggerMiddleware that logs method / url / statusCode /
  ip / user-agent on the response "finish" event, and warns "ABORTED" on a premature "close".
- common/fallback/fallback.controller.ts + fallback.module.ts: a catch-all controller
  @Controller("{*splat}") (Express 5 named wildcard — a bare "*" is invalid under path-to-regexp v8)
  with @All() @HttpCode(404) returning { message: "Incorrect route" }; mark it @ApiExcludeController().
```

---

## Phase 6 — Validation + Swagger

```
Wire global request validation and API docs:
- Install class-validator + class-transformer. In main.ts enable a global ValidationPipe with
  { whitelist: true, forbidNonWhitelisted: true, transform: true,
  transformOptions: { enableImplicitConversion: true } }.
- Install @nestjs/swagger. In main.ts build a DocumentBuilder document and call
  SwaggerModule.setup("docs", app, document). Enable the Swagger CLI plugin in nest-cli.json
  (compilerOptions.plugins: ["@nestjs/swagger"]) so @ApiProperty is inferred from TS types.
- DTOs use class-validator decorators plus @ApiProperty; enums use @IsEnum for both runtime
  validation and a Swagger enum dropdown.
```

---

## Phase 7 — Authentication (GitHub OAuth token exchange)

```
Implement the GitHub OAuth flow (the backend owns the client secret):
- src/auth/github/dto: GithubAuthCodeDto { code: string } (@IsString @IsNotEmpty @ApiProperty);
  plain response DTOs mirroring GitHub's GET /user and GET /user/emails payloads; and
  GithubAccountDataDto that extends the user DTO and adds primary_email.
- src/auth/github/github.service.ts: an @Injectable GithubService injecting ConfigService.
  getGitHubAccountData(code) should: exchange the code at
  https://github.com/login/oauth/access_token using getOrThrow("GITHUB_CLIENT_ID") and
  getOrThrow("GITHUB_CLIENT_SECRET") with scope "user:email"; then fetch GET /user and
  GET /user/emails IN PARALLEL (Promise.all) with the bearer token; return
  { ...userData, primary_email }. On any failure, log via Nest Logger and throw
  UnauthorizedException("Please provide a valid authentication code").
- src/auth/github/github.controller.ts: @Controller("auth/github"), @Post() @HttpCode(200) returning
  { account_data }. Return values directly — no @Res() passthrough; let the exception filter handle errors.
- AuthModule imports GithubModule (controller + service).
```

---

## Phase 8 — Rate limiting

```
Add global rate limiting:
- Install @nestjs/throttler; in app.module register
  ThrottlerModule.forRoot([{ name: "default", ttl: 60000, limit: 100 }])
- Register { provide: APP_GUARD, useClass: ThrottlerGuard } so the limit is actually enforced
  (configuring ThrottlerModule alone does nothing without the guard).
```

---

## Phase 9 — App assembly + bootstrap

```
Assemble the application:
- app.controller.ts: @Controller() with GET / returning { message: "Welcome to Dev-in.tw backend API" }
- app.module.ts imports, in this order: ConfigModule (global + validate), MongooseModule.forRootAsync,
  ThrottlerModule, TestModule, UserModule, AuthModule, and FallbackModule LAST (so its catch-all route
  does not shadow the others). controllers: [AppController]; providers: [{ APP_GUARD: ThrottlerGuard }].
  Implement NestModule.configure to apply LoggerMiddleware.forRoutes("{*splat}").
- main.ts: NestFactory.create(AppModule); enable the global ValidationPipe and AllExceptionsFilter;
  set up Swagger at /docs; read the port via ConfigService.get("PORT") || 3001; await app.listen(port).
- (debug) src/test: a TestController @Controller("test") with GET / -> { message: "test route" } and
  POST / taking { method: "edit" | "create" | "read" } (an @IsEnum DTO) that calls the matching
  UserService method and returns { data }. TestModule imports UserModule.
```

---

## Phase 10 — Testing

```
Set up tests with Jest:
- Install jest 30, ts-jest (stay on the 29.x line — there is NO ts-jest v30; 29.4+ supports Jest 30),
  @types/jest 30, supertest 7, @types/supertest 7, @nestjs/testing.
- Configure the package.json "jest" block: rootDir "src", testRegex ".*\\.spec\\.ts$", a ts-jest
  transform pointing at tsconfig.spec.json, coverageProvider "v8". Add test/jest-e2e.json similarly.
- tsconfig.spec.json: extends the base tsconfig and adds types ["jest", "node"] (TS6 no longer
  auto-loads @types/*, so spec globals would otherwise be missing).
- Unit specs sit beside their source and use Test.createTestingModule with MOCK providers
  (e.g. a mock UserService, a mock ConfigService whose getOrThrow returns a stub, and jest.mock("axios")
  for GithubService) so they never touch a real database.
- e2e (test/app.e2e-spec.ts) boots the full AppModule and asserts GET / returns the welcome message.
```

---

## Phase 11 — Verification

```
Run pnpm build, pnpm exec biome ci ., pnpm test, and pnpm test:e2e, and fix everything until all are
green. Watch out for: TS6 requires an explicit rootDir in tsconfig.build.json; Express 5 / path-to-regexp
v8 forbid a bare "*" wildcard (use "{*splat}" for both @Controller and middleware forRoutes); Biome's
useImportType must stay off for DI; and unused biome-ignore suppression comments will fail biome ci.
```

---

## (Optional) If upgrading an existing project instead of building fresh

```
Upgrade the whole backend to the latest: NestJS 10->11 (Express 4->5), TypeScript 5->6,
Mongoose 8->9 (add @nestjs/mongoose), Jest 29->30, @nestjs/config 3->4, swagger 7->11,
throttler 5->6; bump engines.node to >=20.19.1. Switch from ESLint+Prettier to Biome. Replace the
manual mongoose.connect + static DB helper class with MongooseModule.forRootAsync + an injectable
repository service. Replace @Res() passthrough + per-controller try/catch with return-value
controllers + a global AllExceptionsFilter. Remove unused dependencies (zod, nestjs-zod, dotenv,
source-map-support). Migrate Express 5 wildcard routes to "{*splat}". Acceptance criteria:
pnpm build, biome ci, pnpm test, and pnpm test:e2e all pass.
```

---

## Note — known gap vs. the frontend

The frontend (`../Dev-in.tw-Frontend`) calls `GET /user/info` with a Bearer token to fetch the logged-in
user. That endpoint is **not implemented in this backend yet** — only `POST /auth/github` (token exchange),
`GET /` (welcome), and the debug `/test` route exist. Add an authenticated `GET /user/info` (verify the
token, return the user via `UserService`) when wiring the two sides together.

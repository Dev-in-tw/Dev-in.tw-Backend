# CLAUDE.md

本檔提供給 Claude Code 在此專案工作時的指引。請遵循以下慣例。

## 專案概述

Dev-in.tw 的後端 API，以 **NestJS 11** 建置，使用 **MongoDB（Mongoose）** 儲存資料，並提供 **GitHub OAuth** 登入流程。API 文件由 Swagger 自動產生，掛載於 `/docs`。

## 技術棧

| 類別 | 技術 | 版本 |
| --- | --- | --- |
| Runtime | Node.js | >= 20.19.1（強制；Mongoose 9 / NestJS 11 需求） |
| 套件管理 | pnpm | >= 8.15.4 |
| 框架 | NestJS（Express 5 平台） | 11.x |
| 語言 | TypeScript | 6.x |
| 資料庫 | MongoDB / Mongoose + @nestjs/mongoose | 9.x / 11.x |
| 設定 | @nestjs/config | 4.x |
| 驗證 | class-validator + class-transformer | 0.15 / 0.5 |
| 文件 | @nestjs/swagger | 11.x |
| 限流 | @nestjs/throttler | 6.x |
| Lint + Format | **Biome（取代 ESLint + Prettier）** | 2.5.x |
| 測試 | Jest + ts-jest + supertest | 30 / 29.4 / 7 |

> ⚠️ TypeScript 6 領先 NestJS 11 官方測試範圍（peer 多為 ^5.9），靠 `package.json` 的 `pnpm.overrides.typescript` 與 `peerDependencyRules` 強制安裝。升級相關套件時請留意此相容性。

## 開發指令

```bash
pnpm install          # 安裝依賴
pnpm dev              # 開發模式（watch）
pnpm build            # 編譯到 dist/（nest build → tsc）
pnpm start:prod       # 跑編譯後的 node dist/main

pnpm test             # 單元測試（src/**/*.spec.ts）
pnpm test:e2e         # e2e 測試（test/*.e2e-spec.ts，需可連線的 MongoDB）
pnpm test:cov         # 覆蓋率

pnpm check            # Biome：格式化 + lint 修復 + 整理 import（日常用這個）
pnpm lint             # Biome：只跑 lint --write
pnpm format           # Biome：只跑 format --write
pnpm check:ci         # Biome：唯讀，CI 用（不寫檔，有錯回傳非 0）
```

## 目錄結構

```
src/
├── main.ts                       # 啟動點：ValidationPipe、AllExceptionsFilter、Swagger、listen(PORT)
├── app.module.ts                 # 根模組：ConfigModule、MongooseModule、ThrottlerGuard、middleware
├── app.controller.ts             # GET / 歡迎訊息
├── config/
│   └── env.validation.ts         # 啟動時用 class-validator 驗證環境變數
├── common/
│   ├── filters/
│   │   └── all-exceptions.filter.ts   # 全域例外處理，統一錯誤 JSON
│   ├── middleware/
│   │   └── logger.middleware.ts       # HTTP 請求記錄
│   └── fallback/
│       └── fallback.controller.ts     # 萬用路由 → 404（必須最後註冊）
├── user/
│   ├── schemas/user.schema.ts    # @Schema/@Prop（collection 固定為 "user"）
│   ├── user.service.ts           # repository（@InjectModel）
│   └── user.module.ts            # forFeature + 匯出 UserService
├── auth/
│   ├── auth.module.ts
│   └── github/                   # GitHub OAuth controller/service/dto
└── test/                         # /test 路由（操作 UserService 的測試端點）
test/                             # e2e 測試
```

## 架構慣例（新增功能時請比照辦理）

### 設定與環境變數
- 一律透過注入的 `ConfigService` 讀取設定，**不要**直接用 `process.env`。
- 新增環境變數時：① 加進 `src/config/env.validation.ts` 的 `EnvironmentVariables`；② 補進 `.env.example`；③ 經 `ConfigService` 讀取。缺少必填變數時應用程式會在啟動時直接失敗。
- 環境變數清單見 `.env.example`（`.env` 已被 git 忽略，勿提交）。目前：`MONGO_URI`、`PORT`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`。

### 資料庫（Mongoose repository 模式）
- 連線由 `app.module.ts` 的 `MongooseModule.forRootAsync` 管理（讀 `MONGO_URI`，帶 `authSource: "admin"`）。**不要**自己呼叫 `mongoose.connect`。
- 每個資料模型：在 `<feature>/schemas/*.schema.ts` 用 `@Schema()`/`@Prop()` 定義 → `SchemaFactory.createForClass` → 在 feature module 用 `MongooseModule.forFeature` 註冊 → 寫一個 `@Injectable()` service 以 `@InjectModel` 注入 model 來存取。可參考 `user` 模組。
- 查詢回傳純物件時用 `.lean()`（避免 spread hydrated document 的 bug）。
- `@Schema` 預設會把類別名稱複數化成 collection 名稱；若要對應既有 collection，務必明確指定 `collection`（例如 user 是 `"user"` 不是 `"users"`）。

### 請求驗證
- 全域已啟用 `ValidationPipe`（`whitelist` + `forbidNonWhitelisted` + `transform`）。
- DTO 用 class-validator decorator（`@IsString`、`@IsEnum`…）並搭配 `@ApiProperty`。enum 用 `@IsEnum` 才能同時得到驗證與 Swagger 下拉。

### 錯誤處理
- 直接 `throw` NestJS 的 `HttpException` 子類別（`BadRequestException`、`UnauthorizedException`…）。
- 全域 `AllExceptionsFilter` 會統一序列化成 `{ statusCode, error, message, timestamp, path }`。
- **不要**在 controller 用 `@Res()` 手動回應或自行包 try/catch 回傳錯誤；交給 filter。

### 路由（Express 5 注意）
- path-to-regexp v8 下，萬用字元必須具名：用 `"{*splat}"`，**不可**用裸 `"*"`。
- `FallbackController` 必須是 `app.module.ts` imports 的**最後一個**，以免遮蔽其他路由與 `/docs`。

### 其他
- 限流：全域 `ThrottlerGuard`，預設 60 秒 100 次（設定於 `app.module.ts`）。
- Swagger：`nest-cli.json` 已啟用 `@nestjs/swagger` CLI plugin，會從 TS 型別自動產生 `@ApiProperty`。

## 程式風格與工具（重要）

- **只用 Biome**，沒有 ESLint / Prettier。改完程式請跑 `pnpm check`。
- Biome 設定見 `biome.json`：2 空格縮排、雙引號、結尾分號、`trailingCommas: "all"`、LF。
- `useImportType` 必須**關閉**：NestJS DI 依賴 `emitDecoratorMetadata` 發出的 constructor 參數型別，若被改寫成 type-only import 會導致 DI 在執行期壞掉。
- `unsafeParameterDecoratorsEnabled: true` 是 NestJS 參數 decorator（`@Body()`、`@Param()`…）所需。

## TypeScript 設定注意事項

- `tsconfig.json` 已**明確 pin** 所有關鍵選項，**不要**依賴 TS6 的新預設值（預設會把 `module` 變 esnext、`moduleResolution` 變 bundler、`target` 浮動、`types` 變空、`strict` 開啟）。
- `useDefineForClassFields: false` 為**必要**：否則 `target >= ES2022` 下，未初始化的 class 欄位會被覆寫成 `undefined`，破壞 DTO 驗證與 `@Prop` schema。
- `strict: true` 但 `strictPropertyInitialization: false`（配合 NestJS class 欄位由 decorator 填值的慣例）。
- 三個 tsconfig：`tsconfig.json`（基底）、`tsconfig.build.json`（`nest build`，設 `rootDir: ./src`、排除 test/spec）、`tsconfig.spec.json`（ts-jest 用，加入 `jest` 型別 — TS6 不再自動載入 @types）。

## 測試

- 單元測試與原始碼同層放（`*.spec.ts`），用 `@nestjs/testing` 的 `Test.createTestingModule`，依賴用 mock provider 提供（例如 `{ provide: UserService, useValue: { ... } }`），避免連真實資料庫。
- e2e（`test/`）會載入完整 `AppModule`，因此會嘗試連線 MongoDB；本機需有可連線的 DB。
- 注意：**ts-jest 沒有 v30**，維持 29.4.x（已支援 Jest 30）。

## 升級 / 維護提醒

- 全部套件目前皆為當前 latest 主版本。升級時注意 NestJS / Express / Mongoose / TS 的跨主版本破壞性變更。
- Node 必須 >= 20.19.1。
- 不要把 `rxjs` 升到 8（NestJS 11 peer 鎖 ^7）。

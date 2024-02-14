module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint",
    "import",
  ],
  extends: [
    "plugin:@typescript-eslint/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "semi": [
      "error",
      "always"
    ],
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "quotes": [
      "error",
      "double"
    ],
    "brace-style": [
      "error",
      "stroustrup"
    ],
    "no-console": [
      "warn",
      {
        "allow": [
          "warn",
          "error"
        ]
      }
    ],
    "comma-dangle": [
      "warn",
      "never"
    ],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/newline-after-import": [
      "error",
      {
        "count": 2
      }
    ]
  },
};

export const CustomCode = {
  2000: "OK",

  4000: "Not found",
  4001: "Forbidden",

  5000: "Unknown error"
} as const;

export const CustomStatus = {
  OK: 2000,

  NOT_FOUND: 4000,
  FORBIDDEN: 4001,

  UNKNOWN_ERROR: 5000
} as const;

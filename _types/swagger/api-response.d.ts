import { ApiResponseOptions } from "@nestjs/swagger";
import { HttpStatus } from "_status-code/HTTP";


export type ApiResponse = {
  [key in
    | "@Get"
    | "@Post"
    | "@Put"
    | "@Delete"
    | "@Patch"
    | "@Options"
    | "@Head"]?: {
    [key in keyof typeof HttpStatus]?: ApiResponseOptions;
  };
};

import { ApiResponse } from "_types/swagger/api-response";
import { HttpStatus } from "_status-code/HTTP";


export const root_user_info: ApiResponse = {
  "@Get": {
    OK: {
      status: HttpStatus.OK,
      schema: {
        type: "object",
        properties: {
          accountData: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "User id",
                example: "65e046702c25226231ab07cd"
              },
              userName: {
                type: "string",
                description: "User name (unique)",
                example: "OnCloud125252"
              },
              githubId: {
                type: "string",
                description: "User github id (unique)",
                example: "75195127"
              },
              primaryEmail: {
                type: "string",
                description: "User primary email",
                example: "anonymousaaaa41414141@gmail.com"
              },
              name: {
                type: "string",
                description: "User name",
                example: "OnCloud"
              },
              avatar: {
                type: "string",
                description: "User avatar url",
                example: "https://avatars.githubusercontent.com/u/75195127?v=4"
              },
              description: {
                type: "string",
                description: "User description",
                example:
                  "I'm a student who love coding, computers, and electronics. I always to try and learn new things."
              },
              badge: {
                type: "array",
                description: "User badge list",
                items: {
                  type: "string",
                  description: "Badge name",
                  example: "web_developer"
                }
              },
              beta: {
                type: "boolean",
                description: "User is beta or not",
                example: false
              },
              warn: {
                type: "number",
                description: "User warn count",
                example: 0
              },
              disabled: {
                type: "boolean",
                description: "User is disabled or not",
                example: false
              },
              premium: {
                type: "boolean",
                description: "User is premium or not",
                example: false
              },
              createdAt: {
                type: "string",
                description: "User creation date",
                example: "2024-02-29T08:55:12.318Z"
              },
              updatedAt: {
                type: "string",
                description: "User last update date",
                example: "2024-03-01T21:30:00.276Z"
              }
            }
          }
        }
      },
      description: "Get private user info"
    },
    UNAUTHORIZED: {
      status: HttpStatus.UNAUTHORIZED,
      schema: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
            example: "Please provide a valid token"
          }
        }
      },
      description: "Invalid token"
    }
  }
};

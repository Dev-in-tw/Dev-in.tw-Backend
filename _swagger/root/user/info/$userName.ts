import { ApiResponse } from "_types/swagger/api-response";
import { HttpStatus } from "_status-code/HTTP";


export const root_user_info_$userName: ApiResponse = {
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
                items: {
                  type: "string",
                  description: "Badge name",
                  example: "web_developer"
                }
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
              }
            }
          }
        }
      },
      description: "Get public user info"
    },
    NOT_FOUND: {
      status: HttpStatus.NOT_FOUND,
      schema: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
            example: "Please provide a valid user name"
          }
        }
      },
      description: "User not found"
    }
  }
};

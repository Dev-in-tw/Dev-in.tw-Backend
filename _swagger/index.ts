import { root_user_info_$userName } from "./root/user/info/$userName";
import { root_user_info } from "./root/user/info/_";


export const SwaggerMetadata = {
  root: {
    user: {
      info: {
        _: {
          apiResponse: root_user_info
        },
        $userName: {
          apiResponse: root_user_info_$userName
        }
      }
    }
  }
};

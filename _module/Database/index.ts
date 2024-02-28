import * as userFunction from "./user";

import { UserWrite } from "_types/database/user";


export class User {
  static read = {
    byId: async (id: string) => {
      return await userFunction.readById(id);
    },
    byGithubId: async (githubId: string) => {
      return await userFunction.readByGithubId(githubId);
    }
  };

  static write = {
    create: async (dataToSave: UserWrite) => {
      return await userFunction.createNew(dataToSave);
    },
    upsertById: async (id: string, dataToSave: UserWrite) => {
      return await userFunction.upsertById(id, dataToSave);
    }
  };

  static edit = {
    byId: async (id: string, dataToSave: UserWrite) => {
      return await userFunction.editById(id, dataToSave);
    }
  };
}

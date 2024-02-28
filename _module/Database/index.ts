import { createNew, readById, editById, upsertById } from "./user";

import { UserWrite } from "_types/database/user";


export class User {
  static read = {
    byId: async (id: string) => {
      return await readById(id);
    }
  };

  static write = {
    create: async (dataToSave: UserWrite) => {
      return await createNew(dataToSave);
    },
    upsertById: async (id: string, dataToSave: UserWrite) => {
      return await upsertById(id, dataToSave);
    }
  };

  static edit = {
    byId: async (id: string, dataToSave: UserWrite) => {
      return await editById(id, dataToSave);
    }
  };
}

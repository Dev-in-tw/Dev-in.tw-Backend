import { createNew, readById, editById, upsertById } from "./user";

import { UserWrite } from "_types/database/user";


export class UserDB {
  static read = {
    readById: async (id: string) => {
      return await readById(id);
    }
  };

  static write = {
    editById: async (id: string, dataToSave: UserWrite) => {
      return await editById(id, dataToSave);
    },
    create: async (dataToSave: UserWrite) => {
      return await createNew(dataToSave);
    },
    upsertById: async (id: string, dataToSave: UserWrite) => {
      return await upsertById(id, dataToSave);
    }
  };
}

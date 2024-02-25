import { writeById } from "./user";


export default class UserDB {
  static async writeById(id: string, dataToSave: any) {
    return await writeById(id, dataToSave);
  }
}

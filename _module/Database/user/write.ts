import { User, UserSchema, UserWrite } from "_types/database/user";
import profile from "_module/Database/_schema/user";


export function writeById(id: string, dataToSave: UserWrite) {
  return writeData("_id", id, dataToSave);
}

async function writeData(key: string, value: any, dataToSave: UserWrite) {
  try {
    const data = await profile.findOne({ [key]: value });
    const code = data ? 1 : 0;

    let newData: UserSchema;
    if (code) {
      newData = await profile.findOneAndUpdate({ [key]: value }, dataToSave, {
        new: true
      });
    }
    else {
      newData = (await profile.create(dataToSave)) as unknown as UserSchema;
    }

    return {
      ...newData,
      id: newData._id
    } as User;
  }
  catch (error) {
    throw new Error(error.message);
  }
}

async function createData(dataToSave: UserWrite) {
  try {
    const newData = (await profile.create(dataToSave)) as unknown as UserSchema;

    return {
      ...newData,
      id: newData._id
    } as User;
  }
  catch (error) {
    throw new Error(error.message);
  }
}

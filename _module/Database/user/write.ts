import { User, UserSchema, UserWrite } from "_types/database/user";
import { CustomError } from "_module/CustomError";
import profile from "_module/Database/_schema/user";


export function editById(id: string, dataToSave: UserWrite) {
  return editData("_id", id, dataToSave);
}

export async function createNew(dataToSave: UserWrite) {
  return createData(dataToSave);
}

export async function upsertById(id: string, dataToSave: UserWrite) {
  return upsertData("_id", id, dataToSave);
}

async function editData(key: string, value: any, dataToSave: UserWrite) {
  try {
    const newData = (await profile.findOneAndUpdate(
      { [key]: value },
      dataToSave,
      {
        new: true
      },
    )) as unknown as UserSchema;

    return {
      ...newData,
      id: newData._id
    } as User;
  }
  catch (error) {
    new CustomError(
      `Error while editing data with key '${key}' and value '${value}'`,
    ).func(editData);
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
    console.error(error);

    new CustomError(
      `Error while creating new user with data:\n${JSON.stringify(
        dataToSave,
        null,
        2,
      )}`,
    ).func(createData);
  }
}

async function upsertData(key: string, value: any, dataToSave: UserWrite) {
  try {
    const newData = (await profile.findOneAndUpdate(
      { [key]: value },
      dataToSave,
      {
        new: true,
        upsert: true
      },
    )) as unknown as UserSchema;

    return {
      ...newData,
      id: newData._id
    } as User;
  }
  catch (error) {
    throw new Error(
      `Error while upserting new user with key '${key}', value '${value}' and data:\n${JSON.stringify(
        dataToSave,
        null,
        2,
      )}`,
    );
  }
}

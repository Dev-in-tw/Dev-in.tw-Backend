import { User, UserSchema, UserWrite } from "_types/database/user.dto";
import { CustomError } from "_module/CustomError";
import profile from "_module/Database/_schema/user";
import { cleanDbObject } from "_module/CleanDbObject";


export function editById(id: string, dataToSave: UserWrite) {
  return editData("_id", id, dataToSave);
}

export function editByGithubId(id: string, dataToSave: UserWrite) {
  return editData("githubId", id, dataToSave);
}

export async function createNew(dataToSave: UserWrite) {
  return createData(dataToSave);
}

export async function upsertById(id: string, dataToSave: UserWrite) {
  return upsertData("_id", id, dataToSave);
}

async function editData(
  key: keyof UserSchema,
  value: any,
  dataToSave: UserWrite,
) {
  try {
    const newData = (
      await profile.findOneAndUpdate({ [key]: value }, dataToSave, {
        new: true
      })
    ).toObject() as UserSchema;

    const cleanData = cleanDbObject<User>(newData);
    return cleanData;
  }
  catch (error) {
    new CustomError(
      `Error while editing data with key '${key}' and value '${value}'`,
    ).func(editData);
  }
}

async function createData(dataToSave: UserWrite) {
  try {
    const newData = (await profile.create(dataToSave)).toObject() as UserSchema;

    const cleanData = cleanDbObject<User>(newData);
    return cleanData;
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

async function upsertData(
  key: keyof UserSchema,
  value: any,
  dataToSave: UserWrite,
) {
  try {
    const newData = (
      await profile.findOneAndUpdate({ [key]: value }, dataToSave, {
        new: true,
        upsert: true
      })
    ).toObject() as UserSchema;

    const cleanData = cleanDbObject<User>(newData);
    return cleanData;
  }
  catch (error) {
    new CustomError(
      `Error while upserting new user with key '${key}', value '${value}' and data:\n${JSON.stringify(
        dataToSave,
        null,
        2,
      )}`,
    ).func(upsertData);
  }
}

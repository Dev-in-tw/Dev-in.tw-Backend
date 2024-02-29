import { User, UserSchema } from "_types/database/user";
import { CustomError } from "_module/CustomError";
import profile from "_module/Database/_schema/user";
import { cleanDbObject } from "_module/CleanDbObject";


export async function readById(id: string) {
  return await readData("_id", id);
}

export async function readByGithubId(githubId: string) {
  return await readData("githubId", githubId);
}

export async function readByUserName(userName: string) {
  return await readData("userName", userName);
}

async function readData(key: keyof UserSchema, value: any) {
  try {
    const data = await profile.findOne({
      [key]: value
    });

    if (!data) {
      new CustomError(
        `Error while reading data with key '${key}' and value '${value}'`,
      ).default();
    }

    const dataToReturn = data.toObject() as UserSchema;

    const cleanData = cleanDbObject<User>(dataToReturn);
    return cleanData;
  }
  catch (error: any) {
    new CustomError(
      `Error while reading data with key '${key}' and value '${value}'`,
    ).func(readData);
  }
}

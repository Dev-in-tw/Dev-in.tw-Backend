import { User, UserSchema } from "_types/database/user";
import { CustomError } from "_module/CustomError";
import profile from "_module/Database/_schema/user";


export async function readById(id: string) {
  return await readData("_id", id);
}

export async function readByGithubId(githubId: string) {
  return await readData("githubId", githubId);
}

async function readData(key: keyof UserSchema, value: any) {
  try {
    const data = (
      await profile.findOne({
        [key]: value
      })
    ).toObject() as UserSchema;

    if (!data) {
      new CustomError(
        `Error while reading data with key '${key}' and value '${value}'`,
      ).default();
    }

    const cleanData = {
      id: data._id,
      ...data,
      _id: undefined
    } as User;
    return cleanData;
  }
  catch (error: any) {
    console.error(error);

    new CustomError(
      `Error while reading data with key '${key}' and value '${value}'`,
    ).func(readData);
  }
}

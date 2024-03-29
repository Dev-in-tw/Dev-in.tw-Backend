import { User, UserSchema } from "_types/database/user";
import { CustomError } from "_module/CustomError";
import profile from "_module/Database/_schema/user";


export async function readById(id: string) {
  return await readData("_id", id);
}

async function readData(key: string, value: any) {
  try {
    const data = (await profile.findOne({
      [key]: value
    })) as unknown as UserSchema;

    if (!data) {
      new CustomError(
        `Error while reading data with key '${key}' and value '${value}'`,
      ).default();
    }

    return {
      ...data,
      id: data._id
    } as User;
  }
  catch (error: any) {
    console.error(error);

    new CustomError(
      `Error while reading data with key '${key}' and value '${value}'`,
    ).func(readData);
  }
}

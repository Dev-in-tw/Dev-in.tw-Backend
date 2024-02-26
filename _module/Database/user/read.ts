import { User, UserSchema } from "_types/database/user";
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
      throw new Error("User not found");
    }

    return {
      ...data,
      id: data._id
    } as User;
  }
  catch (error: any) {
    throw new Error(error.message);
  }
}

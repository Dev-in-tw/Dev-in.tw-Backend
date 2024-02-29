export function cleanDbObject<T>(data: { [key: string]: any }) {
  return {
    id: data._id,
    ...data,
    _id: undefined,
    __v: undefined
  } as T;
}

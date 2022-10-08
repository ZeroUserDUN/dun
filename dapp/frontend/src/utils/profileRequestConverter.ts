import { UserProfileRequest } from '~/api';
import { uploadFile } from '~/files-api';
import { toNullable } from '~/utils/typeConverters';

export type FormValue = {
  isTutor: boolean;
  lastName: string;
  firstName: string;
  aboutMe?: string;
  photo?: File;
  email?: string;
};
export const profileRequestConverter = async (
  value: FormValue,
): Promise<UserProfileRequest> =>
  (Object.keys(value) as Array<keyof typeof value>).reduce(async (acc, key) => {
    const res = await acc;
    if (['aboutMe', 'email'].includes(key)) {
      return { ...res, [key]: toNullable(value[key]) };
    }
    if (key === 'photo') {
      const imageId: UserProfileRequest['imageId'] = [];
      if (value[key]) {
        // @ts-ignore
        imageId[0] = await uploadFile(value[key] as File);
      }
      return { ...res, imageId };
    }
    return { ...res, [key]: value[key] };
  }, Promise.resolve({} as UserProfileRequest));

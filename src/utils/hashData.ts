import * as bcrypt from 'bcrypt';

export const hashData = async (data: string) => {
  return await bcrypt.hash(data, 10);
};

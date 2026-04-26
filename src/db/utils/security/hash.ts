import bcrypt from 'bcrypt';

export const CreateHash = async (data: string): Promise<string> => {
  return await bcrypt.hash(data, 10);
};

export const CompareHash = async (
  text: string,
  hashText: string,
): Promise<boolean> => {
  return await bcrypt.compare(text, hashText);
};

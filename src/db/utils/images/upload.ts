/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import cloudinary from './config';
import { Readable } from 'stream';

export const uploadBufferToCloudinary = (fileBuffer: Buffer) => {
  return new Promise<object>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'trips' },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result?.secure_url as string,
          public_id: result?.public_id as string,
        });
      },
    );
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    bufferStream.pipe(stream);
  });
};

export const deleteImage = async (public_id: string) => {
  await cloudinary.uploader.destroy(public_id);
};

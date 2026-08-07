import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary'

export class UploadService {
    public uploadImage = (buffer: Buffer): Promise<string> => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'eventful/events', resource_type: 'image' }, (error, result?: UploadApiResponse) => {
                if (error || !result) {
                    reject(error ?? new Error('UPLOAD_FAILED'));
                    return;
                }
                 resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  };
}
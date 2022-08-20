import cloudinary from 'src/server/file-service/client';

export const uploadImage = async (url: string) => {
    try {
        const result = cloudinary.uploader.upload(url, {
            use_filename: true,
            unique_filename: true,
            overwrite: true,
        });
        console.log(result);
        return result;
    } catch (e) {
        console.log(e);
    }
};

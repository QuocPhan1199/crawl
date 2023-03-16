const download = require('image-downloader');

const root_path = __dirname;
const folder_path = root_path + "/images";

const downloadImage = async (url,folder=folder_path) => {
    try {
        const { filename } = await download.image({
            url: url,
            dest: folder
        });
        return filename.replace(root_path,"");
    } catch (error) {
        console.log(error);
        return false;
    }

}

const downloadGallery = async (images,folder=folder_path) => {
    let list_images = [];
    for (let index = 0; index < images.length; index++) {
        let file_path = await downloadImage(images[index],folder);
        list_images.push(file_path);
    }
    return list_images;
}
module.exports  = {downloadImage,downloadGallery}

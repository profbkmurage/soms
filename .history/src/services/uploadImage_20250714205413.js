import axios from "axios";

const cloudName = " 401";
const uploadPreset = "7cb2f3ea-75d8-4a25-81ea-0f5c52560e1b";

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await axios.post(url, formData);
    return response.data.secure_url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};

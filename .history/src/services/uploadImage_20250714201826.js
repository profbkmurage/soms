import axios from "axios";

const cloudName = "YOUR_CLOUD_NAME";
const uploadPreset = "YOUR_UNSIGNED_UPLOAD_PRESET";

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

// services/ociService.js
import axios from "axios";

const OCI_BASE_URL =
  "https://websprint.mytvspartsmart.in/storage-service/api/v1/storage/oci";

// ✅ Create axios instance with Basic Auth
const ociAxios = axios.create({
  baseURL: OCI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    // Works for both CRA and Vite
    username:
      import.meta?.env?.VITE_OCI_USERNAME ||
      process.env.REACT_APP_OCI_USERNAME,
    password:
      import.meta?.env?.VITE_OCI_PASSWORD ||
      process.env.REACT_APP_OCI_PASSWORD,
  },
});

// 📁 1. List OCI files
export const listOCI = async (path = "") => {
  try {
    const response = await ociAxios.post("/list", { path });
    return response.data; // should have .data property with files
  } catch (error) {
    console.error("❌ Error listing OCI files:", error.response?.data || error.message);
    throw error;
  }
};

// 🖼️ 2. Read OCI file
export const readOCIFile = async (filePath) => {
  try {
    const response = await axios.get(
      // ✅ fixed the URL (removed duplicate /storage/)
      `https://websprint.mytvspartsmart.in/storage-service/api/v1/storage/oci/read/${filePath}`,
      {
        responseType: "blob",
        auth: {
          username:
            import.meta?.env?.VITE_OCI_USERNAME ||
            process.env.REACT_APP_OCI_USERNAME,
          password:
            import.meta?.env?.VITE_OCI_PASSWORD ||
            process.env.REACT_APP_OCI_PASSWORD,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error reading OCI file:", error.response?.data || error.message);
    throw error;
  }
};

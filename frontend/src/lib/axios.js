import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5001/api"
      : "https://gramchat-2.onrender.com/api",
  withCredentials: true,
});

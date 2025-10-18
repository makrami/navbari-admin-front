import axios from "axios";
import { ENV } from "./env";

export const http = axios.create({
  baseURL: ENV.API_BASE_URL,
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    // Normalize and rethrow
    return Promise.reject(error);
  }
);



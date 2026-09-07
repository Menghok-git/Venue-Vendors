import axios from "axios";

//backend base URL comes from NEXT_PUBLIC_API_URL (see .env.local). Defaults to local dev.
const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001") + "/api";

const api = axios.create({ baseURL });

//attach the saved JWT to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vv_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

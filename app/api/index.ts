import { createApiClient } from "./client";
import { useUserStore } from "../stores/userStore";

const baseURL = import.meta.env.VITE_API_URL?.trim();
if (!baseURL) throw new Error("Thiếu VITE_API_URL. Hãy sao chép .env.example thành .env và khởi động lại Vite.");

const api = createApiClient({
  baseURL,
  getToken: () => typeof window === "undefined" ? null : window.localStorage.getItem("access_token"),
  onUnauthorized: () => {
    window.localStorage.removeItem("access_token");
    useUserStore.getState().logout();
  },
});

export default api;

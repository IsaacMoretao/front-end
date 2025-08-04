import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3333"
})
// http://localhost:3333
// https://backend-kids.onrender.com

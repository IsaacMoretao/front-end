import axios from "axios";

export const api = axios.create({
  baseURL: 'https://backend-kids.onrender.com'
})
// http://localhost:3333
// https://backend-kids.onrender.com
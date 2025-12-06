import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // change for production
  timeout: 60000
});

export default api;

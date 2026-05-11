import axios from "axios";

const API = axios.create({
  baseURL: "http://YOUR_IP:3000/api",
});

export default API;
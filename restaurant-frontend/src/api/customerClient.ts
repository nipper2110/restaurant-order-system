import axios from "axios";

// Customers never log in — this client intentionally skips credentials and
// the admin client's 401-redirect-to-login interceptor.
const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default customerApi;

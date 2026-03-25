// import axios from 'axios';

// const client = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
// });

// // REQUEST INTERCEPTOR: Attach Token to every request
// client.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token'); // or however you store your JWT
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // RESPONSE INTERCEPTOR: Handle 401 globally (optional but recommended)
// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Logic to logout user or redirect to login if token is invalid
//       console.warn("Session expired or unauthorized");
//     }
//     return Promise.reject(error);
//   }
// );

// export default client;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mrm-niu2.onrender.com';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  // Required if you ever decide to use HttpOnly cookies alongside tokens
  withCredentials: true, 
});

// THE FIX: This interceptor runs BEFORE every single request
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Must be 'Bearer ' followed by the token string
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Clearing token...");
      localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default client;
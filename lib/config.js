// API configuration for different environments
const config = {
  development: {
    apiUrl: "http://localhost:8080",
  },
  production: {
    apiUrl: "https://rws-qb-backend.onrender.com",
  },
};

// Determine environment - in production, NODE_ENV will be 'production'
const environment =
  process.env.NODE_ENV === "production" ? "production" : "development";

export const API_URL = config[environment].apiUrl;

import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.MODE === 'production' ? "https://cryptomoon.onrender.com" : "http://127.0.0.1:8000",
})



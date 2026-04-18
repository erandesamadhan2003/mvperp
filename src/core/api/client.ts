import axios from "axios";
import { API_BASE_URL } from "../utils/APIURL";
import { setupInterceptors } from "./interceptors";

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

setupInterceptors(api);
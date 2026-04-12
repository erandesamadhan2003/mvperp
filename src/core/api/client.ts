import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
});
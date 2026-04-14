import { api } from "@/core/api/client";
import { NEWS_AND_ANNOUNCEMENT_URL, ORGINAZATION_INFO_URL } from "@/core/utils/constant";
import {
    ApiListResponse,
    NewsAndAnnouncement,
    OrganizationInfo,
} from "../types/organizationInfo.types";

export const getOrganizationInfo = async (): Promise<OrganizationInfo[]> => {
    try {
        const response = await api.get<ApiListResponse<OrganizationInfo>>(ORGINAZATION_INFO_URL);
        return response.data.ResponseData ?? [];
    } catch (error: any) {
        console.error("Failed to fetch organization info:", error);
        throw error;
    }
}


export const getNewsAndAnnouncements = async (): Promise<NewsAndAnnouncement[]> => {
    try {
        const response = await api.get<ApiListResponse<NewsAndAnnouncement>>(NEWS_AND_ANNOUNCEMENT_URL);
        return response.data.ResponseData ?? [];
    } catch (error: any) {
        console.error("Failed to fetch news and announcements:", error);
        throw error;
    }
}
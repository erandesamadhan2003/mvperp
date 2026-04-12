import { api } from "../api/client";
import { OrganizationInfo } from "../types/organizationInfo.types";
import { ORGINAZATION_INFO_URL } from "../utils/constant";

export const getOrganizationInfo = async (): Promise<OrganizationInfo> => {
    try {
        const response = await api.get(ORGINAZATION_INFO_URL);
        return response.data.ResponseData;
    } catch (error: any) {
        console.error("Failed to fetch organization info:", error);
        throw error;
    }
}
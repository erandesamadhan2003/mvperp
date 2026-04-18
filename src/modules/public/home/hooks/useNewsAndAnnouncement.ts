"use client";

import { useQuery } from "@tanstack/react-query";
import { NewsAndAnnouncement } from "../types/organizationInfo.types";
import { getNewsAndAnnouncements } from "../services/newsAndAnnouncement.service";

export const useNewsAndAnnouncement = () => {
	return useQuery<NewsAndAnnouncement[]>({
		queryKey: ["news-and-announcements"],
		queryFn: getNewsAndAnnouncements,

		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,

		refetchOnWindowFocus: true,      
		refetchOnReconnect: true,        
		refetchOnMount: false,           

		retry: 2,                        
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),

		placeholderData: (prev) => prev,
	});
};
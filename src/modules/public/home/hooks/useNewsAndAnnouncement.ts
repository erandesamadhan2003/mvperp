"use client";

import { useQuery } from "@tanstack/react-query";
import { getNewsAndAnnouncements } from "@/modules/public/home/services/newsAndAnnouncement.service";
import type { NewsAndAnnouncement } from "../types/organizationInfo.types";

const FIVE_MINUTES = 5 * 60 * 1000;

export const useNewsAndAnnouncement = () => {
    return useQuery<NewsAndAnnouncement[]>({
        queryKey: ["news-and-announcements"],
        queryFn: getNewsAndAnnouncements,
        staleTime: FIVE_MINUTES,
        gcTime: FIVE_MINUTES,
        refetchOnWindowFocus: false,
    });
};

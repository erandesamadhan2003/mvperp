"use client";

import Link from "next/link";
import { Dot } from "lucide-react";
import { useMemo } from "react";
import { useNewsAndAnnouncement } from "@/modules/public/home/hooks/useNewsAndAnnouncement";

const MIN_ITEMS_TO_SCROLL = 4;

export function NewsAndAnnouncement() {
    const { data, isLoading, isError, isFetching } = useNewsAndAnnouncement();
    const announcements = data ?? [];
    const marqueeItems = useMemo(() => {
        if (announcements.length < MIN_ITEMS_TO_SCROLL) {
            return announcements;
        }

        return [...announcements, ...announcements];
    }, [announcements]);

    const scrollClassName = announcements.length < MIN_ITEMS_TO_SCROLL
        ? "news-scroll-track news-scroll-track-static"
        : "news-scroll-track";

    return (
        <aside className="w-full max-w-120 overflow-hidden rounded-sm border border-slate-300 bg-[#f3f4f6] shadow-xl">
            <div className="bg-[#e33f3f] px-5 py-3 text-xl font-semibold tracking-wide text-white md:text-2xl">
                News &amp; Announcements
            </div>

            <div className="h-120 overflow-hidden px-3 py-3">
                {isLoading && announcements.length === 0 && (
                    <p className="px-2 text-sm font-medium text-slate-600 md:text-base">
                        Loading announcements...
                    </p>
                )}
                {isFetching && announcements.length > 0 && (
                    <p className="text-xs text-gray-500 px-2">Refreshing...</p>
                )}
                {isError && (
                    <p className="px-2 text-sm font-medium text-red-600 md:text-base">
                        Unable to load announcements right now.
                    </p>
                )}

                {!isLoading && !isError && announcements.length === 0 && (
                    <p className="px-2 text-sm font-medium text-slate-700 md:text-base">No announcements available.</p>
                )}

                {!isLoading && !isError && announcements.length > 0 && (
                    <div className={scrollClassName}>
                        {marqueeItems.map((item, index) => (
                            <article
                                key={`${item.ID}-${index}`}
                                className="mb-3 border-b border-slate-300/70 pb-3 last:border-b-0"
                            >
                                <h3 className="flex items-start gap-1.5 text-sm font-semibold leading-5 text-[#d63b3b] md:text-base">
                                    <Dot className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6fab]" />
                                    {item.MessageHeader}
                                </h3>

                                {item.Details && (
                                    <p className="mt-1.5 px-5 text-sm leading-6 text-slate-700 md:text-[15px]">
                                        {item.Details}
                                    </p>
                                )}

                                {item.RefURL && (
                                    <Link
                                        href={item.RefURL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1.5 inline-block px-5 text-sm font-semibold text-blue-700 hover:underline md:text-[15px]"
                                    >
                                        Read More
                                    </Link>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

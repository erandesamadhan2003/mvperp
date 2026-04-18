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
        <aside className="erp-surface w-full max-w-120 overflow-hidden rounded-2xl">
            <div className="erp-topbar px-5 py-3 text-xl font-semibold tracking-wide text-white md:text-2xl">
                News &amp; Announcements
            </div>

            <div className="h-120 overflow-hidden px-3 py-3">
                {isLoading && announcements.length === 0 && (
                    <p className="px-2 text-sm font-medium text-(--erp-text-muted) md:text-base">
                        Loading announcements...
                    </p>
                )}
                {isFetching && announcements.length > 0 && (
                    <p className="px-2 text-xs text-(--erp-text-muted)">Refreshing...</p>
                )}
                {isError && (
                    <p className="px-2 text-sm font-medium text-amber-700 md:text-base">
                        Unable to load announcements right now.
                    </p>
                )}

                {!isLoading && !isError && announcements.length === 0 && (
                    <p className="px-2 text-sm font-medium text-(--erp-text-muted) md:text-base">No announcements available.</p>
                )}

                {!isLoading && !isError && announcements.length > 0 && (
                    <div className={scrollClassName}>
                        {marqueeItems.map((item, index) => (
                            <article
                                key={`${item.ID}-${index}`}
                                className="mb-3 border-b border-(--erp-border)/75 pb-3 last:border-b-0"
                            >
                                <h3 className="flex items-start gap-1.5 text-sm font-semibold leading-5 text-(--erp-primary-900) md:text-base">
                                    <Dot className="mt-0.5 h-4 w-4 shrink-0 text-(--erp-accent)" />
                                    {item.MessageHeader}
                                </h3>

                                {item.Details && (
                                    <p className="mt-1.5 px-5 text-sm leading-6 text-(--erp-text-muted) md:text-[15px]">
                                        {item.Details}
                                    </p>
                                )}

                                {item.RefURL && (
                                    <Link
                                        href={item.RefURL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1.5 inline-block px-5 text-sm font-semibold text-(--erp-accent) hover:text-(--erp-accent-strong) hover:underline md:text-[15px]"
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

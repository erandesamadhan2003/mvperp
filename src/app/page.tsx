import { NewsAndAnnouncement } from "@/modules/public/home/components/NewsAndAnnouncement";
import { Navbar } from "@/shared/components/layouts/Navbar";
import Image from "next/image";

export default function Page() {
    return (
        <main className="erp-page-shell min-h-screen">
            <Navbar />

            <section className="relative mx-auto h-110 w-full max-w-384 overflow-hidden rounded-b-3xl border-x border-b border-(--erp-border) shadow-[0_24px_55px_rgba(16,35,56,0.12)] md:h-140">
                <Image
                    src="/HomePagebg.png"
                    alt="MVP ERP homepage background"
                    fill
                    priority
                    className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-linear-to-r from-[rgba(11,29,56,0.5)] via-[rgba(14,116,144,0.22)] to-[rgba(11,29,56,0.62)]" />

                <div className="relative z-10 flex h-full items-start justify-end px-2 pt-2 md:px-6 md:pt-3">
                    <NewsAndAnnouncement />
                </div>
            </section>
        </main>
    );
}

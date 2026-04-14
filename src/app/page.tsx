import { NewsAndAnnouncement } from "@/modules/public/home/components/NewsAndAnnouncement";
import { Navbar } from "@/shared/components/layouts/Navbar";
import Image from "next/image";

export default function Page() {
  return (
          <main className="min-h-screen bg-[#e5e5e5]">
              <Navbar />
  
              <section className="relative h-110 overflow-hidden md:h-140">
                  <Image
                      src="/HomePagebg.png"
                      alt="MVP ERP homepage background"
                      fill
                      priority
                      className="object-cover object-center"
                  />
  
                  <div className="absolute inset-0 bg-linear-to-r from-sky-500/25 via-sky-200/10 to-sky-700/25" />
  
                  <div className="relative z-10 flex h-full items-start justify-end px-2 pt-2 md:px-6 md:pt-3">
                      <NewsAndAnnouncement />
                  </div>
              </section>
          </main>
      );
}

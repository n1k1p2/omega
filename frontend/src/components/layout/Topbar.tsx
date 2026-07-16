import { Phone, Clock } from "lucide-react";
import Link from "next/link";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, SUPPORT_HOURS } from "@/lib/api";

export function Topbar() {
  return (
    <div className="hidden h-9 items-center bg-[var(--color-dark)] text-white sm:flex">
      <div className="container-omega flex w-full items-center justify-between text-[13px]">
        <div className="flex items-center gap-5">
          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="flex items-center gap-1.5 hover:text-[var(--color-brass-footer)]"
          >
            <Phone size={13} className="text-[var(--color-brass-footer)]" />
            {SUPPORT_PHONE}
          </a>
          <span className="hidden items-center gap-1.5 text-white/70 md:flex">
            <Clock size={13} />
            {SUPPORT_HOURS}
          </span>
        </div>
        <Link href="/delivery" className="text-white/80 hover:text-white">
          Доставка и оплата
        </Link>
      </div>
    </div>
  );
}

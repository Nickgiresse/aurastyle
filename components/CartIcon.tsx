"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function CartIcon() {
  const itemCount = useCartStore((state) => state.itemCount);

  return (
    <Link
      href="/panier"
      className="relative flex items-center justify-center rounded-full p-2 transition-colors hover:bg-gray-100"
      aria-label={`Panier (${itemCount} articles)`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00BCD4] px-1.5 text-xs font-medium text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

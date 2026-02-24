"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryCardProps {
  name: string;
  image: string;
  description?: string;
  href?: string;
}

export default function CategoryCard({
  name,
  image,
  description,
  href = "/boutique",
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <motion.div
        className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100"
        whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={image}
            alt={name}
            width={400}
            height={500}
            className="h-full w-full object-cover"
          />
        </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-semibold">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-white/90">{description}</p>
        )}
        <span className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-[#00BCD4]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      </motion.div>
    </Link>
  );
}

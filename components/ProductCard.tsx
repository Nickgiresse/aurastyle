"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, type Product } from "@/lib/api";

const WISHLIST_KEY = "aura-wishlist";

function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

function toggleWishlist(id: string): string[] {
  const current = getWishlist();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  return next;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(getWishlist().includes(product.id));
  }, [product.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWishlist(product.id);
    setIsWishlisted(next.includes(product.id));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link href={`/boutique/${product.id}`}>
      <motion.div
        className="group relative flex flex-col overflow-hidden rounded-lg bg-white"
        whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className="relative aspect-[4/5] overflow-hidden bg-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={500}
            className="h-full w-full object-cover"
          />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded bg-[#00BCD4] px-2 py-0.5 text-xs font-medium text-white">
            {product.badge}
          </span>
        )}
        <button
          onClick={handleWishlistClick}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-white"
          aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#00BCD4" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        </motion.div>
        <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {product.category}
        </span>
        <h3 className="mt-1 font-medium text-[#111]">{product.name}</h3>
        <p className="mt-2 text-lg font-semibold text-[#00BCD4]">
          {formatPrice(product.price)}
        </p>
        <button
          onClick={handleAddToCart}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#00BCD4] py-2 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Ajouter au panier
        </button>
        </div>
      </motion.div>
    </Link>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AnimateStagger from "@/components/AnimateStagger";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, type Product } from "@/lib/api";

interface ProductDetailClientProps {
  product: Product;
  similarProducts: Product[];
}

export default function ProductDetailClient({
  product,
  similarProducts,
}: ProductDetailClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const sizes = product.sizes ?? ["S", "M", "L", "XL"];
  const [selectedSize, setSelectedSize] = useState(sizes[0]);

  const handleAddToCart = () => {
    addItem(product, 1, selectedSize);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#00BCD4]">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <Link href="/boutique" className="hover:text-[#00BCD4]">
          Boutique
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#111]">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <AnimateOnScroll direction="left">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative aspect-square w-20 overflow-hidden rounded border border-gray-200"
              >
                <Image
                  src={product.image}
                  alt={`${product.name} vue ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right" delay={0.2}>
        <div>
          <h1 className="text-3xl font-bold text-[#111]">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-[#00BCD4]">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111]">
                Description
              </h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111]">
              Choisir la taille
            </h2>
            <div className="mt-3 flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? "border-[#00BCD4] bg-[#00BCD4]/5 text-[#00BCD4]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <Link
              href="/#tailles"
              className="mt-2 inline-block text-sm text-[#00BCD4] hover:underline"
            >
              Guide des tailles
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#111] px-6 py-3 font-medium text-white transition-colors hover:bg-[#333]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            <a
              href="https://wa.me/33000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-[#00BCD4] bg-[#00BCD4]/10 px-6 py-3 font-medium text-[#00BCD4] transition-colors hover:bg-[#00BCD4]/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Commander via WhatsApp
            </a>
          </div>

          <div className="mt-6 space-y-2 text-sm text-[#00BCD4]">
            <p className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Livraison offerte sur toutes les commandes
            </p>
            <p className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Garantie d&apos;authenticité et de qualité
            </p>
          </div>
        </div>
        </AnimateOnScroll>
      </div>

      {similarProducts.length > 0 && (
        <section className="mt-20">
          <AnimateOnScroll direction="up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#111]">
                Complétez votre look
              </h2>
              <Link href="/boutique" className="text-[#00BCD4] hover:underline">
                Voir toute la collection
              </Link>
            </div>
          </AnimateOnScroll>
          <AnimateStagger
            className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.1}
          >
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimateStagger>
        </section>
      )}
    </div>
  );
}

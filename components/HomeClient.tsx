"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AnimateStagger from "@/components/AnimateStagger";
import { api, type Product } from "@/lib/api";

const heroCategories = [
  {
    name: "Vêtements",
    image: "https://picsum.photos/400/500?random=10",
    description: "Pièces intemporelles",
    href: "/boutique?category=Vêtements",
  },
  {
    name: "Accessoires",
    image: "https://picsum.photos/400/500?random=11",
    description: "Sublimez votre look",
    href: "/boutique?category=Accessoires",
  },
  {
    name: "Bracelets",
    image: "https://picsum.photos/400/500?random=12",
    description: "Élégance discrète",
    href: "/boutique?category=Bracelets",
  },
];

function PopularProductsFallback() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="aspect-[4/5] animate-pulse rounded-lg bg-gray-200"
        />
      ))}
    </div>
  );
}

export default function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProducts({ limit: 4 })
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/hero.jpeg)",
            backgroundAttachment: "scroll",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-20 lg:px-8">
          <AnimateOnScroll direction="up" delay={0.1}>
            <span className="mb-4 inline-block rounded bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              NOUVELLE COLLECTION 2026
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.2}>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Exprimez votre style avec élégance.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.3}>
            <p className="mt-4 max-w-xl text-lg text-white/90">
              Découvrez une sélection exclusive de pièces intemporelles conçues
              pour sublimer votre allure au quotidien.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.4}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/boutique"
                className="rounded-lg bg-[#00BCD4] px-6 py-3 font-medium text-white transition-colors hover:bg-[#00acc1]"
              >
                Découvrir la collection
              </Link>
              <Link
                href="/boutique"
                className="rounded-lg border border-white/50 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Voir le lookbook
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Nos Catégories */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <AnimateOnScroll direction="up">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#111]">Nos Catégories</h2>
              <p className="mt-1 text-gray-600">
                Explorez nos univers soigneusement sélectionnés.
              </p>
            </div>
            <Link
              href="/boutique"
              className="flex items-center gap-1 text-[#00BCD4] transition-colors hover:text-[#00acc1]"
            >
              Tout voir
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </AnimateOnScroll>
        <AnimateStagger
          className="mt-8 grid gap-6 sm:grid-cols-3"
          staggerDelay={0.15}
        >
          {heroCategories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </AnimateStagger>
      </section>

      {/* Produits Populaires */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <AnimateOnScroll direction="up">
          <h2 className="border-b-2 border-[#00BCD4] pb-2 text-2xl font-bold text-[#111]">
            Produits Populaires
          </h2>
        </AnimateOnScroll>
        {loading ? (
          <PopularProductsFallback />
        ) : (
          <AnimateStagger
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.1}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimateStagger>
        )}
      </section>

      {/* Rejoindre la Communauté */}
      <AnimateOnScroll direction="fade" duration={0.8}>
        <section className="relative overflow-hidden bg-gray-950 px-4 py-20 text-center text-white">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-[#00BCD4] opacity-5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#00BCD4] opacity-5 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mb-6 flex justify-center">
              <span className="text-5xl">🌟</span>
            </div>

            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Rejoignez la Communauté
              <br />
              <span className="text-[#00BCD4]">Aura & Style</span>
            </h2>

            <p className="mx-auto mb-10 max-w-lg text-lg text-gray-400">
              Rejoignez notre communauté pour recevoir les nouvelles
              collections, les offres exclusives et les conseils style en
              avant-première.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://chat.whatsapp.com/Kw2WC0q546Y0vdiVzcnMVx"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-lg hover:shadow-[#25D366]/30"
              >
                <svg
                  className="h-6 w-6 flex-shrink-0 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Rejoindre le groupe WhatsApp
              </a>

              <a
                href="https://www.facebook.com/share/1BwpUZJFPg/?mibextid=LQQJ4d"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-full bg-[#1877F2] px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#0d6fd8] hover:shadow-lg hover:shadow-[#1877F2]/30"
              >
                <svg
                  className="h-6 w-6 flex-shrink-0 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Suivre sur Facebook
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-600">
              +500 membres nous font déjà confiance ✨
            </p>
          </div>
        </section>
      </AnimateOnScroll>
    </div>
  );
}

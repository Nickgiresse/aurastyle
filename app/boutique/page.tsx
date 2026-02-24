"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AnimateStagger from "@/components/AnimateStagger";
import { api, type Product } from "@/lib/api";
import { categories, type Category } from "@/lib/data";

const FILTER_CATEGORIES: (Category | "Tous")[] = ["Tous", ...categories];

const SORT_OPTIONS = [
  { value: "new", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

const ITEMS_PER_PAGE = 8;

function BoutiqueContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") as Category | null;
  const searchQuery = searchParams.get("q") || "";

  const [category, setCategory] = useState<Category | "Tous">(
    initialCat && FILTER_CATEGORIES.includes(initialCat) ? initialCat : "Tous"
  );
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        if (searchQuery) {
          const { products: searchResults } = await api.searchProducts(
            searchQuery
          );
          setProducts(searchResults);
          setTotalPages(1);
        } else {
          const data = await api.getProducts({
            category: category === "Tous" ? undefined : category,
            sort: sort === "new" ? undefined : sort,
            page,
            limit: ITEMS_PER_PAGE,
          });
          setProducts(data.products);
          setTotalPages(data.pages || 1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category, sort, page, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#00BCD4]">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#111]">Boutique</span>
      </nav>

      <AnimateOnScroll direction="down">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111]">Notre Boutique</h1>
          <p className="mt-2 text-gray-600">
            L&apos;essence de l&apos;élégance contemporaine. Explorez notre
            sélection de pièces intemporelles conçues pour affirmer votre style.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll direction="up" delay={0.2}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-[#00BCD4] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trier par :</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00BCD4]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      </AnimateOnScroll>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00BCD4] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-red-600">{error}</p>
      ) : (
        <>
          <AnimateStagger
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.08}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimateStagger>

          {products.length === 0 && (
            <p className="py-12 text-center text-gray-500">
              Aucun produit trouvé. Essayez de modifier vos filtres.
            </p>
          )}

          {totalPages > 1 && !searchQuery && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-50"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    page === p
                      ? "bg-[#00BCD4] text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BoutiquePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#00BCD4] border-t-transparent" />
        </div>
      }
    >
      <BoutiqueContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AnimateStagger from "@/components/AnimateStagger";
import { api, type Product } from "@/lib/api";

interface CategoryOption {
  _id: string;
  name: string;
}

const SORT_OPTIONS = [
  { value: "new", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

const ITEMS_PER_PAGE = 8;

function BoutiqueContent() {
  const searchParams = useSearchParams();
  const initialCatParam = searchParams.get("category") || "";
  const searchQuery = searchParams.get("q") || "";

  const [categories, setCategories] = useState<CategoryOption[]>([
    { _id: "tous", name: "Tous" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories([{ _id: "tous", name: "Tous" }, ...(data || [])]);
      } catch {
        setCategories([{ _id: "tous", name: "Tous" }]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (initialCatParam && categories.some((c) => c._id === initialCatParam)) {
      setSelectedCategory(initialCatParam === "tous" ? "" : initialCatParam);
    }
  }, [initialCatParam, categories]);

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
          const params: { page: number; limit: number; category?: string; sort?: string } = {
            page,
            limit: ITEMS_PER_PAGE,
          };
          if (selectedCategory) params.category = selectedCategory;
          if (sort !== "new") params.sort = sort;
          const data = await api.getProducts(params);
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
  }, [selectedCategory, sort, page, searchQuery]);

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
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategory(cat._id === "tous" ? "" : cat._id);
                setPage(1);
              }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                (cat._id === "tous" && !selectedCategory) || selectedCategory === cat._id
                  ? "bg-[#111] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.name}
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

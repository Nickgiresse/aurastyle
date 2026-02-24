import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  let product;
  let similarProducts = [];

  try {
    product = await api.getProduct(id);
    if (product) {
      const { products } = await api.getProducts({
        category: product.category,
        limit: 5,
      });
      similarProducts = products.filter((p) => p.id !== id).slice(0, 4);
    }
  } catch {
    product = null;
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
      similarProducts={similarProducts}
    />
  );
}

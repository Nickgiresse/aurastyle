import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[#111]">Produit introuvable</h1>
      <Link
        href="/boutique"
        className="mt-4 inline-block text-[#00BCD4] hover:underline"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}

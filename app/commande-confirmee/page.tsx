import Link from "next/link";

export default function CommandeConfirmeePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="rounded-2xl border border-gray-100 bg-white p-12 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00BCD4]/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00BCD4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#111]">
          Commande confirmée !
        </h1>
        <p className="mt-4 text-gray-600">
          Merci pour votre commande. Vous recevrez un email de confirmation
          sous peu.
        </p>
        <Link
          href="/boutique"
          className="mt-8 inline-block rounded-lg bg-[#00BCD4] px-6 py-3 font-medium text-white transition-colors hover:bg-[#00acc1]"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}

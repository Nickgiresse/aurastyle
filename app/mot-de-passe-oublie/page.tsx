"use client";

import { useState } from "react";
import Link from "next/link";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: intégrer l'envoi d'email de réinitialisation
    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#111]">
          Mot de passe oublié ?
        </h1>
        <p className="mt-2 text-gray-600">
          Entrez votre email et nous vous enverrons un lien pour réinitialiser
          votre mot de passe.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg bg-[#00BCD4]/10 p-4 text-center">
            <p className="text-sm text-[#00BCD4]">
              Si un compte existe avec cet email, vous recevrez un lien de
              réinitialisation.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-[#00BCD4] hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#111]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 px-4 text-[#111] outline-none focus:border-[#00BCD4] focus:bg-white"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-[#00BCD4] py-3 font-medium text-white hover:bg-[#00acc1]"
            >
              Envoyer le lien
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-gray-600 hover:text-[#00BCD4]"
        >
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

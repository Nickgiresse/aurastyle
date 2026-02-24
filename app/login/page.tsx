"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.isAdmin) router.replace("/admin");
      else router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="Aura & Style"
            width={130}
            height={50}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Bon retour parmi nous
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Veuillez entrer vos identifiants pour accéder à votre espace.
        </p>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#00BCD4]"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <Link
                href="/mot-de-passe-oublie"
                className="text-sm text-[#00BCD4] hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#00BCD4]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="rounded border-gray-300 text-[#00BCD4]"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Se souvenir de moi
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#111] py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Vous n&apos;avez pas de compte ?{" "}
          <Link
            href="/inscription"
            className="font-medium text-[#00BCD4] hover:underline"
          >
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(pwd: string): number {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 8) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);
}

export default function InscriptionPage() {
  const router = useRouter();
  const { setAuthFromRegister } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const pwStrength = getPasswordStrength(password);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!firstName.trim()) err.firstName = "Prénom requis";
    if (!lastName.trim()) err.lastName = "Nom requis";
    if (!email.trim()) err.email = "Email requis";
    else if (!emailRegex.test(email)) err.email = "Format d'email invalide";
    if (!password) err.password = "Mot de passe requis";
    else if (password.length < 6) err.password = "Minimum 6 caractères";
    if (password !== confirmPassword) err.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!acceptTerms) err.terms = "Vous devez accepter les conditions générales";
    setError(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError({});
    try {
      const data = await api.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      const user = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        isAdmin: data.user.isAdmin,
      };
      setAuthFromRegister(data.token, user);
      router.push("/compte");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      if (msg.includes("email")) setError({ email: msg });
      else setError({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="relative h-32 overflow-hidden bg-gray-200">
            <Image
              src="https://picsum.photos/600/200?random=fashion"
              alt="Mode Aura & Style"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00BCD4]">
                <span className="text-xl font-bold text-white">A</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-xl font-bold text-[#111]">CRÉER UN COMPTE</h1>
            <p className="mt-1 text-[#00BCD4]">
              Rejoignez l&apos;univers chic d&apos;Aura & Style
            </p>

            {error.form && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error.form}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111]">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full rounded-lg border py-3 px-4 text-[#111] outline-none transition-colors focus:border-[#00BCD4] ${
                      error.firstName ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {error.firstName && (
                    <p className="mt-1 text-sm text-red-600">{error.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111]">
                    Nom *
                  </label>
                  <input
                    type="text"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full rounded-lg border py-3 px-4 text-[#111] outline-none transition-colors focus:border-[#00BCD4] ${
                      error.lastName ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {error.lastName && (
                    <p className="mt-1 text-sm text-red-600">{error.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111]">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border py-3 px-4 text-[#111] outline-none transition-colors focus:border-[#00BCD4] ${
                    error.email ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {error.email && (
                  <p className="mt-1 text-sm text-red-600">{error.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111]">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 px-4 text-[#111] outline-none transition-colors focus:border-[#00BCD4]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111]">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className={`w-full rounded-lg border py-3 pl-4 pr-12 text-[#111] outline-none transition-colors focus:border-[#00BCD4] ${
                      error.password ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i <= pwStrength ? "bg-[#00BCD4]" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
                {error.password && (
                  <p className="mt-1 text-sm text-red-600">{error.password}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111]">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border py-3 px-4 text-[#111] outline-none transition-colors focus:border-[#00BCD4] ${
                    error.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {error.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{error.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    J&apos;accepte les conditions générales de vente et la politique de
                    confidentialité *
                  </span>
                </label>
                {error.terms && (
                  <p className="mt-1 text-sm text-red-600">{error.terms}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#00BCD4] py-3 font-medium text-white transition-colors hover:bg-[#00acc1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création en cours..." : "CRÉER MON COMPTE"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-medium text-[#00BCD4] hover:underline hover:text-[#00acc1]"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <Link href="/#confidentialite" className="hover:text-[#00BCD4]">
            CONFIDENTIALITÉ
          </Link>
          <Link href="/#conditions" className="hover:text-[#00BCD4]">
            CONDITIONS
          </Link>
          <Link href="/#aide" className="hover:text-[#00BCD4]">
            AIDE
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          © 2024 AURA & STYLE. MAISON DE MODE.
        </p>
      </div>
    </div>
  );
}

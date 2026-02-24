"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api, formatPrice, type Product } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";

type Tab = "profil" | "commandes" | "wishlist" | "adresses";

interface Order {
  _id: string;
  items: Array<{ name: string; image: string; price: number; quantity: number; size: string }>;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: { street: string; city: string; zip: string; country: string };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

export default function ComptePage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const [tab, setTab] = useState<Tab>("profil");
  const [profile, setProfile] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: { street: string; city: string; zip: string; country: string };
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    if (!user || !token) {
      router.replace("/login");
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [prof, ords, wish] = await Promise.all([
          api.getUserProfile(token),
          api.getUserOrders(token),
          api.getWishlist(token),
        ]);
        setProfile(prof);
        setProfileForm({
          firstName: prof.firstName || "",
          lastName: prof.lastName || "",
          email: prof.email || "",
          phone: prof.phone || "",
        });
        setOrders(ords);
        setWishlist(wish);
        if (prof.address) {
          setAddressForm(prof.address);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, token, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateUserProfile(profileForm, token);
      setSuccess("Profil mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateUserPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        token
      );
      setSuccess("Mot de passe modifié.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateUserAddress(addressForm, token);
      setSuccess("Adresse enregistrée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    if (!token) return;
    try {
      await api.removeFromWishlist(productId, token);
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      setError("Erreur lors du retrait.");
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00BCD4] border-t-transparent" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profil", label: "Mon Profil" },
    { id: "commandes", label: "Mes Commandes" },
    { id: "wishlist", label: "Ma Wishlist" },
    { id: "adresses", label: "Adresses" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-[#111]">Mon Compte</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-56 flex-shrink-0">
          <nav className="space-y-1 rounded-lg border border-gray-200 bg-white p-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`block w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-[#00BCD4]/10 text-[#00BCD4]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {tab === "profil" && (
            <div className="space-y-8">
              <section className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#111]">Informations personnelles</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Prénom</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, firstName: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Nom</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, lastName: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Téléphone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#00BCD4] px-4 py-2 font-medium text-white hover:bg-[#00acc1] disabled:opacity-50"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </form>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#111]">
                  Changer mon mot de passe
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Ancien mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      minLength={6}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Confirmer</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#00BCD4] px-4 py-2 font-medium text-white hover:bg-[#00acc1] disabled:opacity-50"
                  >
                    Modifier le mot de passe
                  </button>
                </form>
              </section>
            </div>
          )}

          {tab === "commandes" && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-[#111]">Mes Commandes</h2>
              {orders.length === 0 ? (
                <p className="text-gray-600">Aucune commande.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-lg border border-gray-100 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-[#111]">
                            Commande #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR")} •{" "}
                            {order.items.length} article(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              STATUS_COLORS[order.status] || "bg-gray-100"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="font-semibold text-[#00BCD4]">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <span key={i} className="text-sm text-gray-600">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500">
                            +{order.items.length - 3} autre(s)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "wishlist" && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-[#111]">Ma Wishlist</h2>
              {wishlist.length === 0 ? (
                <p className="text-gray-600">Aucun produit en favori.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlist.map((product) => (
                    <div
                      key={product.id}
                      className="group relative overflow-hidden rounded-lg border border-gray-100"
                    >
                      <Link href={`/boutique/${product.id}`} className="block">
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-[#111]">{product.name}</h3>
                          <p className="text-[#00BCD4] font-semibold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>
                      <div className="flex gap-2 p-3">
                        <button
                          onClick={() => addItem(product)}
                          className="flex-1 rounded-lg bg-[#00BCD4] py-2 text-sm font-medium text-white hover:bg-[#00acc1]"
                        >
                          Au panier
                        </button>
                        <button
                          onClick={() => handleRemoveWishlist(product.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "adresses" && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-[#111]">Adresse principale</h2>
              <form onSubmit={handleUpdateAddress} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Rue</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) =>
                      setAddressForm((p) => ({ ...p, street: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Ville</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, city: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Code postal</label>
                    <input
                      type="text"
                      value={addressForm.zip}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, zip: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Pays</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) =>
                      setAddressForm((p) => ({ ...p, country: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#00BCD4] px-4 py-2 font-medium text-white hover:bg-[#00acc1] disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Enregistrer l'adresse"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

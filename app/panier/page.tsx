"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { api, formatPrice, type Product } from "@/lib/api";

const PROMO_AURA10 = "AURA10";
const PROMO_DISCOUNT = 0.1;
const WHATSAPP_PHONE = "237690021434";

function buildWhatsAppMessage(
  form: { firstName: string; lastName: string; phone: string; city: string; address: string },
  cart: Array<{ product: { name: string; price: number }; quantity: number; size?: string }>,
  total: number
) {
  const itemsList = cart
    .map(
      (item) =>
        `  • ${item.product.name} (x${item.quantity}) — Taille: ${item.size || "N/A"} — ${formatPrice(item.product.price * item.quantity)}`
    )
    .join("\n");

  const message = `
🛍️ *NOUVELLE COMMANDE — Aura & Style*

👤 *Client :* ${form.firstName} ${form.lastName}
📞 *Téléphone :* ${form.phone}
📍 *Ville :* ${form.city}
🏠 *Adresse :* ${form.address}

📦 *Articles commandés :*
${itemsList}

💰 *Total : ${formatPrice(total)}*
🚚 *Livraison :* ${total >= 10000 ? "Gratuite" : formatPrice(2000)}

Merci de confirmer la disponibilité et le délai de livraison. 🙏
  `.trim();

  return encodeURIComponent(message);
}

export default function PanierPage() {
  const router = useRouter();
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } =
    useCartStore();
  const { user, token } = useAuthStore();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    address: "",
  });
  const [orderSent, setOrderSent] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const subtotal = total;
  const discount = appliedPromo ? subtotal * PROMO_DISCOUNT : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  useEffect(() => {
    async function fetchSuggested() {
      if (items.length === 0) return;
      try {
        const { products } = await api.getProducts({ limit: 8 });
        const ids = new Set(items.map((i) => i.product.id));
        setSuggestedProducts(products.filter((p) => !ids.has(p.id)).slice(0, 4));
      } catch {
        setSuggestedProducts([]);
      }
    }
    fetchSuggested();
  }, [items]);

  useEffect(() => {
    if (showCheckoutModal && user) {
      setCheckoutForm((f) => ({
        ...f,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      }));
      if (token) {
        api
          .getUserProfile(token)
          .then((profile) => {
            const addr = profile.address;
            setCheckoutForm((f) => ({
              ...f,
              firstName: profile.firstName || user?.firstName || f.firstName,
              lastName: profile.lastName || user?.lastName || f.lastName,
              phone: profile.phone || "",
              city: addr?.city || "",
              address: addr
                ? [addr.street, addr.zip, addr.city, addr.country].filter(Boolean).join(", ")
                : "",
            }));
          })
          .catch(() => {});
      }
    }
  }, [showCheckoutModal, user, token]);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === PROMO_AURA10) {
      setAppliedPromo(true);
    } else {
      setAppliedPromo(false);
      alert("Code promo invalide");
    }
  };

  const handlePasserCommande = () => {
    if (!user || !token) {
      router.push("/login?message=" + encodeURIComponent("Connectez-vous pour finaliser votre commande"));
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmWhatsApp = async () => {
    if (!token || !checkoutForm.firstName || !checkoutForm.lastName || !checkoutForm.phone || !checkoutForm.city || !checkoutForm.address) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setSavingOrder(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.product.id || (item as any).product?._id,
          quantity: item.quantity,
          size: item.size || "Unique",
          price: item.product.price,
          name: item.product.name,
          image: item.product.image,
        })),
        promoCode: appliedPromo ? "AURA10" : "",
        firstName: checkoutForm.firstName,
        lastName: checkoutForm.lastName,
        phone: checkoutForm.phone,
        shippingAddress: {
          street: checkoutForm.address,
          city: checkoutForm.city,
          zip: "00000",
          country: "Cameroun",
        },
      };

      const result = await api.createOrder(orderData, token);

      if (result && (result._id || (result as any).id)) {
        const message = buildWhatsAppMessage(checkoutForm, items, finalTotal);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;
        window.open(whatsappUrl, "_blank");
        clearCart();
        setOrderSent(true);
        setShowCheckoutModal(false);
      } else {
        alert("Erreur lors de la création de la commande : " + ((result as any)?.message || "Erreur inconnue"));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la commande");
    } finally {
      setSavingOrder(false);
    }
  };

  if (items.length === 0 && !orderSent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#111]">Mon Panier</h1>
        <p className="mt-4 text-gray-600">Votre panier est vide.</p>
        <Link
          href="/boutique"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#00BCD4] px-6 py-3 font-medium text-white transition-colors hover:bg-[#00acc1]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-lg border border-green-200 bg-green-50 p-8">
          <h1 className="text-2xl font-bold text-green-800">
            Votre commande a été envoyée sur WhatsApp !
          </h1>
          <p className="mt-4 text-green-700">
            L&apos;admin va vous contacter pour confirmer la disponibilité et le délai de livraison.
          </p>
          <button
            onClick={() => {
              clearCart();
              setOrderSent(false);
              router.push("/boutique");
            }}
            className="mt-6 rounded-lg bg-[#00BCD4] px-6 py-3 font-medium text-white hover:bg-[#00acc1]"
          >
            Vider le panier et continuer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-[#111]">Mon Panier</h1>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size || "default"}`}
                className="flex gap-4 rounded-lg border border-gray-100 bg-white p-4"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <h3 className="font-medium text-[#111]">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Taille: {item.size || "Unique"}
                  </p>
                  <p className="mt-1 font-semibold text-[#00BCD4]">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity - 1,
                          item.size
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity + 1,
                          item.size
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size)}
                    className="mt-2 flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/boutique"
            className="mt-6 inline-flex items-center gap-2 text-[#00BCD4] hover:underline"
          >
            Continuer mes achats
          </Link>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#111]">
              Résumé de la commande
            </h2>
            <div className="mt-4 space-y-2">
              <p className="flex justify-between text-sm text-gray-600">
                Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})
                <span>{formatPrice(subtotal)}</span>
              </p>
              {appliedPromo && (
                <p className="flex justify-between text-sm text-green-600">
                  Réduction AURA10 (-10%)
                  <span>-{formatPrice(discount)}</span>
                </p>
              )}
              <p className="flex justify-between text-sm text-gray-600">
                Frais de livraison
                <span className="text-gray-400">
                  Calculés à l&apos;étape suivante
                </span>
              </p>
              <p className="text-xs text-gray-500">
                * Livraison gratuite dès 10 000 FCFA
              </p>
            </div>
            <p className="mt-4 flex justify-between text-lg font-bold text-[#00BCD4]">
              Total
              <span>{formatPrice(finalTotal)}</span>
            </p>
            <button
              className="mt-6 w-full rounded-lg bg-[#00BCD4] py-3 font-medium text-white transition-colors hover:bg-[#00acc1] disabled:opacity-50"
              onClick={handlePasserCommande}
            >
              Passer la commande
            </button>
            {!user && (
              <p className="mt-2 text-center text-xs text-gray-500">
                <Link href="/login" className="text-[#00BCD4] hover:underline">
                  Connectez-vous
                </Link>{" "}
                pour passer commande
              </p>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="font-medium text-[#111]">Code Promo</h3>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Entrez votre code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00BCD4]"
              />
              <button
                onClick={handleApplyPromo}
                className="rounded bg-[#00BCD4] px-4 py-2 text-sm font-medium text-white hover:bg-[#00acc1]"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCheckoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !savingOrder && setShowCheckoutModal(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#111]">Finaliser ma commande</h2>
            <p className="mt-1 text-sm text-gray-500">
              Remplissez vos coordonnées pour envoyer la commande sur WhatsApp
            </p>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={checkoutForm.firstName}
                    onChange={(e) =>
                      setCheckoutForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#00BCD4]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={checkoutForm.lastName}
                    onChange={(e) =>
                      setCheckoutForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#00BCD4]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={checkoutForm.phone}
                  onChange={(e) =>
                    setCheckoutForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+237 6XX XXX XXX"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#00BCD4]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  type="text"
                  value={checkoutForm.city}
                  onChange={(e) =>
                    setCheckoutForm((f) => ({ ...f, city: e.target.value }))
                  }
                  placeholder="Douala, Yaoundé..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#00BCD4]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Adresse de livraison
                </label>
                <textarea
                  value={checkoutForm.address}
                  onChange={(e) =>
                    setCheckoutForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Rue, quartier, repères..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#00BCD4]"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => !savingOrder && setShowCheckoutModal(false)}
                disabled={savingOrder}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmWhatsApp}
                disabled={savingOrder}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 font-medium text-white hover:bg-[#20BD5A] disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {savingOrder ? "Envoi..." : "Envoyer sur WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {suggestedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-[#111]">
            Vous aimerez aussi
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

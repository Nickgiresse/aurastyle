"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, API_URL, formatPrice, type Product } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import ImageUpload from "@/components/ImageUpload";

type AdminTab = "dashboard" | "categories" | "products" | "orders" | "users";

interface CategoryOption {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

interface AdminCategory extends CategoryOption {
  description?: string;
  image?: string;
}

interface Order {
  _id: string;
  user?: { email?: string; firstName?: string; lastName?: string };
  items: Array<{ name: string; image: string; price: number; quantity: number; size: string }>;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: { street: string; city: string; zip: string; country: string };
}

interface Stats {
  totalProducts?: number;
  totalOrders?: number;
  totalUsers?: number;
  totalRevenue?: number;
  recentOrders?: Order[];
  ordersByDay?: { date: string; count: number; revenue: number }[];
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
  address?: { street: string; city: string; zip: string; country: string };
  orderCount: number;
  totalSpent: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

const BADGES = ["", "NOUVEAU", "PROMO"];

function getTokenFromStorage(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("aura-auth");
    return JSON.parse(raw || "{}")?.state?.token ?? "";
  } catch {
    return "";
  }
}

export default function AdminPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [clearingAllOrders, setClearingAllOrders] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersFilter, setUsersFilter] = useState<"all" | "clients" | "admins">("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isAdmin: false,
    address: { street: "", city: "", zip: "", country: "" },
  });

  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    category: "",
    description: "",
    subTitle: "",
    imageUrl: "",
    imageFile: null as File | null,
    sizes: ["S", "M", "L", "XL"] as string[],
    badge: "",
    stock: 100,
    isActive: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
    imageUrl: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aura-auth");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user && user.isAdmin === true) {
        setAuthorized(true);
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (authorized !== true) return;
    const token = getTokenFromStorage();
    if (!token) {
      router.replace("/login");
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [products, statsData, ordersData, cats, usersData] = await Promise.all([
          api.adminGetProducts(token),
          api.adminGetStats(token),
          api.adminGetOrders(token),
          api.adminGetCategories(token),
          api.adminGetUsers(token),
        ]);
        setAdminProducts(products);
        setStats(statsData);
        setOrders(ordersData);
        setAdminCategories(cats);
        setAdminUsers(usersData || []);
        if (cats.length && !productForm.category) {
          setProductForm((p) => ({ ...p, category: cats[0]._id }));
        }
      } catch (err) {
        console.error(err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authorized, router]);

  const loadOrders = async () => {
    const token = getTokenFromStorage();
    if (!token) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      setOrders(ordersData || []);
      setStats((prev) => (prev ? { ...prev, totalOrders: statsData.totalOrders ?? 0, totalRevenue: statsData.totalRevenue ?? 0 } : statsData));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (tab === "orders") loadOrders();
  }, [tab]);

  const getToken = getTokenFromStorage;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await api.adminUpdateOrderStatus(orderId, status, token);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      if (selectedOrder?._id === orderId) setSelectedOrder({ ...selectedOrder, status });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDeleteOrder = async (orderId: string, orderTotal: number) => {
    if (!confirm("Supprimer cette commande ? Le chiffre d'affaires sera mis à jour.")) return;
    setDeletingOrderId(orderId);
    try {
      const token = getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalOrders: (prev.totalOrders ?? 0) - 1,
                totalRevenue: (prev.totalRevenue ?? 0) - orderTotal,
              }
            : prev
        );
        if (selectedOrder?._id === orderId) setSelectedOrder(null);
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleClearAllOrders = async () => {
    if (
      !confirm(
        "⚠️ Supprimer TOUTES les commandes ? Le CA sera remis à 0. Irréversible !"
      )
    )
      return;
    setClearingAllOrders(true);
    try {
      const token = getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/admin/orders/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders([]);
        setStats((prev) =>
          prev ? { ...prev, totalOrders: 0, totalRevenue: 0 } : prev
        );
        setSelectedOrder(null);
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setClearingAllOrders(false);
    }
  };

  const handleSaveProduct = async () => {
    const token = getToken();
    if (!token || !productForm.name) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", productForm.name);
      data.append("price", String(productForm.price));
      data.append("description", productForm.description);
      data.append("subTitle", productForm.subTitle);
      data.append("category", productForm.category || adminCategories[0]?._id || "");
      data.append("sizes", JSON.stringify(productForm.sizes));
      data.append("badge", productForm.badge);
      data.append("stock", String(productForm.stock));
      data.append("isActive", String(productForm.isActive));
      if (productForm.imageFile) data.append("image", productForm.imageFile);

      if (editingProductId) {
        const updated = await api.adminUpdateProduct(editingProductId, data, token);
        setAdminProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? updated : p))
        );
      } else {
        const created = await api.adminCreateProduct(data, token);
        setAdminProducts((prev) => [created, ...prev]);
      }
      resetProductForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    const token = getToken();
    if (!token || !categoryForm.name) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", categoryForm.name);
      data.append("description", categoryForm.description);
      if (categoryForm.imageFile) data.append("image", categoryForm.imageFile);

      if (editingCategoryId) {
        const res = await api.adminUpdateCategory(editingCategoryId, data, token);
        setAdminCategories((prev) =>
          prev.map((c) => (c._id === editingCategoryId ? { ...c, ...res } : c))
        );
      } else {
        const created = await api.adminCreateCategory(data, token);
        setAdminCategories((prev) => [...prev, created]);
      }
      resetCategoryForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const token = getToken();
    if (!token || !confirm("Supprimer ce produit ?")) return;
    try {
      await api.adminDeleteProduct(id, token);
      setAdminProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingProductId === id) resetProductForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const token = getToken();
    if (!token || !confirm("Supprimer cette catégorie ?")) return;
    try {
      await api.adminDeleteCategory(id, token);
      setAdminCategories((prev) => prev.filter((c) => c._id !== id));
      if (editingCategoryId === id) resetCategoryForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: 0,
      category: adminCategories[0]?._id || "",
      description: "",
      subTitle: "",
      imageUrl: "",
      imageFile: null,
      sizes: ["S", "M", "L", "XL"],
      badge: "",
      stock: 100,
      isActive: true,
    });
    setEditingProductId(null);
    setShowProductForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", imageFile: null, imageUrl: "" });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const filteredProducts = adminProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = (stats?.ordersByDay || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" }),
    commandes: d.count,
    ca: d.revenue,
  }));

  if (authorized === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#00BCD4] border-t-transparent" />
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!authorized) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00BCD4] border-t-transparent" />
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Produits", icon: "👕" },
    { id: "categories", label: "Catégories", icon: "🏷️" },
    { id: "orders", label: "Commandes", icon: "📦" },
    { id: "users", label: "Utilisateurs", icon: "👥" },
  ];

  const filteredUsers = adminUsers.filter((u) => {
    const matchSearch =
      !usersSearch ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
      (u.phone || "").includes(usersSearch);
    const matchFilter =
      usersFilter === "all" ||
      (usersFilter === "admins" && u.isAdmin) ||
      (usersFilter === "clients" && !u.isAdmin);
    return matchSearch && matchFilter;
  });

  const getAvatarColor = (name: string) => {
    if (!name) return "bg-gray-400";
    const colors = ["bg-[#00BCD4]", "bg-[#FF9800]", "bg-[#4CAF50]", "bg-[#9C27B0]", "bg-[#F44336]"];
    const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
    return colors[idx];
  };

  const getInitials = (u: AdminUser) => {
    const f = u.firstName?.[0] || "";
    const l = u.lastName?.[0] || "";
    return (f + l).toUpperCase() || u.email?.[0]?.toUpperCase() || "?";
  };

  const exportUsersCSV = () => {
    const headers = ["Prénom", "Nom", "Email", "Téléphone", "Rôle", "Commandes", "Total dépensé", "Date inscription"];
    const rows = filteredUsers.map((u) => [
      u.firstName || "",
      u.lastName || "",
      u.email || "",
      u.phone || "",
      u.isAdmin ? "Admin" : "Client",
      u.orderCount,
      u.totalSpent,
      new Date(u.createdAt).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilisateurs-aura-style-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const contactUserWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`Bonjour ${name}, je suis l'équipe Aura & Style. 😊`);
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone.startsWith("237") ? cleanPhone : "237" + cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 transform bg-[#111] text-white
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex-shrink-0
        `}
      >
        <div className="flex h-full flex-col p-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 top-4 text-white hover:text-gray-300 lg:hidden"
          >
            ✕
          </button>
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="Aura & Style"
              width={100}
              height={40}
              className="object-contain brightness-0 invert"
            />
          </Link>
          <p className="mt-1 text-xs text-gray-400">Dashboard Admin</p>
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  tab === item.id
                    ? "bg-[#00BCD4] text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10"
            >
              <span>🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 transition-colors hover:bg-gray-100"
            aria-label="Ouvrir le menu"
          >
            <span className="block h-0.5 w-5 bg-gray-800 mb-1.5" />
            <span className="block h-0.5 w-5 bg-gray-800 mb-1.5" />
            <span className="block h-0.5 w-5 bg-gray-800" />
          </button>
          <Image
            src="/logo.png"
            alt="Aura & Style"
            width={80}
            height={32}
            className="object-contain"
          />
          <div className="w-9" />
        </div>

      <div className="p-4 md:p-8">
        {tab === "dashboard" && (
          <div className="space-y-8">
            <h1 className="text-2xl font-bold text-[#111]">Dashboard</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Produits</p>
                <p className="mt-1 text-2xl font-bold text-[#111]">
                  {stats?.totalProducts ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="mt-1 text-2xl font-bold text-[#111]">
                  {stats?.totalOrders ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Chiffre d&apos;affaires</p>
                <p className="mt-1 text-2xl font-bold text-[#00BCD4]">
                  {formatPrice(stats?.totalRevenue ?? 0)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <p className="mt-1 text-2xl font-bold text-[#111]">
                  {stats?.totalUsers ?? 0}
                </p>
              </div>
            </div>
            {chartData.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 font-semibold text-[#111]">
                  Commandes des 7 derniers jours
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => [formatPrice(v), "CA"]} />
                      <Bar dataKey="commandes" fill="#00BCD4" name="Commandes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-semibold text-[#111]">5 dernières commandes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Client</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Articles</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentOrders || []).slice(0, 5).map((o) => (
                      <tr
                        key={o._id}
                        className="cursor-pointer border-b hover:bg-gray-50"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="px-4 py-2">#{o._id.slice(-8)}</td>
                        <td className="px-4 py-2">
                          {(o.user as { email?: string })?.email || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-2">{o.items?.length || 0}</td>
                        <td className="px-4 py-2 font-medium">
                          {formatPrice(o.total || 0)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              STATUS_COLORS[o.status] || "bg-gray-100"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#111]">Catégories</h1>
              <button
                onClick={() => {
                  resetCategoryForm();
                  setShowCategoryForm(true);
                }}
                className="rounded-lg bg-[#00BCD4] px-4 py-2 font-medium text-white hover:bg-[#00acc1]"
              >
                Nouvelle catégorie
              </button>
            </div>
            <div className="flex gap-8">
              <div className="flex-1 space-y-4">
                {adminCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    {cat.image && (
                      <div className="relative h-16 w-16 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={cat.image.startsWith("/") ? `${API_URL}${cat.image}` : cat.image}
                          alt={cat.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-[#111]">{cat.name}</h3>
                      <p className="text-sm text-gray-500">{cat.description || ""}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCategoryForm({
                            name: cat.name,
                            description: cat.description || "",
                            imageFile: null,
                            imageUrl: cat.image?.startsWith("http")
                              ? cat.image
                              : cat.image
                                ? `${API_URL}${cat.image}`
                                : "",
                          });
                          setEditingCategoryId(cat._id);
                          setShowCategoryForm(true);
                        }}
                        className="rounded px-3 py-1 text-sm text-[#00BCD4] hover:bg-[#00BCD4]/10"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showCategoryForm && (
                <div className="w-96 rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h2 className="mb-4 font-semibold">
                    {editingCategoryId ? "Modifier" : "Nouvelle catégorie"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Nom</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full rounded-lg border px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Description</label>
                      <textarea
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm((p) => ({ ...p, description: e.target.value }))
                        }
                        rows={3}
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </div>
                    <ImageUpload
                      label="Image de la catégorie"
                      aspectRatio="category"
                      value={categoryForm.imageUrl}
                      onChange={(file) =>
                        setCategoryForm((p) => ({
                          ...p,
                          imageFile: file,
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={resetCategoryForm}
                        className="flex-1 rounded-lg border px-4 py-2 text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveCategory}
                        disabled={!categoryForm.name || saving}
                        className="flex-1 rounded-lg bg-[#00BCD4] px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {saving ? "..." : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#111]">Produits</h1>
              <button
                onClick={() => {
                  resetProductForm();
                  setShowProductForm(true);
                }}
                className="rounded-lg bg-[#00BCD4] px-4 py-2 font-medium text-white hover:bg-[#00acc1]"
              >
                Ajouter un produit
              </button>
            </div>
            <div className="flex gap-8">
              <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-b border-gray-200 p-4"
                />
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                      <th className="px-4 py-3">Image</th>
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Prix</th>
                      <th className="px-4 py-3">Catégorie</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Badge</th>
                      <th className="px-4 py-3">Actif</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 font-semibold text-[#00BCD4]">
                          {formatPrice(p.price)}
                        </td>
                        <td className="px-4 py-3">{p.category}</td>
                        <td className="px-4 py-3">{p.stock ?? "-"}</td>
                        <td className="px-4 py-3">{p.badge || "-"}</td>
                        <td className="px-4 py-3">
                          {p.isActive !== false ? "Oui" : "Non"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              const catId = adminCategories.find((c) => c.name === p.category)?._id;
                              setProductForm({
                                name: p.name,
                                price: p.price,
                                category: catId || "",
                                description: p.description || "",
                                subTitle: p.subTitle || "",
                                imageUrl: p.image,
                                imageFile: null,
                                sizes: p.sizes ?? ["S", "M", "L", "XL"],
                                badge: p.badge || "",
                                stock: p.stock ?? 100,
                                isActive: p.isActive !== false,
                              });
                              setEditingProductId(p.id);
                              setShowProductForm(true);
                            }}
                            className="text-[#00BCD4] hover:underline"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="ml-2 text-red-600 hover:underline"
                          >
                            Suppr.
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showProductForm && (
                <div className="w-96 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h2 className="mb-4 font-semibold">
                    {editingProductId ? "Modifier" : "Nouveau produit"}
                  </h2>
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                    <div>
                      <label className="mb-1 block text-sm">Nom</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full rounded border px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Prix (FCFA)</label>
                      <input
                        type="number"
                        value={productForm.price || ""}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full rounded border px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Catégorie</label>
                      <select
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm((p) => ({ ...p, category: e.target.value }))
                        }
                        className="w-full rounded border px-3 py-2"
                      >
                        {adminCategories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm((p) => ({ ...p, description: e.target.value }))
                        }
                        rows={2}
                        className="w-full rounded border px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Sous-titre</label>
                      <input
                        type="text"
                        value={productForm.subTitle}
                        onChange={(e) =>
                          setProductForm((p) => ({ ...p, subTitle: e.target.value }))
                        }
                        className="w-full rounded border px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Badge</label>
                      <select
                        value={productForm.badge}
                        onChange={(e) =>
                          setProductForm((p) => ({ ...p, badge: e.target.value }))
                        }
                        className="w-full rounded border px-3 py-2"
                      >
                        {BADGES.map((b) => (
                          <option key={b} value={b}>
                            {b || "(aucun)"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Tailles</label>
                      <div className="flex gap-2">
                        {["S", "M", "L", "XL"].map((s) => (
                          <label key={s} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={productForm.sizes.includes(s)}
                              onChange={(e) =>
                                setProductForm((p) => ({
                                  ...p,
                                  sizes: e.target.checked
                                    ? [...p.sizes, s]
                                    : p.sizes.filter((x) => x !== s),
                                }))
                              }
                            />
                            {s}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Stock</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            stock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full rounded border px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.isActive}
                          onChange={(e) =>
                            setProductForm((p) => ({ ...p, isActive: e.target.checked }))
                          }
                        />
                        Produit actif
                      </label>
                    </div>
                    <ImageUpload
                      label="Photo du produit"
                      aspectRatio="product"
                      value={productForm.imageUrl}
                      onChange={(file) =>
                        setProductForm((p) => ({
                          ...p,
                          imageFile: file,
                        }))
                      }
                    />
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={resetProductForm}
                        className="flex-1 rounded border px-4 py-2 text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveProduct}
                        disabled={!productForm.name || saving}
                        className="flex-1 rounded bg-[#00BCD4] px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {saving ? "..." : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#111]">Utilisateurs</h1>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="search"
                  placeholder="Rechercher (nom, email, tél.)"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00BCD4]"
                />
                <select
                  value={usersFilter}
                  onChange={(e) => setUsersFilter(e.target.value as "all" | "clients" | "admins")}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="clients">Clients</option>
                  <option value="admins">Admins</option>
                </select>
                <span className="text-sm text-gray-500">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""}
                </span>
                <button
                  onClick={exportUsersCSV}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Exporter CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                    <th className="px-4 py-3">Avatar</th>
                    <th className="px-4 py-3">Nom complet</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Commandes</th>
                    <th className="px-4 py-3">Total dépensé</th>
                    <th className="px-4 py-3">Date inscription</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(u.firstName + u.lastName)}`}
                        >
                          {getInitials(u)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            u.isAdmin ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.isAdmin ? "Admin" : "Client"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            try {
                              const detail = await api.adminGetUser(u.id, getToken());
                              setSelectedUser({ ...u, ...detail });
                            } catch {
                              setSelectedUser(u);
                            }
                          }}
                          className="text-[#00BCD4] hover:underline"
                        >
                          {u.orderCount}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatPrice(u.totalSpent)}</td>
                      <td className="px-4 py-3">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.phone && (
                            <button
                              onClick={() => contactUserWhatsApp(u.phone!, `${u.firstName} ${u.lastName}`)}
                              className="rounded bg-[#25D366] p-1.5 text-white hover:bg-[#20BD5A]"
                              title="WhatsApp"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                const detail = await api.adminGetUser(u.id, getToken());
                                setSelectedUser({ ...u, ...detail });
                              } catch {
                                setSelectedUser(u);
                              }
                            }}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                            title="Voir"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => {
                              setUserForm({
                                firstName: u.firstName || "",
                                lastName: u.lastName || "",
                                email: u.email || "",
                                phone: u.phone || "",
                                isAdmin: u.isAdmin,
                                address: u.address || { street: "", city: "", zip: "", country: "" },
                              });
                              setEditingUser(u);
                            }}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                            title="Éditer"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Générer un nouveau mot de passe temporaire ?")) return;
                              try {
                                const res = await api.adminResetPassword(u.id, getToken());
                                alert(`Mot de passe temporaire : ${res.temporaryPassword}\n\nCopiez-le et communiquez-le au client.`);
                              } catch (err) {
                                alert(err instanceof Error ? err.message : "Erreur");
                              }
                            }}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                            title="Reset MDP"
                          >
                            🔑
                          </button>
                          {!u.isAdmin && (
                            <button
                              onClick={async () => {
                                if (!confirm("Êtes-vous sûr ? Cette action est irréversible.")) return;
                                try {
                                  await api.adminDeleteUser(u.id, getToken());
                                  setAdminUsers((prev) => prev.filter((x) => x.id !== u.id));
                                  setEditingUser(null);
                                  setSelectedUser(null);
                                } catch (err) {
                                  alert(err instanceof Error ? err.message : "Impossible de supprimer");
                                }
                              }}
                              className="rounded p-1.5 text-red-500 hover:bg-red-50"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Commandes</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Gérez et supprimez les commandes progressivement
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearAllOrders}
                disabled={clearingAllOrders || orders.length === 0}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-40"
              >
                {clearingAllOrders ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "🗑️"
                )}
                Vider toutes les commandes
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    📦
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total commandes</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.totalOrders ?? 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
                    💰
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chiffre d&apos;affaires</p>
                    <p className="text-3xl font-bold text-green-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "XAF",
                        minimumFractionDigits: 0,
                      }).format(stats?.totalRevenue ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <p className="mb-4 text-5xl">📭</p>
                <p className="text-lg text-gray-500">Aucune commande</p>
                <p className="mt-1 text-sm text-gray-400">
                  Le chiffre d&apos;affaires est à 0 FCFA
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 ${
                      deletingOrderId === order._id ? "scale-95 opacity-50" : "opacity-100"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-lg bg-gray-50 px-2 py-1 font-mono text-xs text-gray-400">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "shipped"
                                  ? "bg-orange-100 text-orange-700"
                                  : order.status === "paid"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {order.status === "delivered"
                              ? "✅ Livré"
                              : order.status === "shipped"
                                ? "🚚 Expédié"
                                : order.status === "paid"
                                  ? "💳 Payé"
                                  : "⏳ En attente"}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-medium text-gray-700">
                            👤 {(order.user as { firstName?: string })?.firstName || ""}{" "}
                            {(order.user as { lastName?: string })?.lastName || "Client"}
                            <span className="ml-2 font-normal text-gray-400">
                              {(order.user as { email?: string })?.email}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            📦 {order.items?.length || 0} article(s) • 📅{" "}
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            📍 {order.shippingAddress?.city}, {order.shippingAddress?.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <p className="text-xl font-bold text-gray-900">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "XAF",
                            minimumFractionDigits: 0,
                          }).format(order.total)}
                        </p>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              const token = getToken();
                              const API_URL =
                                process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                              await fetch(
                                `${API_URL}/api/admin/orders/${order._id}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ status: e.target.value }),
                                }
                              );
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o._id === order._id
                                    ? { ...o, status: e.target.value }
                                    : o
                                )
                              );
                            }}
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#00BCD4]"
                          >
                            <option value="pending">⏳ En attente</option>
                            <option value="paid">💳 Payé</option>
                            <option value="shipped">🚚 Expédié</option>
                            <option value="delivered">✅ Livré</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteOrder(order._id, order.total ?? 0)
                            }
                            disabled={deletingOrderId === order._id}
                            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                          >
                            {deletingOrderId === order._id ? (
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                            ) : (
                              "🗑️"
                            )}
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">
              Commande #{selectedOrder._id.slice(-8)}
            </h2>
            <p className="text-sm text-gray-500">
              Client: {(selectedOrder.user as { email?: string })?.email || "-"}
            </p>
            <p className="text-sm text-gray-500">
              Date: {new Date(selectedOrder.createdAt).toLocaleString("fr-FR")}
            </p>
            <p className="mt-2 font-medium">
              Total: {formatPrice(selectedOrder.total || 0)}
            </p>
            <div className="mt-4">
              <h3 className="font-medium">Articles</h3>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="mt-2 flex items-center gap-4 rounded border p-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatPrice(item.price)} - {item.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {selectedOrder.shippingAddress && (
              <div className="mt-4">
                <h3 className="font-medium">Adresse de livraison</h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.street}
                  <br />
                  {selectedOrder.shippingAddress.zip} {selectedOrder.shippingAddress.city}
                  <br />
                  {selectedOrder.shippingAddress.country}
                </p>
              </div>
            )}
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full rounded-lg border border-gray-200 py-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">Détail utilisateur</h2>
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ${getAvatarColor(selectedUser.firstName + selectedUser.lastName)}`}
              >
                {getInitials(selectedUser)}
              </div>
              <div>
                <p className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <p className="text-sm text-gray-500">{selectedUser.phone || "-"}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                    selectedUser.isAdmin ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedUser.isAdmin ? "Admin" : "Client"}
                </span>
              </div>
            </div>
            {selectedUser.address && (
              <div className="mt-4">
                <h3 className="font-medium">Adresse</h3>
                <p className="text-sm text-gray-600">
                  {selectedUser.address.street}
                  <br />
                  {selectedUser.address.zip} {selectedUser.address.city}
                  <br />
                  {selectedUser.address.country}
                </p>
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Inscrit le {new Date(selectedUser.createdAt).toLocaleDateString("fr-FR")}
            </p>
            {(selectedUser as { orders?: Order[] }).orders && (
              <div className="mt-4">
                <h3 className="font-medium">Ses commandes</h3>
                <div className="mt-2 max-h-40 overflow-auto space-y-2">
                  {((selectedUser as { orders?: Order[] }).orders || []).map((o) => (
                    <div key={o._id} className="rounded border p-2 text-sm">
                      <span className="font-medium">#{o._id.slice(-8)}</span> —{" "}
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")} —{" "}
                      {formatPrice(o.total || 0)} —{" "}
                      <span className={STATUS_COLORS[o.status] || ""}>{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              {selectedUser.phone && (
                <button
                  onClick={() =>
                    contactUserWhatsApp(
                      selectedUser.phone!,
                      `${selectedUser.firstName} ${selectedUser.lastName}`
                    )
                  }
                  className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-white hover:bg-[#20BD5A]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contacter sur WhatsApp
                </button>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-gray-200 px-4 py-2"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">Éditer l&apos;utilisateur</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Prénom</label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom</label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Téléphone</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Adresse</label>
                <input
                  type="text"
                  placeholder="Rue"
                  value={userForm.address.street}
                  onChange={(e) =>
                    setUserForm((f) => ({
                      ...f,
                      address: { ...f.address, street: e.target.value },
                    }))
                  }
                  className="mb-2 w-full rounded border px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ville"
                    value={userForm.address.city}
                    onChange={(e) =>
                      setUserForm((f) => ({
                        ...f,
                        address: { ...f.address, city: e.target.value },
                      }))
                    }
                    className="rounded border px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Code postal"
                    value={userForm.address.zip}
                    onChange={(e) =>
                      setUserForm((f) => ({
                        ...f,
                        address: { ...f.address, zip: e.target.value },
                      }))
                    }
                    className="rounded border px-3 py-2"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Pays"
                  value={userForm.address.country}
                  onChange={(e) =>
                    setUserForm((f) => ({
                      ...f,
                      address: { ...f.address, country: e.target.value },
                    }))
                  }
                  className="mt-2 w-full rounded border px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={userForm.isAdmin}
                  onChange={(e) => {
                    if (e.target.checked && !confirm("Donner les droits administrateur à cet utilisateur ?")) return;
                    setUserForm((f) => ({ ...f, isAdmin: e.target.checked }));
                  }}
                />
                Rôle Admin
              </label>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded border px-4 py-2"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.adminUpdateUser(
                      editingUser.id,
                      {
                        firstName: userForm.firstName,
                        lastName: userForm.lastName,
                        email: userForm.email,
                        phone: userForm.phone,
                        isAdmin: userForm.isAdmin,
                        address: userForm.address,
                      },
                      getToken()
                    );
                    setAdminUsers((prev) =>
                      prev.map((u) =>
                        u.id === editingUser.id
                          ? {
                              ...u,
                              ...userForm,
                              orderCount: u.orderCount,
                              totalSpent: u.totalSpent,
                              createdAt: u.createdAt,
                            }
                          : u
                      )
                    );
                    setEditingUser(null);
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Erreur");
                  }
                }}
                className="flex-1 rounded bg-[#00BCD4] px-4 py-2 text-white hover:bg-[#00acc1]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

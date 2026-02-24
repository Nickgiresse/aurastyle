const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export { API_URL };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("aura-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

export interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  category: { _id: string; name: string } | string;
  image?: string;
  badge?: string;
  description?: string;
  subTitle?: string;
  sizes?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  badge?: string;
  description?: string;
  subTitle?: string;
  sizes?: string[];
  stock?: number;
  isActive?: boolean;
}

function normalizeProduct(p: ApiProduct): Product {
  const rawImage = p.image || `https://picsum.photos/400/500?random=${p._id}`;
  const image =
    rawImage.startsWith("/") ? `${API_URL}${rawImage}` : rawImage;
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    category: typeof p.category === "object" ? p.category.name : p.category,
    image,
    badge: p.badge,
    description: p.description,
    subTitle: p.subTitle,
    sizes: p.sizes || ["S", "M", "L", "XL"],
    stock: p.stock ?? 100,
    isActive: p.isActive ?? true,
  };
}

export const api = {
  getProducts: async (params?: {
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.sort && params.sort !== "new") {
      const sortMap: Record<string, string> = {
        "price-asc": "price_asc",
        "price-desc": "price_desc",
      };
      searchParams.set("sort", sortMap[params.sort] || params.sort);
    }
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const res = await fetch(`${API_URL}/api/products?${searchParams}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return {
      ...data,
      products: (data.products || []).map(normalizeProduct),
    };
  },

  getProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return normalizeProduct(data);
  },

  getCategories: async () => {
    const res = await fetch(`${API_URL}/api/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  searchProducts: async (q: string) => {
    const res = await fetch(
      `${API_URL}/api/products/search?q=${encodeURIComponent(q)}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return {
      products: (data.products || []).map(normalizeProduct),
    };
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur connexion");
    return data;
  },

  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur inscription");
    return result;
  },

  getUserProfile: async (token: string) => {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  updateUserProfile: async (
    data: { firstName?: string; lastName?: string; email?: string; phone?: string },
    token: string
  ) => {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur API");
    return result;
  },

  updateUserPassword: async (
    currentPassword: string,
    newPassword: string,
    token: string
  ) => {
    const res = await fetch(`${API_URL}/api/users/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  updateUserAddress: async (
    address: { street: string; city: string; zip: string; country: string },
    token: string
  ) => {
    const res = await fetch(`${API_URL}/api/users/address`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  getWishlist: async (token: string) => {
    const res = await fetch(`${API_URL}/api/users/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return (data || []).map((p: ApiProduct) => normalizeProduct(p));
  },

  addToWishlist: async (productId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/users/wishlist/${productId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  removeFromWishlist: async (productId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/users/wishlist/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  getUserOrders: async (token: string) => {
    const res = await fetch(`${API_URL}/api/orders/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  createOrder: async (orderData: any, token: string) => {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur commande");
    return data;
  },

  adminGetProducts: async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return (data || []).map(normalizeProduct);
  },

  adminCreateProduct: async (data: FormData, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/products`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur création");
    return normalizeProduct(result);
  },

  adminUpdateProduct: async (id: string, data: FormData, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur mise à jour");
    return normalizeProduct(result);
  },

  adminDeleteProduct: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Erreur suppression");
    }
  },

  adminGetOrders: async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  adminGetCategories: async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  adminCreateCategory: async (data: FormData, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/categories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur création");
    return result;
  },

  adminUpdateCategory: async (id: string, data: FormData, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur mise à jour");
    return result;
  },

  adminDeleteCategory: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Erreur suppression");
    }
  },

  adminUpdateOrderStatus: async (orderId: string, status: string, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  adminGetStats: async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  adminGetUsers: async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  adminGetUser: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },

  adminUpdateUser: async (id: string, data: Record<string, unknown>, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur API");
    return result;
  },

  adminDeleteUser: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Erreur suppression");
    }
  },

  adminResetPassword: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur API");
    return data;
  },
};

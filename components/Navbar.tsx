"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CartIcon from "./CartIcon";
import { useAuthStore } from "@/store/authStore";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/categories", label: "Catégories" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-100 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-white/95 backdrop-blur-sm py-4"
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/">
        <Image
          src="/logo.png"
          alt="Aura & Style"
          width={50}
          height={45}
          className="w-auto object-contain"
        />
        </Link>
      

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#111] transition-colors hover:text-[#00BCD4]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="w-32 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 pl-10 text-sm outline-none transition-all focus:w-48 focus:border-[#00BCD4] focus:bg-white sm:w-40"
            />
            {isSearchOpen && searchQuery && (
              <Link
                href={`/boutique?q=${encodeURIComponent(searchQuery)}`}
                className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-gray-100 bg-white py-2 shadow-lg"
              >
                <span className="block px-4 py-1 text-sm text-gray-600 hover:bg-gray-50">
                  Rechercher &quot;{searchQuery}&quot; dans la boutique
                </span>
              </Link>
            )}
          </div>
          <CartIcon />
          {user && token ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-100"
              >
                <span className="hidden text-sm text-gray-700 sm:block">
                  Bonjour, {user.firstName || user.email}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00BCD4] text-sm font-bold text-white">
                  {(user.firstName || user.email)[0].toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                    <Link
                      href="/compte"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mon compte
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-full bg-[#00BCD4] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00acc1]"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

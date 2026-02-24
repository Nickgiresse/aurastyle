'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const categories = [
  {
    id: 'vetements',
    name: 'Vêtements',
    description: 'Collections élégantes',
    href: '/boutique?category=vetements',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  },
  {
    id: 'accessoires',
    name: 'Accessoires',
    description: 'Montres & maroquinerie',
    href: '/boutique?category=accessoires',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    description: 'Bijoux personnalisés',
    href: '/boutique?category=bracelets',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
  },
];

export default function CategoryCarousel() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % categories.length);
  }, []);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + categories.length) % categories.length);
  };

  // Auto-scroll toutes les 3.5 secondes sauf si hover
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [isHovered, next]);

  return (
    <section id="categories" className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Titre section */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#00BCD4]">
            Explorez
          </p>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Nos Catégories
          </h2>
        </div>

        {/* Carousel principal */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{ height: '520px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slides */}
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === current ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
              }`}
            >
              {/* Image de fond */}
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover"
              />

              {/* Overlay dégradé */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Contenu */}
              <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#00BCD4]">
                  Collection
                </p>
                <h3 className="mb-3 text-4xl font-bold md:text-5xl">{cat.name}</h3>
                <p className="mb-6 text-lg text-gray-300">{cat.description}</p>
                <Link
                  href={cat.href}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-gray-900 transition-all duration-300 hover:bg-[#00BCD4] hover:text-white"
                >
                  Découvrir
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ))}

          {/* Bouton précédent */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white/40"
          >
            ←
          </button>

          {/* Bouton suivant */}
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white/40"
          >
            →
          </button>

          {/* Indicateur de slide (numéro) */}
          <div className="absolute right-6 top-6 rounded-full bg-black/30 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {current + 1} / {categories.length}
          </div>
        </div>

        {/* Dots navigation */}
        <div className="mt-6 flex justify-center gap-3">
          {categories.map((_, index) => (
            <button
              key={categories[index].id}
              type="button"
              onClick={() => setCurrent(index)}
              className={`rounded-full transition-all duration-300 ${
                index === current ? 'h-3 w-8 bg-[#00BCD4]' : 'h-3 w-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Miniatures des catégories en dessous */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCurrent(index)}
              className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                index === current
                  ? 'scale-100 opacity-100 ring-2 ring-[#00BCD4]'
                  : 'scale-95 opacity-60 hover:scale-100 hover:opacity-80'
              }`}
              style={{ height: '100px' }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-black/30 p-3">
                <span className="text-sm font-semibold text-white">{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

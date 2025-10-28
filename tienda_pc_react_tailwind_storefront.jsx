import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Cpu,
  ChevronDown,
  Trash2,
  Filter as FilterIcon,
  X,
  Moon,
  Sun,
  Star,
} from "lucide-react";

// --- Mock catalog ---
const CATEGORIES = [
  "GPUs",
  "CPUs",
  "Motherboards",
  "RAM",
  "Storage",
  "PSU",
  "Cases",
  "Coolers",
  "Peripherals",
];

const PRODUCTS = [
  {
    id: "gpu-rtx4070",
    name: "NVIDIA GeForce RTX 4070",
    price: 579.99,
    brand: "NVIDIA",
    category: "GPUs",
    rating: 4.7,
    stock: 8,
    image: "/images/nvidiageforcertx.png",
    tags: ["DLSS 3", "12GB GDDR6X"],
  },
  {
    id: "cpu-ryzen7-7800x3d",
    name: "AMD Ryzen 7 7800X3D",
    price: 399.99,
    brand: "AMD",
    category: "CPUs",
    rating: 4.9,
    stock: 5,
    image: "/images/rizen7.png",
    tags: ["AM5", "8-Core", "Gaming"],
  },
  {
    id: "mb-b650-tomahawk",
    name: "MSI B650 Tomahawk",
    price: 219.0,
    brand: "MSI",
    category: "Motherboards",
    rating: 4.5,
    stock: 11,
    image: "/images/msib650.png",
    tags: ["AM5", "ATX", "PCIe 5.0"],
  },
  {
    id: "ram-tridentz-32",
    name: "G.Skill Trident Z RGB 32GB (2x16) 6000MHz",
    price: 129.99,
    brand: "G.Skill",
    category: "RAM",
    rating: 4.6,
    stock: 17,
    image: "/images/gskilltridentz.png",
    tags: ["DDR5", "CL30"],
  },
  {
    id: "ssd-980pro-1tb",
    name: "Samsung 980 Pro 1TB NVMe",
    price: 119.99,
    brand: "Samsung",
    category: "Storage",
    rating: 4.8,
    stock: 22,
    image: "/images/samsung980pro.png",
    tags: ["PCIe 4.0", "7000MB/s"],
  },
  {
    id: "psu-rmx-750",
    name: "Corsair RMx 750W 80+ Gold",
    price: 139.99,
    brand: "Corsair",
    category: "PSU",
    rating: 4.4,
    stock: 9,
    image: "/images/corsairrmx.png",
    tags: ["Modular", "Silent"],
  },
  {
    id: "case-lianli-o11",
    name: "Lian Li O11 Dynamic EVO",
    price: 159.99,
    brand: "Lian Li",
    category: "Cases",
    rating: 4.6,
    stock: 6,
    image: "/images/lianli011Dynamicevo.png",
    tags: ["Tempered Glass", "ATX"],
  },
  {
    id: "cooler-l240",
    name: "NZXT Kraken 240 RGB",
    price: 149.99,
    brand: "NZXT",
    category: "Coolers",
    rating: 4.3,
    stock: 13,
    image: "/images/nzxtkraken.png",
    tags: ["AIO", "ARGB"],
  },
  {
    id: "mouse-gpro-x",
    name: "Logitech G Pro X Superlight",
    price: 129.99,
    brand: "Logitech",
    category: "Peripherals",
    rating: 4.7,
    stock: 12,
    image: "/images/logitech.png",
    tags: ["Wireless", "Ultra-Light"],
  },
];

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

function formatPrice(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(n);
}

function Rating({ value }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={classNames(
            "h-4 w-4",
            i < full ? "fill-current" : half && i === full ? "fill-current/50" : "fill-transparent",
            "text-yellow-500"
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

export default function TiendaPC() {
  const [query, setQuery] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("popular");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState({}); // id -> qty
  const [dark, setDark] = useState(true);

  const brands = useMemo(() => ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.brand)))], []);

  const toggleCat = (c) =>
    setSelectedCats((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      [p.name, p.brand, p.category, ...(p.tags || [])].some((t) => t.toLowerCase().includes(q))
    ).filter((p) =>
      (selectedCats.length ? selectedCats.includes(p.category) : true) &&
      (brand === "All" ? true : p.brand === brand) &&
      p.price >= minPrice && p.price <= maxPrice
    );

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // popular: pretend higher rating & lower price first
        list.sort((a, b) => b.rating - a.rating || a.price - b.price);
    }
    return list;
  }, [query, selectedCats, brand, sort, minPrice, maxPrice]);

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = PRODUCTS.find((p) => p.id === id);
    return acc + (item ? item.price * qty : 0);
  }, 0);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function decFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return c;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }
  function removeFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }
  function clearCart() {
    setCart({});
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Cpu className="h-6 w-6" />
          <span className="font-bold text-lg">Globalaxis Unipessoal</span>
          <div className="ml-4 hidden md:flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-900 px-3 py-2 flex-1">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GPUs, CPU, RAM..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-full border border-slate-200 dark:border-slate-800 p-2 hover:shadow"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-slate-200 dark:border-slate-800 p-2 hover:shadow"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-sky-600 text-white rounded-full px-1.5 py-0.5">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-900 px-3 py-2">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GPUs, CPU, RAM..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-transparent dark:from-sky-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            Build Your Dream PC
          </motion.h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">
            High-performance components, fast shipping, and expert support. Find everything
            you need to game, create, and work.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters */}
        <aside className="lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><FilterIcon className="h-4 w-4"/>Filters</h3>
                <button
                  className="text-xs text-sky-700 dark:text-sky-400 underline"
                  onClick={() => {
                    setSelectedCats([]); setBrand("All"); setMinPrice(0); setMaxPrice(1000); setSort("popular");
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">Categories</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCat(c)}
                      className={classNames(
                        "px-3 py-1.5 rounded-full text-sm border",
                        selectedCats.includes(c)
                          ? "bg-sky-600 text-white border-sky-600"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">Brand</label>
                <div className="relative mt-2">
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 pr-8 text-sm"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">Price</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="text-sm font-medium">Sort by</label>
                <div className="relative mt-2">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 pr-8 text-sm"
                  >
                    <option value="popular">Popularity</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Best Rating</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <h4 className="font-semibold mb-2">Need help?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Our team can advise you to choose the best combination of components according to your budget.
              </p>
              <button className="mt-3 w-full rounded-xl bg-sky-600 text-white px-4 py-2 text-sm font-medium shadow hover:opacity-90">
                Talk to an advisor
              </button>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <section className="lg:col-span-9">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {filtered.length} results
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <motion.div key={p.id} layout className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                <div className="aspect-video overflow-hidden">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover"/>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight">{p.name}</h3>
                      <p className="text-xs text-slate-500">{p.brand} • {p.category}</p>
                    </div>
                    <span className={classNames(
                      "text-xs px-2 py-1 rounded-full",
                      p.stock > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    )}>{p.stock > 0 ? "In stock" : "Out of stock"}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <Rating value={p.rating} />
                    <div className="text-lg font-bold">{formatPrice(p.price)}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(p.tags || []).map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      disabled={p.stock <= 0}
                      onClick={() => addToCart(p.id)}
                      className="flex-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      Add to cart
                    </button>
                    <button
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                      onClick={() => setCartOpen(true)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Galería: Almacén y Oficinas */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Our Facilities</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">A glimpse at our warehouse and offices where we prepare and manage your orders.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Almacén */}
          <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <img src="/images/almacen1.png" alt="Warehouse aisles with shelving" className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <figcaption className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">Warehouse</figcaption>
          </figure>
          <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <img src="/images/paletasconcajaenalmacen.png" alt="Pallets with boxes in warehouse" className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <figcaption className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">Warehouse</figcaption>
          </figure>
          <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <img src="/images/almacen2.png" alt="Packing and logistics area" className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <figcaption className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">Warehouse</figcaption>
          </figure>

          {/* Oficinas */}
          <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <img src="/images/office-1.jpg" alt="Modern office space" className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <figcaption className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">Offices</figcaption>
          </figure>
          <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <img src="/images/office-2.jpg" alt="Meeting room" className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <figcaption className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">Offices</figcaption>
          </figure>
          <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <img src="/images/office-3.jpg" alt="Team working at the office" className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <figcaption className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">Offices</figcaption>
          </figure>
        </div>
      </section>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-lg">Your Cart</h3>
                <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setCartOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-3 overflow-auto h-[calc(100%-180px)]">
                {Object.keys(cart).length === 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Your cart is empty.</p>
                )}
                {Object.entries(cart).map(([id, qty]) => {
                  const item = PRODUCTS.find((p) => p.id === id);
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover"/>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.brand}</p>
                        <div className="mt-1 text-sm font-semibold">{formatPrice(item.price * qty)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decFromCart(id)}
                          className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm">{qty}</span>
                        <button
                          onClick={() => addToCart(id)}
                          className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(id)}
                          className="ml-2 h-8 w-8 grid place-content-center rounded-full border border-slate-200 dark:border-slate-800 text-rose-600"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={clearCart} className="w-1/3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm">
                    Clear
                  </button>
                  <button className="flex-1 rounded-xl bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                    Checkout
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600 dark:text-slate-300 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Globalaxis Unipessoal. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

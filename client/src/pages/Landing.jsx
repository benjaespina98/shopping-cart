import { Link } from 'react-router-dom';
import { FiArrowRight, FiDroplet, FiSun, FiShield, FiHeadphones } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import ImageGallery from '../components/ui/ImageGallery';
import { useCart } from '../context/CartContext';

const features = [
  { Icon: FiDroplet,    title: 'Tratamiento de agua',   desc: 'Productos químicos y equipos para mantener el agua cristalina' },
  { Icon: FiSun,        title: 'Piscinas a medida',      desc: 'Diseño e instalación según tu espacio y presupuesto' },
  { Icon: FiShield,     title: 'Garantía total',          desc: 'Respaldamos todos nuestros productos y servicios' },
  { Icon: FiHeadphones, title: 'Soporte técnico',         desc: 'Te asesoramos antes, durante y después de la compra' },
];

const services = [
  { title: 'Construcción de piscinas', desc: 'Diseñamos y construimos tu piscina ideal, desde proyectos residenciales hasta comerciales.', emoji: '🏊' },
  { title: 'Mantenimiento',            desc: 'Servicio periódico de limpieza, análisis de agua y regulación de químicos.',                  emoji: '🧹' },
  { title: 'Equipos de filtración',    desc: 'Bombas, filtros y sistemas de depuración de las mejores marcas del mercado.',                  emoji: '⚙️' },
  { title: 'Accesorios y químicos',    desc: 'Todo lo que necesitás para disfrutar tu piscina todo el año.',                                  emoji: '🛒' },
];

export default function Landing() {
  const { items } = useCart();
  const [featured, setFeatured] = useState([]);

  const inCartByProductId = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      map.set(item.productId, item.quantity);
    });
    return map;
  }, [items]);

  useEffect(() => {
    productsAPI.getAll({ featured: true, limit: 4 })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-sky-950 via-sky-900 to-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='%2306b6d4' fill-opacity='1' d='M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z'%3E%3C/path%3E%3C/svg%3E\")", backgroundSize: 'cover', backgroundPosition: 'bottom' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <span className="inline-block bg-sol/20 border border-sol/40 text-sol text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                🏊‍♂️ Especialistas en piscinas
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Tu piscina perfecta <span className="text-sol">empieza acá</span>
              </h1>
              <p className="text-lg text-sky-100/80 mb-8 leading-relaxed">
                En <strong className="text-white">Playa y Sol</strong> te ofrecemos todo para construir, equipar y mantener tu piscina con productos de primera calidad y asesoramiento personalizado.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/tienda" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
                  Ver productos <FiArrowRight size={18} />
                </Link>
                <Link to="/contacto" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-2 text-base px-7 py-3 rounded-xl font-semibold transition-colors">
                  Consultanos
                </Link>
              </div>
            </div>

            {/* Stat badges */}
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto md:ml-auto">
              {[
                { n: '+500', l: 'Piscinas instaladas' },
                { n: '+10',  l: 'Años de experiencia' },
                { n: '100%', l: 'Garantía en productos' },
                { n: '24hs', l: 'Respuesta técnica' },
              ].map(({ n, l }) => (
                <div key={l} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-sol">{n}</p>
                  <p className="text-xs text-sky-200 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="bg-slate-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 bg-sol/20 rounded-xl flex items-center justify-center">
                  <Icon size={22} className="text-sol" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Galería</span>
            <h2 className="section-title">Nuestros trabajos</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">
              Cada piscina es única. Mirá algunas de las instalaciones que realizamos para nuestros clientes.
            </p>
          </div>
          <ImageGallery />
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Servicios</span>
            <h2 className="section-title">¿Qué hacemos?</h2>
            <p className="text-slate-500 mt-2">Todo en un solo lugar para tu piscina</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ title, desc, emoji }) => (
              <div key={title} className="card p-6 hover:border-brand transition-colors group cursor-default">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 origin-left">{emoji}</div>
                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-brand transition-colors">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="section-eyebrow">Top picks</span>
                <h2 className="section-title">Productos Destacados</h2>
                <p className="text-slate-500 mt-1">Los más elegidos de nuestra tienda</p>
              </div>
              <Link to="/tienda" className="btn-ghost flex items-center gap-1 text-brand font-semibold">
                Ver todos <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  inCartQuantity={inCartByProductId.get(p._id) || 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-r from-sky-950 to-sky-900 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para tener la piscina de tus sueños?
          </h2>
          <p className="text-sky-200 text-lg mb-8">
            Pedí tu presupuesto sin cargo o comprá nuestros productos directo por WhatsApp
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/tienda"
              className="inline-flex items-center gap-2 bg-sol text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-sol-dark hover:text-white transition-colors text-base active:scale-95">
              Ir a la tienda <FiArrowRight size={18} />
            </Link>
            <Link to="/contacto"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base">
              Pedir presupuesto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

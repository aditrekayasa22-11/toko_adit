import { Link } from 'react-router-dom';
import { BadgeCheck, Box, Heart, Sparkles, Truck } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AuthShell({ title, subtitle, children, footer, badge }) {
  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <div className="auth-orb auth-orb-three" />
      <div className="auth-motion-scene" aria-hidden="true">
        <span className="auth-scene-halo auth-scene-halo-one" />
        <span className="auth-scene-halo auth-scene-halo-two" />
        <span className="auth-scene-ribbon auth-scene-ribbon-one" />
        <span className="auth-scene-ribbon auth-scene-ribbon-two" />
        <span className="auth-scene-spark auth-scene-spark-one">✦</span>
        <span className="auth-scene-spark auth-scene-spark-two">✧</span>
        <span className="auth-scene-spark auth-scene-spark-three">✦</span>
      </div>

      <section className="auth-frame auth-frame-centered">
        <aside className="auth-story">
          <Link to="/produk" className="auth-brand" aria-label="Fashion Store">
            <BrandLogo size="md" tone="inverted" tagline="Fashion & aksesoris" />
          </Link>
          <div className="auth-story-copy">
            <span className="auth-kicker"><Sparkles /> Belanja jadi lebih mudah</span>
            <h2>Temukan gaya yang <span>paling kamu.</span></h2>
            <p>Masuk ke akunmu untuk melanjutkan belanja, memantau pesanan, dan menikmati pengalaman yang lebih personal.</p>
            <div className="auth-benefits">
              <div><Truck /> Gratis ongkir untuk belanja minimal Rp300.000</div>
              <div><Box /> Pantau pesanan dalam satu tempat</div>
              <div><Heart /> Pilihan fashion untuk keseharianmu</div>
            </div>
          </div>
          <div className="auth-promo-card auth-product-spotlight">
            <span className="auth-product-art"><img src="/produk/atasan.svg" alt="" /></span>
            <span className="auth-product-copy"><span className="auth-product-overline">KOLEKSI PILIHAN</span><strong className="block text-sm">Gaya untuk setiap hari</strong><span className="mt-1 block text-xs">Temukan favorit barumu di Fashion Store.</span></span>
            <span className="auth-product-star" aria-hidden="true">✦</span>
          </div>
          <div className="auth-story-decoration" aria-hidden="true" />
        </aside>

        <div className="auth-form-panel">
          <Link to="/produk" className="auth-mobile-brand" aria-label="Fashion Store">
            <BrandLogo size="sm" tone="inverted" />
          </Link>
          <div className="auth-form-content">
            {badge && <span className="auth-form-badge"><span />{badge}</span>}
            <h1>{title}</h1>
            {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 border-t border-slate-100 pt-5">{footer}</div>}
          </div>
          <p className="auth-secure-note"><BadgeCheck className="h-4 w-4" /> Akunmu aman bersama Fashion Store</p>
        </div>
      </section>
    </main>
  );
}

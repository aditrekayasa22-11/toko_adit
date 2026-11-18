export default function BrandLogo({
  size = 'md',
  tone = 'light',
  layout = 'row',
  tagline,
  className = '',
}) {
  return (
    <span className={`brand-logo brand-logo-${size} brand-logo-${tone} brand-logo-${layout} ${className}`}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none">
          <path d="M18 27.5h28l-2.2 27H20.2L18 27.5Z" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M24 28v-5.2a8 8 0 0 1 16 0V28" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <path d="m25.5 42 6.5-8 6.5 8M28.5 39h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m48.5 14 .9 3.1 3.1.9-3.1.9-.9 3.1-.9-3.1-3.1-.9 3.1-.9.9-3.1Z" fill="#FFF3D8" />
          <path d="M13 31.5 11 33l2 1.5 2-1.5-2-1.5Z" fill="#FFF3D8" opacity=".9" />
        </svg>
        <span className="brand-mark-glint" />
      </span>
      <span className="brand-copy">
        <span className="brand-name">Toko <span>Adit</span></span>
        {tagline && <span className="brand-tagline">{tagline}</span>}
      </span>
    </span>
  );
}

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
        <img className="brand-mark-img" src="/logo-emblem.svg" alt="" />
      </span>
      <span className="brand-copy">
        <span className="brand-name">
          <span className="brand-wordmark-main">Fashion</span>
          <span className="brand-wordmark-sub">Store</span>
        </span>
        {tagline && <span className="brand-tagline">{tagline}</span>}
      </span>
    </span>
  );
}

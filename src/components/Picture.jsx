import React from 'react';

export default function Picture({
  src,
  alt,
  widths = [480, 800, 1200],
  sizes = '100vw',
  loading = 'lazy',
  decoding = 'async',
  className,
  style,
  ...imgProps
}) {
  const match = src.match(/\.(jpe?g|png)$/i);

  if (!match) {
    return <img src={src} alt={alt} loading={loading} decoding={decoding} className={className} style={style} {...imgProps} />;
  }

  const base = src.replace(/\.(jpe?g|png)$/i, '');

  const srcSet = (format) => widths.map((width) => `${base}-${width}.${format} ${width}w`).join(', ');

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={className}
        style={style}
        {...imgProps}
      />
    </picture>
  );
}

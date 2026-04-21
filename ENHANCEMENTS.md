# Aerion — Enhancement Pass

Written 2026-04-19. This doc covers two things: (1) what was built in the "surprise me" pass, and (2) the forward roadmap for the rest of the site.

---

## Part 1 — What shipped in this pass

The site was never really "unfinished" — it's a solid React 19 + Vite build with working Razorpay checkout, Firebase auth, Lenis smooth scroll, GSAP ScrollTrigger, a full page set (Home, Series, PDP, Cart, About, Contact, Login, Register, Account), and a live Express/Postgres/Mongo backend with order pipeline, outbox, reservation sweeper, and webhooks. The real gap was first-impression impact: the hero was a text block and a stub `Hero3D.jsx` component sat unused.

This pass added a cohesive **immersive layer** on top of the existing stack — no rewrites, no framework changes.

### Files added

- `src/components/Hero3DParallax.jsx` — real WebGL hero (three.js)
- `src/components/ParallaxLayer.jsx` — generic multi-speed parallax wrapper
- `src/components/ScrollProgress.jsx` — fixed gold progress bar
- `src/components/CustomCursor.jsx` — dot + ring cursor with hover state
- `src/components/PageTransition.jsx` — gold curtain sweep on route change

### Files modified

- `src/pages/Home.jsx` — wired Hero3DParallax into HeroSection, wrapped Philosophy in ParallaxLayer, fixed two copy typos ("Suttlecocks"/"Egineered")
- `src/App.jsx` — mounted ScrollProgress, CustomCursor, PageTransition
- `src/hooks/useTiltEffect.js` — replaced the jittery raw-transform version with a lerp-damped loop, removed the red shadow (was wrong brand color), added cursor-tracking holographic shimmer via CSS variables
- `src/index.css` — ~180 lines of new styles at the bottom under an IMMERSIVE LAYER header (all scoped, nothing overridden)
- `package.json` — added `three@^0.160.0`

### The Hero3DParallax, in plain English

A procedural shuttlecock built at runtime from three.js primitives — a cream half-sphere for the cork, 16 tapered feather planes flared outward, a gold torus rim where they meet, and a soft inner glow disc. Three depth layers of gold-tinted points orbit behind it as a parallax starfield. Lighting is cinematic: a warm key, a gold rim light from behind, soft ambient, and a point light inside the feather cage.

The camera follows the cursor (lerped so it's smooth, not twitchy). Scroll drives the shuttle forward and down while also rotating it around Y — tied to `GSAP ScrollTrigger` with `scrub: true` so it stays in lockstep with Lenis's smooth scroll. The canvas is masked with a radial gradient so the 3D scene fades into the existing CSS gradient instead of showing a hard edge.

Everything cleans up on unmount: geometries and materials disposed, the render loop canceled, event listeners removed, the ScrollTrigger killed.

Respects `prefers-reduced-motion` — the scene renders a static first frame instead of animating. On touch devices the cursor effect disables itself.

### Why three.js and not react-three-fiber?

R3F is lovely but its React 19 peer-dep story is still shaky in the 0.x versions available as of April 2026. Pure three.js with a manual `useEffect` lifecycle avoids any peer-dep surprises and keeps the install to one package.

### Install note

After pulling these changes run:

    npm install

The three.js dep is already in `package.json`, so this will fetch it.

---

## Part 2 — Forward roadmap

Ordered roughly by effort-to-impact ratio. Everything below is scoped so any item can be picked up independently.

### Immediate (days)

**Real product photography pipeline.** Right now every product image is a hot-linked Unsplash URL. That's fine for a prototype but hurts SEO, caching, CLS, and reads as placeholder to anyone paying attention. Build a small upload flow:

- Admin picks images → uploaded to S3 or Cloudinary → optimized variants (`800w`, `1600w`, `AVIF`/`WEBP`) generated on the fly
- Store the CDN URL on the Product model (the schema already exists)
- Add `srcset` + `sizes` to `<img>` so the browser picks the right variant
- While shooting is pending, swap the Unsplash URLs for a local `/public/products/` set of 3–4 AI-generated hero shots to remove the external dependency

**Admin dashboard frontend.** The backend already exposes `/admin/create-admin`, `/admin/reports`, inventory management, and order status endpoints. Build a protected `/admin` route group with a simple data-table UI:

- Orders table (filterable by status, searchable by email/phone)
- Inventory adjustments (stock in/out with reason codes)
- Product CRUD (name, price, series, stock, images, specs)
- Reports view (revenue by day, top SKUs, conversion funnel)

Use the existing auth middleware — the JWT already carries a role claim.

**Hero image upload for 3D scene.** Once real photography lands, swap the procedural feather planes for a `THREE.PlaneGeometry` textured with a product PNG (transparent bg). Shuttlecock photo on a plane with a normal map reads more premium than geometry.

**Copy polish pass.** I caught "Suttlecocks" and "Egineered" on the hero this round. Worth a full sweep with a human editor — About, Contact, and legal pages haven't been reviewed.

### Near-term (weeks)

**Product search & filters.** Series page has a basic category filter. Add:

- Search-as-you-type on product name and tags (client-side Fuse.js is enough at current catalog size)
- Price range slider
- Feather type (goose / duck)
- In-stock toggle
- URL-sync so filters are shareable

**Reviews & ratings.** Critical for badminton gear purchase decisions.

- Verified-purchase badge (only customers with a fulfilled order can review)
- Star rating + short-text review + optional image upload
- Aggregate rating on product cards and PDP
- New backend model + admin moderation queue

**Wishlist.** Low-effort, high-stickiness. Add a heart icon on product cards, persist to `users.wishlist` array. Show count in navbar.

**Abandoned-cart email.** The outbox pattern is already wired for reliability — piggyback on it. Cron job looks for carts with items older than 1h and no completed order → emit an `AbandonedCart` event → nodemailer sends the template. Include a 10% discount code valid 24h.

**Accessibility audit.** The site leans heavily on gold-on-dark which can fail WCAG AA contrast depending on font weight. Run axe-core, fix keyboard traps (especially the cart drawer), verify every interactive element has a focus ring, add `aria-label`s to icon-only buttons, and make sure the custom cursor doesn't interfere with screen-reader focus indicators.

**SEO & social.** Add `react-helmet-async`, set per-page `<title>` / `<meta name="description">` / OpenGraph / Twitter card. Generate `sitemap.xml` at build time. Add `JSON-LD Product` schema on PDPs for Google Shopping.

### Medium-term (month)

**Analytics & funnel instrumentation.** Plausible or PostHog for a privacy-friendly stack. Instrument:

- PageView
- ProductView
- AddToCart
- CheckoutStart
- CheckoutComplete
- OrderRefunded

Pipe events into a dashboard so you can actually read conversion rate by source.

**A/B testing hook.** Behind a feature flag service (GrowthBook is open-source, plays well with React). Start small: test two hero taglines, measure click-through to `/series`.

**Internationalization.** If Aerion targets outside India, wrap strings with `react-intl`, support INR/USD/EUR, and localize Razorpay → Stripe for non-INR regions.

**Progressive Web App.** Vite has a first-class PWA plugin. Offline catalog browsing + install-to-home-screen adds perceived quality with low effort.

**Shared element page transitions.** The curtain is fine for now, but real polish is a product card that morphs into the PDP hero image on click. GSAP Flip plugin handles this in ~30 lines.

### Longer-term / stretch

**Try-before-you-buy AR.** `<model-viewer>` web component lets users drop a 3D shuttlecock (GLTF) into their real environment on supported phones. Niche but very on-brand for a premium sports brand.

**Personalized recommendations.** Once order data builds up: "Players who bought Flight-15 also bought…" is a straightforward collaborative filter. Can ship as a Cloudflare Worker so it doesn't touch the main API.

**Subscription / club model.** "Aerion Club — 2 tubes a month, 20% off, free shipping." Razorpay supports subscriptions natively. Recurring revenue is disproportionately valuable to a niche gear brand.

**Tournament / pro partnerships.** Not code — a growth vector. Sponsor a local tournament, ship logo'd product, use the content to populate a Media section. The site's luxury aesthetic makes this an easy sell.

---

## Part 3 — Known caveats in the current code

Flagging things that exist but could be improved:

- `ShuttleVisualizer.jsx` has a lot of commented-out AI analysis code. Either finish it or delete — right now it's dead weight.
- `Hero3D.jsx` (the old text-only stub) is no longer referenced. Safe to delete.
- Cart uses COD or Razorpay — no Apple Pay / Google Pay / UPI deep-link. Razorpay supports all of these natively, just needs the checkout config.
- Firebase auth and custom JWT both exist. Pick one as the source of truth to avoid drift — probably Firebase for user login, JWT only for the API layer, session mapped on login.
- No rate-limiting on `/contact` or `/register`. `express-rate-limit` is installed but not applied there.
- Env file is `.env` not `.env.example` — check what's committed before going public.

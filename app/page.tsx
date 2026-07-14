'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './landing.css';

const FeedImage = ({ src, heightClass = "h-32" }: { src: string; heightClass?: string }) => (
  <div className={`feed-image relative w-full ${heightClass} overflow-hidden group bg-gray-100`}>
    <img src={src} alt="Feed content" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
  </div>
);

function useCounter(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * (end - start) + start));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  return count;
}


function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none">
      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const savedPercent = useCounter(85, 2500);

  useEffect(() => {
    const onScroll = () => setShowScrollHint(window.scrollY < 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Drag & drop listeners for phone overlay effect
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent) => { if (e.clientX === 0 && e.clientY === 0) setIsDragging(false); };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setJustDropped(true);
      setTimeout(() => setJustDropped(false), 3000);
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Scroll-reveal: any element with class "reveal" fades+slides in when it enters the viewport.
  // Styles are applied via JS rather than CSS so they only activate after the observer fires.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = '1';
            (e.target as HTMLElement).style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 } // trigger when 10% of the element is visible
    );
    document.querySelectorAll('.reveal').forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(20px)';
      (el as HTMLElement).style.transition = 'opacity 700ms ease, transform 700ms ease';
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--glare-x', `${x}%`);
    document.documentElement.style.setProperty('--glare-y', `${y}%`);
  };

  return (
    <div className="landing" onMouseMove={handleMouseMove}>
      {/* Ambient blobs */}
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />

      {/* NAV */}
      <nav className="top">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="6" height="13" rx="1.8" fill="currentColor"/>
              <rect x="11.5" y="2" width="6" height="6" rx="1.8" fill="#ea580c"/>
            </svg>
          </span>
          <span><b>imgora</b><i>.in</i></span>
        </Link>
        <ul>
          <li><a href="#platforms">For social</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="nav-cta">
          <Link href="/converter" className="btn primary">Open converter</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-text">
          <div className="eyebrow">
            <span className="dot" />
            Any phone, any photo → perfect on every platform
          </div>

          <h1 className="headline">
            Any photo,<br />
            <span className="serif">platform-perfect</span> in seconds.
          </h1>

          <p className="sub">
            Drop any photo — from an iPhone, a Vivo, any phone at all — and imgora crops, sharpens
            and colour-tunes it exactly the way Instagram, WhatsApp or Twitter want it, so it still looks
            stunning <em>after</em> they compress it. All in your browser, totally private.
          </p>

          <div className="hero-cta">
            <Link href="/converter" className="btn primary lg">Optimise my photo</Link>
            <a href="#platforms" className="btn lg">See platform presets</a>
          </div>

          <div className="trust-row">
            <div><CheckIcon /> 100% private</div>
            <div><CheckIcon /> Free &amp; unlimited</div>
            <div><CheckIcon /> No signup</div>
          </div>
        </div>

        {/* PHONE MOCKUP */}
        <div className="scene-wrap" aria-hidden="true">
          <div className="phone-stage">

              {/* Floating glassmorphism badges */}
              <div className={`phone-badge phone-badge-left${isDragging ? ' phone-badge-hidden' : ''}`}>
                <div className="phone-badge-icon phone-badge-icon-green">
                  {/* minimize icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="21" y2="3"/><line x1="3" y1="21" x2="14" y2="10"/></svg>
                </div>
                <div className="phone-badge-text">
                  <span className="phone-badge-label">Size Reduction</span>
                  <span className="phone-badge-value">-{savedPercent}%</span>
                </div>
              </div>
              <div className={`phone-badge phone-badge-right${isDragging ? ' phone-badge-hidden' : ''}`}>
                <div className="phone-badge-icon phone-badge-icon-orange">
                  {/* zap icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div className="phone-badge-text">
                  <span className="phone-badge-label">Color Profile</span>
                  <span className="phone-badge-value">sRGB True</span>
                </div>
              </div>

              {/* Titanium outer hardware shell */}
              <div className={`phone-titanium${isDragging ? ' phone-titanium-drag' : ''}`}>

                {/* Hardware side buttons */}
                <div className="phone-btn phone-btn-mute" />
                <div className="phone-btn phone-btn-vol-up" />
                <div className="phone-btn phone-btn-vol-dn" />
                <div className="phone-btn phone-btn-power" />

                {/* Black inner bezel */}
                <div className="phone-bezel">

                  {/* Mouse-tracked glass glare */}
                  <div className="phone-glare" />

                  {/* Static top gloss */}
                  <div className="phone-gloss" />

                  {/* Dynamic Island */}
                  <div className="phone-dynamic-island">
                    <div className="phone-di-camera">
                      <div className="phone-di-lens" />
                    </div>
                    <div className="phone-di-dot" />
                  </div>

                  {/* Drag & drop overlay */}
                  <div className={`phone-drop-overlay${isDragging ? ' phone-drop-overlay-active' : ''}`}>
                    <div className="phone-radar-ring phone-radar-ring-1" />
                    <div className="phone-radar-ring phone-radar-ring-2" />
                    <div className="phone-drop-icon">
                      {/* upload-cloud icon */}
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                    </div>
                    <span className="phone-drop-title">Drop to Convert</span>
                    <span className="phone-drop-sub">Automatic platform sizing</span>
                  </div>

                  {/* Success overlay */}
                  <div className={`phone-success-overlay${justDropped ? ' phone-success-overlay-active' : ''}`}>
                    <div className="phone-success-icon">
                      {/* check icon */}
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="phone-success-title">Perfected!</span>
                  </div>

                  {/* Screen */}
                  <div className={`phone-screen feed-container${isDragging ? ' phone-screen-drag' : ''}`}>
                    <div className="phone-screen-fade-top" />
                    <div className="phone-screen-fade-bottom" />

                    <div className="feed-track">
                      {[0, 1].map(copy => (
                        <div key={copy} className="feed-cards">

                          {/* Twitter / X */}
                          <div className="feed-card">
                            <div className="fc-topbar">
                              <div className="fc-avatar-x">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </div>
                              <div className="fc-meta"><div className="fc-handle">@yourhandle</div><div className="fc-time">1m</div></div>
                              <div className="fc-badge fc-bd-tw">𝕏</div>
                            </div>
                            <FeedImage src="/feed/feed-twitter.jpg" heightClass="fc-img-h-landscape" />
                            <div className="fc-footer">
                              <span className="fc-spec-dim">1600 × 900</span><span className="fc-dot-sep" />
                              <span className="fc-spec-accent">JPG</span><span className="fc-dot-sep" />
                              <span className="fc-spec-dim">85%</span>
                            </div>
                          </div>

                          {/* Instagram Story */}
                          <div className="feed-card">
                            <div className="fc-topbar">
                              <div className="fc-avatar-ig-ring">
                                <div className="fc-avatar-ig-inner">
                                  <img src="/feed/avatar-story.jpg" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                              </div>
                              <div className="fc-meta"><div className="fc-handle">Story</div><div className="fc-time">now</div></div>
                              <div className="fc-badge fc-bd-st">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                              </div>
                            </div>
                            <FeedImage src="/feed/feed-story.jpg" heightClass="fc-img-h-tall" />
                            <div className="fc-footer">
                              <span className="fc-spec-dim">1080 × 1920</span><span className="fc-dot-sep" />
                              <span className="fc-spec-accent">JPG</span><span className="fc-dot-sep" />
                              <span className="fc-spec-dim">85%</span>
                            </div>
                          </div>

                          {/* LinkedIn */}
                          <div className="feed-card">
                            <div className="fc-topbar">
                              <div className="fc-avatar-photo">
                                <img src="/feed/avatar-linkedin.jpg" alt="Avatar" className="w-full h-full object-cover" />
                              </div>
                              <div className="fc-meta"><div className="fc-handle">LinkedIn</div><div className="fc-time">now</div></div>
                              <div className="fc-badge fc-bd-ln">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                              </div>
                            </div>
                            <FeedImage src="/feed/feed-linkedin.jpg" heightClass="fc-img-h-medium" />
                            <div className="fc-footer">
                              <span className="fc-spec-dim">1200 × 627</span><span className="fc-dot-sep" />
                              <span className="fc-spec-accent">JPG</span><span className="fc-dot-sep" />
                              <span className="fc-spec-dim">90%</span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                    {/* Home indicator inside screen */}
                    <div className="phone-home-bar-inner">
                      <div className="phone-home-bar" />
                    </div>
                  </div>

                </div>
              </div>

          </div>
        </div>

      </header>

      {/* Scroll hint chevron */}
      <a
        href="#platforms"
        className={`hero-scroll-hint${showScrollHint ? '' : ' hero-scroll-hint-hidden'}`}
        aria-label="Scroll down"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 6.5 12 12.5 18 6.5" />
          <polyline points="6 13 12 19 18 13" />
        </svg>
      </a>

      {/* PLATFORM GRID */}
      <section id="platforms" className="reveal">
        <div className="sec-eyebrow">For every platform</div>
        <h2 className="sec-title">One source. <span className="serif">Eight perfect outputs.</span></h2>
        <p className="sec-sub">
          Every platform compresses, resizes and re-encodes your photo behind the scenes.
          imgora pre-tunes the JPG so what they post is what you saw.
        </p>

        <div className="plats">
          <Link href="/converter?pf=instagram" className="plat" data-pf="instagram">
            <div className="plat-icon">IG</div>
            <div className="plat-title">Instagram</div>
            <div className="plat-sub">Feed photo · 1:1</div>
            <div className="plat-spec"><span><b>SIZE</b> 1080 × 1080</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=ig-story" className="plat" data-pf="ig-story">
            <div className="plat-icon">ST</div>
            <div className="plat-title">IG Story</div>
            <div className="plat-sub">Full-screen · 9:16</div>
            <div className="plat-spec"><span><b>SIZE</b> 1080 × 1920</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=whatsapp" className="plat" data-pf="whatsapp">
            <div className="plat-icon">WA</div>
            <div className="plat-title">WhatsApp</div>
            <div className="plat-sub">Survives re-compress</div>
            <div className="plat-spec"><span><b>SIZE</b> 1600 × 1200</span><span><b>Q</b> 78%</span></div>
          </Link>
          <Link href="/converter?pf=twitter" className="plat" data-pf="twitter">
            <div className="plat-icon">𝕏</div>
            <div className="plat-title">Twitter · X</div>
            <div className="plat-sub">Inline · 16:9</div>
            <div className="plat-spec"><span><b>SIZE</b> 1600 × 900</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=facebook" className="plat" data-pf="facebook">
            <div className="plat-icon">F</div>
            <div className="plat-title">Facebook</div>
            <div className="plat-sub">Feed photo · 1.91:1</div>
            <div className="plat-spec"><span><b>SIZE</b> 1200 × 630</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=linkedin" className="plat" data-pf="linkedin">
            <div className="plat-icon">in</div>
            <div className="plat-title">LinkedIn</div>
            <div className="plat-sub">Post &amp; share preview</div>
            <div className="plat-spec"><span><b>SIZE</b> 1200 × 627</span><span><b>Q</b> 85%</span></div>
          </Link>
          <Link href="/converter?pf=email" className="plat" data-pf="email">
            <div className="plat-icon">@</div>
            <div className="plat-title">Email</div>
            <div className="plat-sub">Under 1 MB, no alarms</div>
            <div className="plat-spec"><span><b>SIZE</b> 1920 × 1080</span><span><b>Q</b> 72%</span></div>
          </Link>
          <Link href="/converter?pf=web" className="plat" data-pf="web">
            <div className="plat-icon">W</div>
            <div className="plat-title">Web · Blog</div>
            <div className="plat-sub">Fast-loading hero</div>
            <div className="plat-spec"><span><b>SIZE</b> 1920 wide</span><span><b>Q</b> 80%</span></div>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="reveal">
        <div className="sec-eyebrow">How it works</div>
        <h2 className="sec-title">Three steps. <span className="serif">No surprises.</span></h2>

        <div className="how">
          <div className="step">
            <div>
              <div className="step-num">01</div>
              <h4>Drop any photo</h4>
              <p>HEIC, JPG, PNG or WebP — drag it straight from your camera roll, downloads or anywhere else.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <div className="step-num">02</div>
              <h4>Pick where you&rsquo;re sharing</h4>
              <p>Choose Instagram, WhatsApp, Twitter or any other platform. We handle the size, quality and colour profile automatically.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <div className="step-num">03</div>
              <h4>Preview, fine-tune &amp; download</h4>
              <p>See a before/after comparison, adjust sharpness, brightness or the crop if you like — then download and post. No upload, no account, no waiting.</p>
            </div>
          </div>
        </div>
        <div className="how-cta">
          <Link href="/converter" className="btn primary lg">Try it now — it&rsquo;s free</Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="reveal">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">Good questions, <span className="serif">straight answers.</span></h2>

        <div className="faq faq-section">
          <details className="qa" open>
            <summary>What does imgora actually do?</summary>
            <p>imgora takes any photo from any phone — HEIC, JPG, PNG or WebP — and outputs a JPG that is exactly sized, cropped, sharpened and colour-tuned for the platform you&rsquo;re sharing to. You get a before/after preview to fine-tune sharpness, brightness and the crop before you download. No guessing, no quality loss from double-compression.</p>
          </details>
          <details className="qa">
            <summary>Why does each platform need a different version of my photo?</summary>
            <p>Every social platform re-encodes whatever you upload with its own lossy compression. If you give Instagram a 4032×3024 photo, it downscales and re-compresses it — and your photo loses quality twice. imgora pre-tunes the JPG to exactly what each platform wants, so there&rsquo;s only one round of compression and your photo looks its best.</p>
          </details>
          <details className="qa">
            <summary>What photo formats does it accept?</summary>
            <p>Any common image format — HEIC, JPG, PNG, WebP, GIF and BMP. iPhone photos, Android shots, screenshots, anything. Whatever you drop in, you get a perfectly optimised JPG out.</p>
          </details>
          <details className="qa">
            <summary>Are my photos private?</summary>
            <p>Completely. imgora processes everything in your browser — nothing is uploaded to any server. You can disconnect from the internet after the page loads and it will still work.</p>
          </details>
          <details className="qa">
            <summary>What happens to location data and EXIF?</summary>
            <p>We remove all metadata automatically from every converted file — capture date, camera info and GPS location are stripped, so your home location never gets baked into the photo you post.</p>
          </details>
          <details className="qa">
            <summary>Can I optimise multiple photos at once?</summary>
            <p>Yes. Drop a whole folder and you&rsquo;ll get a folder of platform-optimised JPGs back, or download them as a single ZIP.</p>
          </details>
          <details className="qa">
            <summary>Will my photo lose quality?</summary>
            <p>Only the minimum needed. imgora uses the exact quality setting each platform prefers, and lightly re-sharpens after resizing so your photo looks as crisp after posting as it did before.</p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-block reveal">
        <h3>
          Your photo, optimised for<br />
          <span className="serif">every platform in seconds.</span>
        </h3>
        <p>Drop any photo, pick where you&rsquo;re sharing it, download and post. That&rsquo;s it.</p>
        <Link href="/converter" className="btn primary lg">Optimise my photo — it&rsquo;s free</Link>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="foot-inner">
          <div className="foot-brand">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="6" height="13" rx="1.8" fill="currentColor"/>
                  <rect x="11.5" y="2" width="6" height="6" rx="1.8" fill="#ea580c"/>
                </svg>
              </span>
              <span><b>imgora</b><i>.in</i></span>
            </div>
            <p>Private, browser-based photo perfecter — any photo, from any phone, tuned for the platforms you actually use.</p>
          </div>
          <div className="foot-links">
            <Link href="/converter">Converter</Link>
            <Link href="/heif-to-jpg">HEIF → JPG</Link>
            <a href="#faq">FAQ</a>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 imgora.in · Made for the open web.</span>
          <span className="foot-version">v0.3.0</span>
        </div>
      </footer>
    </div>
  );
}

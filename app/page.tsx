'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import './landing.css';

function MtnSvg() {
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="none">
      <path d="M0,140 L60,90 L100,110 L160,60 L220,100 L280,50 L340,90 L400,70 L400,200 L0,200 Z" fill="#4a334d" opacity="0.9"/>
      <path d="M0,160 L50,130 L110,150 L180,110 L240,140 L310,120 L400,150 L400,200 L0,200 Z" fill="#291f3d" opacity="0.95"/>
      <path d="M0,185 L60,175 L140,180 L220,170 L300,180 L400,175 L400,200 L0,200 Z" fill="#13102a"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none">
      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // 3D scene mouse parallax + auto-orbit
  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;

    let mouseRX = 0, mouseRY = 0;
    let curRX = -6, curRY = -10;
    const t0 = performance.now();
    let rafId: number;

    const onMove = (e: { clientX: number; clientY: number }) => {
      const r = scene.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      mouseRY = cx * 24;
      mouseRX = -cy * 16;
    };

    const onMouseMove = (e: MouseEvent) => onMove(e);
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) onMove(e.touches[0]); };
    const onMouseLeave = () => { mouseRX = 0; mouseRY = 0; };

    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      const autoRY = Math.sin(t * 0.35) * 8;
      const autoRX = Math.sin(t * 0.5 + 1) * 3;
      const targetRY = autoRY + mouseRY;
      const targetRX = autoRX + mouseRX - 6;
      curRY += (targetRY - curRY) * 0.06;
      curRX += (targetRX - curRX) * 0.06;
      stage.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    scene.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      scene.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll reveal
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
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(20px)';
      (el as HTMLElement).style.transition = 'opacity 700ms ease, transform 700ms ease';
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing">
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
            HEIF → JPG · pre-optimised for every platform
          </div>

          <h1 className="headline">
            iPhone photos,<br />
            <span className="serif">share-ready</span> in one click.
          </h1>

          <p className="sub">
            Convert HEIF to JPG and have it sized, compressed and colour-tuned exactly the way
            Instagram, WhatsApp or Twitter actually want it. All in your browser.
          </p>

          <div className="hero-cta">
            <Link href="/converter" className="btn primary lg">Convert HEIF → JPG</Link>
            <a href="#platforms" className="btn lg">See platform presets</a>
          </div>

          <div className="trust-row">
            <div><CheckIcon /> 100% private</div>
            <div><CheckIcon /> Free &amp; unlimited</div>
            <div><CheckIcon /> No signup</div>
          </div>
        </div>

        {/* 3D SCENE */}
        <div className="scene-wrap" aria-hidden="true">
          <div className="scene" ref={sceneRef}>
            <div className="stage3d" ref={stageRef}>
              {/* Center HEIF source */}
              <div className="card3 c-heif center">
                <div className="pic">
                  <div className="mtn"><MtnSvg /></div>
                </div>
                <div className="label">sunset<span className="dim">.heif</span> · 3.2 MB</div>
              </div>

              <div className="card3 c-ig">
                <div className="pin">IG</div>
                <div className="pic"><div className="mtn"><MtnSvg /></div></div>
                <div className="label">1080² · 540 KB</div>
              </div>

              <div className="card3 c-story">
                <div className="pin">ST</div>
                <div className="pic"><div className="mtn"><MtnSvg /></div></div>
                <div className="label">9:16 · 620 KB</div>
              </div>

              <div className="card3 c-wa">
                <div className="pin">WA</div>
                <div className="pic"><div className="mtn"><MtnSvg /></div></div>
                <div className="label">1600×1200 · 310 KB</div>
              </div>

              <div className="card3 c-tw">
                <div className="pin">𝕏</div>
                <div className="pic"><div className="mtn"><MtnSvg /></div></div>
                <div className="label">1600×900 · 420 KB</div>
              </div>

              <div className="card3 c-fb">
                <div className="pin">F</div>
                <div className="pic"><div className="mtn"><MtnSvg /></div></div>
                <div className="label">1200×630 · 280 KB</div>
              </div>

              <div className="card3 c-email">
                <div className="pin">@</div>
                <div className="pic"><div className="mtn"><MtnSvg /></div></div>
                <div className="label">1920×1080 · 240 KB</div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
              <h4>Drop your HEIF</h4>
              <p>Drag any .heif or .heic photo straight from your iPhone, AirDrop folder or downloads.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <div className="step-num">02</div>
              <h4>Pick a platform</h4>
              <p>Tap the place you&rsquo;re going to share it. We handle the size, quality and colour profile.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <div className="step-num">03</div>
              <h4>Download &amp; post</h4>
              <p>A ready-to-share JPG lands on your device the moment it&rsquo;s done.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="reveal">
        <div className="sec-eyebrow">FAQ</div>
        <h2 className="sec-title">HEIF to JPG, <span className="serif">answered.</span></h2>

        <div className="faq" style={{ marginTop: '50px' }}>
          <details className="qa" open>
            <summary>Why convert HEIF to JPG?</summary>
            <p>HEIF is what iPhones save by default — it&rsquo;s efficient but lots of apps, websites and Windows machines can&rsquo;t open it. JPG is the universal format that works everywhere.</p>
          </details>
          <details className="qa">
            <summary>Why does each platform need a different JPG?</summary>
            <p>Every social platform re-encodes whatever you upload. If you give Instagram a 4032×3024 photo, it downscales to 1080×1080 with its own lossy compression — and your photo loses quality twice. By giving the platform exactly what it wants, you keep the only round of compression.</p>
          </details>
          <details className="qa">
            <summary>Are my photos actually private?</summary>
            <p>Yes. imgora decodes and re-encodes everything in your browser using built-in image APIs. Nothing is uploaded. You can disconnect from the internet after the page loads and conversion will still work.</p>
          </details>
          <details className="qa">
            <summary>What about location data and EXIF?</summary>
            <p>By default we strip metadata when targeting a social platform — your home location doesn&rsquo;t accidentally get baked into the file. You can disable this in the converter&rsquo;s settings if you want to keep capture date and camera info.</p>
          </details>
          <details className="qa">
            <summary>Can I convert many at once?</summary>
            <p>Yes. Drop a whole folder of HEIFs and you&rsquo;ll get a folder of platform-optimised JPGs back.</p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-block reveal">
        <h3>
          Stop AirDropping back to yourself.<br />
          <span className="serif">Convert one in 3 seconds.</span>
        </h3>
        <p>Open the converter, drop a HEIF, pick where you&rsquo;re sharing it. That&rsquo;s the whole onboarding.</p>
        <Link href="/converter" className="btn primary lg">Open converter →</Link>
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
            <p>Private, browser-based HEIF to JPG — pre-optimised for the platforms you actually use.</p>
          </div>
          <div className="foot-links">
            <Link href="/converter">Converter</Link>
            <Link href="/heif-to-jpg">HEIF → JPG</Link>
            <a href="#platforms">Platforms</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2025 imgora.in · Made for the open web.</span>
          <span style={{ fontFamily: 'var(--mono)' }}>v0.3.0 · made in IN</span>
        </div>
      </footer>
    </div>
  );
}

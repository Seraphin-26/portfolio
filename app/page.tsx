"use client";

import { portfolio } from "@/data/portfolio";
import { useState, useEffect, useRef, MutableRefObject } from "react";
import type { CSSProperties } from "react";

/* ─── TYPES ─── */
interface Challenge { problem: string; solution: string; }
interface Project {
  id: number; slug: string; title: string; description: string;
  longDescription: string; image: string; metrics: string[];
  tags: string[]; github: string; live: string | null; featured: boolean;
  challenges: Challenge[]; screenshots: string[];
}
interface Testimonial { id: number; name: string; role: string; avatar: string; text: string; }
interface Badge { label: string; icon: string; color: string; }
interface GHStats { repos: number; followers: number; following: number; }

// Extend CSSProperties to allow CSS custom properties
interface CustomCSS extends CSSProperties {
  [key: `--${string}`]: string | number;
}

/* ─── THEME ─── */
function useTheme(): [boolean, (v: boolean) => void] {
  const [dark, setDark] = useState<boolean>(true);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark];
}

/* ─── CURSOR ─── */
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf: number;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", move);
    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (dot.current) dot.current.style.transform = `translate(${mx - 4}px,${my - 4}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx - 20}px,${ry - 20}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const over = () => ring.current?.classList.add("cursor-hover");
    const out = () => ring.current?.classList.remove("cursor-hover");
    document.querySelectorAll("a,button").forEach(el => {
      el.addEventListener("mouseenter", over);
      el.addEventListener("mouseleave", out);
    });
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}

/* ─── REVEAL HOOK ─── */
function useReveal(): [MutableRefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState<boolean>(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

/* ─── GITHUB STATS ─── */
function GitHubStats() {
  const [stats, setStats] = useState<GHStats | null>(null);
  const [ref, v] = useReveal();
  useEffect(() => {
    fetch(`https://api.github.com/users/${portfolio.githubUsername}`)
      .then(r => r.json())
      .then(d => setStats({ repos: d.public_repos, followers: d.followers, following: d.following }))
      .catch(() => setStats({ repos: 42, followers: 318, following: 95 }));
  }, []);
  return (
    <div ref={ref} className={`gh-stats ${v ? "revealed" : ""}`}>
      <div className="gh-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.09.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.338c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.577.688.479C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
        <span>Live GitHub Stats</span>
        <span className="gh-live">● live</span>
      </div>
      <div className="gh-numbers">
        {([
          { label: "Public Repos", value: stats?.repos ?? "—" },
          { label: "Followers",    value: stats?.followers ?? "—" },
          { label: "Following",    value: stats?.following ?? "—" },
        ] as { label: string; value: number | string }[]).map(s => (
          <div key={s.label} className="gh-stat">
            <span className="gh-num">{s.value}</span>
            <span className="gh-label">{s.label}</span>
          </div>
        ))}
      </div>
      <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="gh-link">
        View full profile →
      </a>
    </div>
  );
}

/* ─── NAV ─── */
function Nav({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const [scrolled, setScrolled] = useState<boolean>(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <span className="nav-logo">{portfolio.name.split(" ")[0]}<span className="accent">.</span></span>
      <div className="nav-links">
        <a href="#about">A propos</a>
        <a href="#projects">Projets</a>
        <a href="#skills">Competences</a>
        <a href="#testimonials">Avis</a>
        <a href="#contact" className="nav-cta">Parlons →</a>
        <button className="theme-toggle" onClick={() => setDark(!dark)} title="Toggle theme" aria-label="Toggle theme">
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="status-dot" />
          <span>Nouveaux projets disponibles</span>
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line">Construction</span>
          <span className="hero-title-line hero-title-indent">page web<span className="accent">.</span></span>
          <span className="hero-title-line">dynamique.</span>
        </h1>
        <p className="hero-bio">{portfolio.tagline}</p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary">
            Voir mon travail
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href={portfolio.cvUrl} download className="btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Telecharger CV
          </a>
          <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="btn-ghost">GitHub</a>
        </div>
      </div>
      <div className="hero-meta">
        {([
          { label: "Emplacement",   val: portfolio.location },
          { label: "Experience",    val: "5 ans" },
          { label: "Se concentrer", val: "Fullstack JS" },
          { label: "Status",        val: "Ouvert au travail" },
        ] as { label: string; val: string }[]).map(m => (
          <div key={m.label} className="hero-meta-item">
            <span className="meta-label">{m.label}</span>
            <span>{m.val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── ABOUT ─── */
function About() {
  const [ref, v] = useReveal();
  return (
    <section id="about" className="section about-section">
      <div ref={ref} className={`about-layout ${v ? "revealed" : ""}`}>
        <div className="about-photo-wrap">
          <img src={portfolio.photo} alt={portfolio.name} className="about-photo" />
          <div className="about-photo-border" />
          <div className="currently-card">
            <p className="currently-title">Currently</p>
            <div className="currently-items">
              <div className="currently-item"><span className="ci-icon">📚</span><span><strong>Reading</strong> {portfolio.currently.reading}</span></div>
              <div className="currently-item"><span className="ci-icon">🔨</span><span><strong>Building</strong> {portfolio.currently.building}</span></div>
              <div className="currently-item"><span className="ci-icon">🧠</span><span><strong>Learning</strong> {portfolio.currently.learning}</span></div>
            </div>
          </div>
        </div>
        <div className="about-content">
          <p className="section-label">A propos de moi</p>
          <h2 className="section-title">Coder avec <em>un but</em></h2>
          <p className="about-bio">{portfolio.bio}</p>
          <p className="about-vision">{portfolio.vision}</p>
          <div className="about-badges">
            {(portfolio.badges as Badge[]).map(b => (
              <div key={b.label} className="cert-badge" style={{ "--badge-color": b.color } as CustomCSS}>
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
          <GitHubStats />
        </div>
      </div>
    </section>
  );
}

/* ─── PROJECT CARD ─── */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <article
      className="project-card"
      style={{ "--delay": `${index * 0.1}s` } as CustomCSS}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="project-image-wrap">
        <img src={project.image} alt={project.title} className={`project-image ${hovered ? "zoomed" : ""}`} loading="lazy" />
        <div className="project-image-overlay" />
        {project.featured && <span className="project-badge">Featured</span>}
        <div className={`project-metrics-overlay ${hovered ? "visible" : ""}`}>
          {project.metrics.map((m: string) => <span key={m} className="metric-chip">{m}</span>)}
        </div>
      </div>
      <div className="project-body">
        <div className="project-tags">
          {project.tags.slice(0, 4).map((t: string) => <span key={t} className="tag">{t}</span>)}
        </div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-links">
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.09.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.338c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.577.688.479C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
          <span className="project-link project-link--detail" style={{ cursor: "pointer" }}>Case study →</span>
          {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer" className="project-link project-link--live">Live ↗</a>}
        </div>
      </div>
    </article>
  );
}

/* ─── PROJECT DETAIL MODAL ─── */
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <img src={project.screenshots[0]} alt={project.title} className="modal-hero-img" />
          <div className="modal-header-overlay" />
          <div className="modal-header-content">
            <div className="project-tags">
              {project.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
            </div>
            <h2 className="modal-title">{project.title}</h2>
            <div className="modal-metrics">
              {project.metrics.map((m: string) => <span key={m} className="metric-chip">{m}</span>)}
            </div>
          </div>
        </div>
        <div className="modal-body">
          <p className="modal-desc">{project.longDescription}</p>
          <h3 className="modal-section-title">Challenges &amp; Solutions</h3>
          <div className="modal-challenges">
            {project.challenges.map((c: Challenge, i: number) => (
              <div key={i} className="challenge-item">
                <div className="challenge-problem"><span className="challenge-icon">⚠️</span><strong>{c.problem}</strong></div>
                <div className="challenge-solution"><span className="challenge-icon">✅</span><span>{c.solution}</span></div>
              </div>
            ))}
          </div>
          {project.screenshots.length > 1 && (
            <>
              <h3 className="modal-section-title">Screenshots</h3>
              <div className="modal-screenshots">
                {project.screenshots.map((s: string, i: number) => (
                  <img key={i} src={s} alt={`Screenshot ${i + 1}`} className="modal-screenshot" />
                ))}
              </div>
            </>
          )}
          <div className="modal-actions">
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-primary">View on GitHub</a>
            {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn-ghost">Live Demo ↗</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PROJECTS ─── */
function Projects() {
  const [ref, v] = useReveal();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  return (
    <section id="projects" className="section">
      <div ref={ref} className={`section-header ${v ? "revealed" : ""}`}>
        <p className="section-label">Travail selectionne</p>
        <h2 className="section-title">Des projets qui <em>comptent</em></h2>
      </div>
      <div className={`projects-grid ${v ? "revealed" : ""}`}>
        {(portfolio.projects as Project[]).map((p: Project, i: number) => (
          <div key={p.id} onClick={() => setActiveProject(p)} style={{ cursor: "pointer" }}>
            <ProjectCard project={p} index={i} />
          </div>
        ))}
      </div>
      <p className="projects-hint">Cliquez sur une carte pour voir l&apos;étude de cas complète</p>
      {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />}
    </section>
  );
}

/* ─── SKILLS ─── */
function Skills() {
  const [ref, v] = useReveal();
  return (
    <section id="skills" className="section">
      <div ref={ref} className={`section-header ${v ? "revealed" : ""}`}>
        <p className="section-label">Competence</p>
        <h2 className="section-title">The <em>stack</em></h2>
      </div>
      <div className={`skills-grid ${v ? "revealed" : ""}`}>
        {(portfolio.skills as { category: string; items: string[] }[]).map((group, gi: number) => (
          <div key={group.category} className="skill-group" style={{ "--delay": `${gi * 0.08}s` } as CustomCSS}>
            <h3 className="skill-category">{group.category}</h3>
            <div className="skill-badges">
              {group.items.map((item: string, ii: number) => (
                <span key={item} className="skill-badge" style={{ "--badge-delay": `${gi * 0.08 + ii * 0.04}s` } as CustomCSS}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const [ref, v] = useReveal();
  return (
    <section id="testimonials" className="section testimonials-section">
      <div ref={ref} className={`section-header ${v ? "revealed" : ""}`}>
        <p className="section-label">Preuve sociale</p>
        <h2 className="section-title">Ce que disent les <em>gens</em></h2>
      </div>
      <div className={`testimonials-grid ${v ? "revealed" : ""}`}>
        {(portfolio.testimonials as Testimonial[]).map((t: Testimonial, i: number) => (
          <div key={t.id} className="testimonial-card" style={{ "--delay": `${i * 0.12}s` } as CustomCSS}>
            <div className="testimonial-quote">&ldquo;</div>
            <p className="testimonial-text">{t.text}</p>
            <div className="testimonial-author">
              <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
              <div>
                <p className="testimonial-name">{t.name}</p>
                <p className="testimonial-role">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CONTACT ─── */
function Contact() {
  const [ref, v] = useReveal();
  const [form, setForm] = useState<{ name: string; email: string; message: string }>({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1500);
  };
  return (
    <section id="contact" className="section contact-section">
      <div ref={ref} className={`section-header ${v ? "revealed" : ""}`}>
        <p className="section-label">Entrer en contact</p>
        <h2 className="section-title">Construisons <em>quelque chose</em></h2>
      </div>
      <div className={`contact-layout ${v ? "revealed" : ""}`}>
        <div className="contact-info">
          <p className="contact-bio">{portfolio.bio}</p>
          <div className="contact-details">
            <a href={`mailto:${portfolio.email}`} className="contact-email">{portfolio.email}</a>
            <div className="contact-socials">
              <a href={portfolio.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <a href={portfolio.cvUrl} download className="btn-secondary cv-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Telecharger mon CV
          </a>
        </div>
        <form className="contact-form" onSubmit={submit}>
          {status === "sent" ? (
            <div className="form-success">
              <span className="success-icon">✓</span>
              <p>Message reçu. Je vous répondrai bientôt.</p>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="name">Nom</label>
                  <input id="name" name="name" type="text" placeholder="Votre nom" value={form.name} onChange={handle} required />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" placeholder="votre@email.com" value={form.email} onChange={handle} required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" placeholder="Parlez-moi de votre projet..." value={form.message} onChange={handle} rows={5} required />
              </div>
              <button type="submit" className="btn-primary btn-submit" disabled={status === "sending"}>
                {status === "sending" ? "Envoi..." : "Envoyer le message →"}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="footer">
      <span>{portfolio.name} — {new Date().getFullYear()}</span>
      <span>Construit avec Next.js &amp; Tailwind CSS</span>
    </footer>
  );
}

/* ─── PAGE ─── */
export default function Page() {
  const [dark, setDark] = useTheme();
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#0a0a0b;--bg-2:#111113;--bg-3:#1a1a1e;
          --border:rgba(255,255,255,0.07);
          --text:#e8e8ec;--text-muted:#6b6b78;
          --accent:#c8ff3e;--accent-dim:rgba(200,255,62,0.1);
          --radius:12px;
          --font-display:'Playfair Display',Georgia,serif;
          --font-body:'DM Sans',system-ui,sans-serif;
          --font-mono:'DM Mono',monospace;
          --shadow:0 24px 64px rgba(0,0,0,0.5);
        }
        [data-theme="light"]{
          --bg:#f5f5f0;--bg-2:#ebebE6;--bg-3:#e0e0da;
          --border:rgba(0,0,0,0.08);
          --text:#1a1a1e;--text-muted:#6b6b78;
          --shadow:0 24px 64px rgba(0,0,0,0.12);
          --accent:#2563eb;
          --accent-dim:rgba(37,99,235,0.10);
        }
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;transition:background 0.3s,color 0.3s;}
        a{color:inherit;text-decoration:none;}
        img{display:block;width:100%;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:var(--bg);}
        ::-webkit-scrollbar-thumb{background:var(--bg-3);border-radius:4px;}

        /* CURSOR */
        @media(pointer:fine){
          *{cursor:none!important;}
          .cursor-dot{position:fixed;top:0;left:0;width:8px;height:8px;background:var(--accent);border-radius:50%;pointer-events:none;z-index:9999;}
          .cursor-ring{position:fixed;top:0;left:0;width:40px;height:40px;border:1.5px solid var(--accent);border-radius:50%;pointer-events:none;z-index:9998;opacity:.5;transition:width .2s,height .2s;}
          .cursor-ring.cursor-hover{width:56px;height:56px;opacity:.8;}
        }
        .accent{color:var(--accent);}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4vw;transition:background .3s,border-color .3s;border-bottom:1px solid transparent;}
        .nav--scrolled{background:rgba(10,10,11,0.85);backdrop-filter:blur(20px);border-color:var(--border);}
        [data-theme="light"] .nav--scrolled{background:rgba(245,245,240,0.85);}
        .nav-logo{font-family:var(--font-display);font-size:1.2rem;font-weight:700;letter-spacing:-.02em;}
        .nav-links{display:flex;align-items:center;gap:1.75rem;}
        .nav-links a{font-size:.875rem;color:var(--text-muted);transition:color .2s;}
        .nav-links a:hover{color:var(--text);}
        .nav-cta{color:var(--accent)!important;font-weight:500;border:1px solid rgba(200,255,62,.3);padding:.35rem .9rem;border-radius:999px;transition:background .2s!important;}
        [data-theme="light"] .nav-cta{border-color:rgba(37,99,235,.3)!important;}
        .nav-cta:hover{background:var(--accent-dim)!important;}
        .theme-toggle{background:var(--bg-3);border:1px solid var(--border);border-radius:999px;padding:.3rem .65rem;font-size:.9rem;cursor:pointer;color:var(--text);transition:background .2s;}
        .theme-toggle:hover{background:var(--bg-2);}

        /* HERO */
        .hero{position:relative;min-height:100svh;display:grid;grid-template-rows:1fr auto;padding:10rem 4vw 4rem;overflow:hidden;}
        .hero-noise{position:absolute;inset:0;opacity:.03;pointer-events:none;}
        .hero-eyebrow{display:inline-flex;align-items:center;gap:.5rem;font-size:.8125rem;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:2.5rem;animation:fadeUp .8s ease both;}
        .status-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:pulse 2s ease infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(.85);}}
        .hero-title{font-family:var(--font-display);font-size:clamp(3.5rem,10vw,8.5rem);font-weight:900;line-height:.95;letter-spacing:-.03em;margin-bottom:2rem;}
        .hero-title-line{display:block;animation:fadeUp .8s ease both;}
        .hero-title-line:nth-child(2){animation-delay:.1s;}
        .hero-title-line:nth-child(3){animation-delay:.2s;}
        .hero-title-indent{padding-left:clamp(2rem,8vw,7rem);}
        .hero-bio{font-size:clamp(1rem,1.5vw,1.2rem);color:var(--text-muted);max-width:500px;margin-bottom:2.5rem;animation:fadeUp .8s .3s ease both;}
        .hero-actions{display:flex;gap:.875rem;flex-wrap:wrap;animation:fadeUp .8s .4s ease both;}
        .hero-meta{display:flex;gap:3rem;flex-wrap:wrap;padding-top:2.5rem;border-top:1px solid var(--border);animation:fadeUp .8s .5s ease both;}
        .hero-meta-item{display:flex;flex-direction:column;gap:.2rem;}
        .meta-label{font-size:.7rem;color:var(--text-muted);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;}

        /* BUTTONS */
        .btn-primary{display:inline-flex;align-items:center;gap:.5rem;background:var(--accent);color:#000;font-weight:500;font-size:.9rem;padding:.7rem 1.6rem;border-radius:999px;transition:transform .2s,box-shadow .2s;border:none;cursor:pointer;}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,255,62,.25);}
        [data-theme="light"] .btn-primary:hover{box-shadow:0 8px 24px rgba(37,99,235,.25);}
        .btn-secondary{display:inline-flex;align-items:center;gap:.5rem;background:var(--bg-3);border:1px solid var(--border);color:var(--text);font-size:.9rem;padding:.7rem 1.6rem;border-radius:999px;transition:transform .2s,border-color .2s;cursor:pointer;}
        .btn-secondary:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.2);}
        .btn-ghost{display:inline-flex;align-items:center;padding:.7rem 1.6rem;border-radius:999px;border:1px solid var(--border);color:var(--text-muted);font-size:.9rem;transition:color .2s,border-color .2s;}
        .btn-ghost:hover{color:var(--text);border-color:rgba(255,255,255,.2);}

        /* SECTIONS */
        .section{padding:8rem 4vw;}
        .section-label{font-family:var(--font-mono);font-size:.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:.12em;margin-bottom:1rem;}
        .section-header{margin-bottom:4rem;opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease;}
        .section-header.revealed{opacity:1;transform:none;}
        .section-title{font-family:var(--font-display);font-size:clamp(2.25rem,5vw,4rem);font-weight:700;line-height:1.1;letter-spacing:-.02em;}
        .section-title em{font-style:italic;color:var(--accent);}

        /* ABOUT */
        .about-layout{display:grid;grid-template-columns:1fr 1.4fr;gap:5rem;align-items:start;opacity:0;transform:translateY(32px);transition:opacity .7s .15s ease,transform .7s .15s ease;}
        .about-layout.revealed{opacity:1;transform:none;}
        .about-photo-wrap{position:relative;}
        .about-photo{border-radius:var(--radius);aspect-ratio:4/5;object-fit:cover;position:relative;z-index:1;}
        .about-photo-border{position:absolute;inset:-8px;border:1px solid var(--accent);border-radius:calc(var(--radius)+4px);opacity:.3;pointer-events:none;}
        .currently-card{margin-top:1.5rem;background:var(--bg-2);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;}
        .currently-title{font-family:var(--font-mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);margin-bottom:.875rem;}
        .currently-items{display:flex;flex-direction:column;gap:.625rem;}
        .currently-item{display:flex;align-items:flex-start;gap:.625rem;font-size:.8375rem;color:var(--text-muted);line-height:1.5;}
        .ci-icon{font-size:.9rem;flex-shrink:0;}
        .about-bio{font-size:1.0625rem;color:var(--text-muted);line-height:1.75;margin-bottom:1rem;}
        .about-vision{font-size:.9375rem;color:var(--text-muted);line-height:1.7;margin-bottom:2rem;padding-left:1rem;border-left:2px solid var(--accent);}
        .about-badges{display:flex;flex-wrap:wrap;gap:.625rem;margin-bottom:2rem;}
        .cert-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .875rem;border-radius:999px;font-size:.78rem;font-family:var(--font-mono);border:1px solid color-mix(in srgb,var(--badge-color) 30%,transparent);background:color-mix(in srgb,var(--badge-color) 10%,transparent);color:var(--text);transition:transform .2s;}
        .cert-badge:hover{transform:translateY(-2px);}

        /* GITHUB STATS */
        .gh-stats{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;opacity:0;transform:translateY(16px);transition:opacity .6s .3s ease,transform .6s .3s ease;}
        .gh-stats.revealed{opacity:1;transform:none;}
        .gh-header{display:flex;align-items:center;gap:.5rem;font-size:.8rem;font-family:var(--font-mono);color:var(--text-muted);margin-bottom:1rem;}
        .gh-live{color:var(--accent);margin-left:auto;animation:pulse 2s infinite;}
        .gh-numbers{display:flex;gap:2rem;}
        .gh-stat{display:flex;flex-direction:column;}
        .gh-num{font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--text);}
        .gh-label{font-size:.7rem;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;}
        .gh-link{display:inline-block;margin-top:1rem;font-size:.8rem;font-family:var(--font-mono);color:var(--accent);transition:opacity .2s;}
        .gh-link:hover{opacity:.7;}

        /* PROJECTS */
        .projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:1.5rem;opacity:0;transform:translateY(32px);transition:opacity .7s .15s ease,transform .7s .15s ease;}
        .projects-grid.revealed{opacity:1;transform:none;}
        .projects-hint{text-align:center;font-size:.8rem;font-family:var(--font-mono);color:var(--text-muted);margin-top:1.5rem;opacity:.6;}
        .project-card{background:var(--bg-2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:transform .3s,border-color .3s,box-shadow .3s;}
        .project-card:hover{transform:translateY(-4px);border-color:rgba(200,255,62,.2);box-shadow:var(--shadow);}
        [data-theme="light"] .project-card:hover{border-color:rgba(37,99,235,.2);}
        .project-image-wrap{position:relative;aspect-ratio:16/9;overflow:hidden;}
        .project-image{object-fit:cover;height:100%;transition:transform .5s ease;}
        .project-image.zoomed{transform:scale(1.06);}
        .project-image-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(10,10,11,.9));}
        .project-badge{position:absolute;top:.75rem;right:.75rem;font-size:.675rem;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;background:var(--accent);color:#000;padding:.2rem .6rem;border-radius:999px;}
        .project-metrics-overlay{position:absolute;bottom:.75rem;left:.75rem;right:.75rem;display:flex;flex-wrap:wrap;gap:.375rem;opacity:0;transform:translateY(6px);transition:opacity .3s,transform .3s;}
        .project-metrics-overlay.visible{opacity:1;transform:none;}
        .metric-chip{font-size:.675rem;font-family:var(--font-mono);background:rgba(200,255,62,.15);border:1px solid rgba(200,255,62,.3);color:var(--accent);padding:.2rem .55rem;border-radius:4px;}
        [data-theme="light"] .metric-chip{background:rgba(37,99,235,.1);border-color:rgba(37,99,235,.3);}
        .project-body{padding:1.25rem;}
        .project-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem;}
        .tag{font-size:.6875rem;font-family:var(--font-mono);color:var(--text-muted);border:1px solid var(--border);padding:.2rem .55rem;border-radius:4px;}
        .project-title{font-size:1.0625rem;font-weight:500;margin-bottom:.4rem;line-height:1.3;}
        .project-desc{font-size:.875rem;color:var(--text-muted);line-height:1.6;margin-bottom:1.1rem;}
        .project-links{display:flex;gap:1rem;align-items:center;}
        .project-link{font-size:.8rem;font-family:var(--font-mono);color:var(--text-muted);display:inline-flex;align-items:center;gap:.3rem;transition:color .2s;}
        .project-link:hover{color:var(--text);}
        .project-link--live{color:var(--accent)!important;}
        .project-link--detail{border-bottom:1px solid var(--border);}
        .project-link--detail:hover{color:var(--text);border-color:var(--text);}

        /* MODAL */
        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(12px);z-index:200;display:flex;align-items:center;justify-content:center;padding:2rem;animation:fadeIn .2s ease;}
        .modal{background:var(--bg-2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:760px;max-height:90vh;overflow-y:auto;position:relative;animation:slideUp .3s ease;}
        .modal-close{position:sticky;top:1rem;float:right;margin:1rem;background:var(--bg-3);border:1px solid var(--border);color:var(--text);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:.9rem;z-index:1;}
        .modal-header{position:relative;aspect-ratio:16/7;overflow:hidden;border-radius:12px 12px 0 0;}
        .modal-hero-img{object-fit:cover;height:100%;}
        .modal-header-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 20%,rgba(10,10,11,.95));}
        .modal-header-content{position:absolute;bottom:1.5rem;left:1.5rem;right:1.5rem;}
        .modal-title{font-family:var(--font-display);font-size:clamp(1.4rem,3vw,2rem);font-weight:700;color:#fff;margin:.5rem 0;}
        .modal-metrics{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem;}
        .modal-body{padding:1.75rem;}
        .modal-desc{color:var(--text-muted);line-height:1.75;margin-bottom:2rem;}
        .modal-section-title{font-family:var(--font-mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);margin-bottom:1rem;}
        .modal-challenges{display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem;}
        .challenge-item{background:var(--bg-3);border:1px solid var(--border);border-radius:8px;padding:1rem;display:flex;flex-direction:column;gap:.625rem;}
        .challenge-problem,.challenge-solution{display:flex;align-items:flex-start;gap:.625rem;font-size:.875rem;line-height:1.5;}
        .challenge-icon{flex-shrink:0;}
        .modal-screenshots{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.75rem;margin-bottom:2rem;}
        .modal-screenshot{border-radius:8px;object-fit:cover;aspect-ratio:16/9;border:1px solid var(--border);}
        .modal-actions{display:flex;gap:.875rem;flex-wrap:wrap;}

        /* SKILLS */
        .skills-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:2rem;opacity:0;transform:translateY(32px);transition:opacity .7s .15s ease,transform .7s .15s ease;}
        .skills-grid.revealed{opacity:1;transform:none;}
        .skill-group{opacity:0;}
        .skills-grid.revealed .skill-group{animation:fadeUp .6s var(--delay) ease both;}
        .skill-category{font-size:.675rem;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.12em;color:var(--text-muted);margin-bottom:.875rem;padding-bottom:.5rem;border-bottom:1px solid var(--border);}
        .skill-badges{display:flex;flex-wrap:wrap;gap:.5rem;}
        .skill-badge{font-size:.8rem;padding:.3rem .7rem;background:var(--bg-3);border:1px solid var(--border);border-radius:6px;color:var(--text);transition:background .2s,border-color .2s,color .2s,transform .2s;opacity:0;}
        .skills-grid.revealed .skill-badge{animation:popIn .4s var(--badge-delay) cubic-bezier(.34,1.56,.64,1) both;}
        .skill-badge:hover{background:var(--accent-dim);border-color:rgba(200,255,62,.3);color:var(--accent);transform:translateY(-2px);}
        [data-theme="light"] .skill-badge:hover{border-color:rgba(37,99,235,.3);}

        /* TESTIMONIALS */
        .testimonials-section{background:var(--bg-2);}
        .testimonials-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:1.5rem;opacity:0;transform:translateY(32px);transition:opacity .7s .15s ease,transform .7s .15s ease;}
        .testimonials-grid.revealed{opacity:1;transform:none;}
        .testimonial-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem;opacity:0;}
        .testimonials-grid.revealed .testimonial-card{animation:fadeUp .6s var(--delay) ease both;}
        .testimonial-quote{font-family:var(--font-display);font-size:4rem;color:var(--accent);line-height:1;margin-bottom:.5rem;opacity:.4;}
        .testimonial-text{font-size:.9375rem;color:var(--text-muted);line-height:1.7;margin-bottom:1.5rem;font-style:italic;}
        .testimonial-author{display:flex;align-items:center;gap:.875rem;}
        .testimonial-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0;}
        .testimonial-name{font-size:.875rem;font-weight:500;}
        .testimonial-role{font-size:.75rem;color:var(--text-muted);font-family:var(--font-mono);}

        /* CONTACT */
        .contact-section{border-top:1px solid var(--border);}
        .contact-layout{display:grid;grid-template-columns:1fr 1.5fr;gap:5rem;align-items:start;opacity:0;transform:translateY(32px);transition:opacity .7s .15s ease,transform .7s .15s ease;}
        .contact-layout.revealed{opacity:1;transform:none;}
        .contact-bio{color:var(--text-muted);line-height:1.7;margin-bottom:2rem;font-size:1rem;}
        .contact-email{display:block;font-family:var(--font-mono);font-size:.9375rem;color:var(--accent);margin-bottom:1.25rem;transition:opacity .2s;}
        .contact-email:hover{opacity:.7;}
        .contact-socials{display:flex;gap:1.5rem;margin-bottom:1.5rem;}
        .contact-socials a{font-size:.875rem;color:var(--text-muted);transition:color .2s;}
        .contact-socials a:hover{color:var(--text);}
        .cv-btn{width:fit-content;}
        .contact-form{display:flex;flex-direction:column;gap:1.25rem;}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        .field{display:flex;flex-direction:column;gap:.375rem;}
        label{font-size:.8rem;color:var(--text-muted);font-family:var(--font-mono);}
        input,textarea{background:var(--bg-2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:.75rem 1rem;font-family:var(--font-body);font-size:.9rem;outline:none;resize:vertical;transition:border-color .2s;}
        input:focus,textarea:focus{border-color:rgba(200,255,62,.4);}
        [data-theme="light"] input:focus,[data-theme="light"] textarea:focus{border-color:rgba(37,99,235,.4);}
        input::placeholder,textarea::placeholder{color:var(--text-muted);}
        .btn-submit{align-self:flex-start;}
        .form-success{display:flex;align-items:center;gap:1rem;padding:2rem;background:var(--accent-dim);border:1px solid rgba(200,255,62,.25);border-radius:var(--radius);color:var(--accent);}
        [data-theme="light"] .form-success{border-color:rgba(37,99,235,.25);}
        .success-icon{font-size:1.5rem;}

        /* FOOTER */
        .footer{display:flex;justify-content:space-between;align-items:center;padding:2rem 4vw;border-top:1px solid var(--border);font-size:.8rem;color:var(--text-muted);font-family:var(--font-mono);}

        /* ANIMATIONS */
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
        @keyframes popIn{from{opacity:0;transform:scale(.88);}to{opacity:1;transform:scale(1);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:none;}}

        /* RESPONSIVE */
        @media(max-width:900px){
          .about-layout{grid-template-columns:1fr;}
          .about-photo{aspect-ratio:3/2;max-height:320px;}
          .contact-layout{grid-template-columns:1fr;gap:3rem;}
        }
        @media(max-width:768px){
          .nav-links a:not(.nav-cta):not(.theme-toggle){display:none;}
          .form-row{grid-template-columns:1fr;}
          .hero-meta{gap:1.75rem;}
          .footer{flex-direction:column;gap:.5rem;text-align:center;}
        }
        @media(max-width:480px){
          .section{padding:5rem 5vw;}
          .hero{padding:8rem 5vw 3rem;}
        }
      `}</style>

      <Cursor />
      <Nav dark={dark} setDark={setDark} />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

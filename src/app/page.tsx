"use client";

import {
  useState,
  useEffect,
  useRef,
  FormEvent,
  useCallback,
  ReactNode,
} from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
  useMotionValue,
} from "framer-motion";
import Lenis from "lenis";

/* ═══════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════ */

function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}

function useCustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);

    let raf: number;
    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Hover detection
    const onOver = () => {
      dotRef.current?.classList.add("hovering");
      ringRef.current?.classList.add("hovering");
    };
    const onOut = () => {
      dotRef.current?.classList.remove("hovering");
      ringRef.current?.classList.remove("hovering");
    };
    const interactives = document.querySelectorAll("a, button, input, .interactive");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onOver);
      el.addEventListener("mouseleave", onOut);
    });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onOver);
        el.removeEventListener("mouseleave", onOut);
      });
    };
  }, []);

  return { dotRef, ringRef };
}

/* ═══════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════ */

// Animated text that reveals line by line
function RevealText({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <span ref={ref} className={`line-reveal ${className}`}>
      <motion.span
        initial={{ y: "110%" }}
        animate={isInView ? { y: 0 } : { y: "110%" }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
          delay,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Fade-up container
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax image wrapper
function ParallaxImage({
  src,
  alt,
  speed = 0.2,
  className = "",
  fill = false,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-full">
        {fill ? (
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" priority={priority} />
        ) : (
          <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" />
        )}
      </motion.div>
    </div>
  );
}

// 3D Tilt card
function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`tilt-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Magnetic button
function MagneticButton({
  children,
  href,
  className = "",
  onClick,
  type,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    },
    [x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const inner = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={`magnetic-btn interactive ${className}`}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <a href={href}>{inner}</a>;
  }
  if (type || onClick) {
    return (
      <button type={type} onClick={onClick} disabled={disabled} className="appearance-none">
        {inner}
      </button>
    );
  }
  return inner;
}

// Scroll progress bar
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-orange z-[100]"
    />
  );
}

// Navigation with hide-on-scroll
function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    return scrollY.on("change", (y) => {
      setHidden(y > lastY.current && y > 200);
      setScrolled(y > 80);
      lastY.current = y;
    });
  }, [scrollY]);

  return (
    <motion.nav
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-off-white/80 backdrop-blur-xl shadow-sm" : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
        <motion.a
          href="#"
          className="flex items-baseline gap-0 interactive"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="font-serif italic text-xl">H1</span>
          <span className="font-sans font-bold text-xl">&ndash;A1</span>
        </motion.a>
        <div className="hidden md:flex items-center gap-8 text-sm font-sans">
          {[
            { label: "Was ist das?", href: "#about" },
            { label: "Ablauf", href: "#ablauf" },
            { label: "Impressionen", href: "#impressionen" },
            { label: "Blog", href: "/blog" },
          ].map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="text-gray hover:text-dark transition-colors duration-300 interactive"
              whileHover={{ y: -2 }}
            >
              {link.label}
            </motion.a>
          ))}
          <MagneticButton
            href="#anmeldung"
            className="bg-dark text-off-white px-5 py-2.5 rounded-full hover:bg-orange transition-colors duration-300"
          >
            <span className="btn-text">Dabei sein</span>
          </MagneticButton>
        </div>
        <a
          href="#anmeldung"
          className="md:hidden bg-dark text-off-white px-4 py-2 rounded-full text-sm interactive"
        >
          Dabei sein
        </a>
      </div>
    </motion.nav>
  );
}

// Preloader
function Preloader({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-dark flex items-center justify-center"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1], delay: 0.2 }}
    >
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <span className="font-serif italic text-5xl md:text-7xl text-off-white">H1</span>
          <span className="font-sans font-bold text-5xl md:text-7xl text-off-white">&ndash;A1</span>
        </motion.div>
        <motion.div
          className="w-48 h-[2px] bg-off-white/20 rounded-full mx-auto overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-orange rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Counter animation
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className="tabular-nums">
      {isInView ? (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}{suffix}
        </motion.span>
      ) : (
        <span className="opacity-0">{value}{suffix}</span>
      )}
    </span>
  );
}

// Horizontal scroll gallery
function HorizontalGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"]);

  const images = [
    { src: "/images/networking-1.jpg", alt: "Networking" },
    { src: "/images/deep-dive.jpg", alt: "Deep Dive" },
    { src: "/images/audience-detail.jpg", alt: "Publikum" },
    { src: "/images/networking-2.jpg", alt: "Gespräche" },
    { src: "/images/ethik.jpg", alt: "KI & Ethik" },
    { src: "/images/presenters.jpg", alt: "Moderatoren" },
    { src: "/images/networking-3.jpg", alt: "Community" },
  ];

  return (
    <div ref={containerRef} className="overflow-hidden py-4">
      <motion.div style={{ x }} className="flex gap-4 md:gap-6">
        {images.map((img, i) => (
          <div
            key={i}
            className="photo-zoom rounded-xl overflow-hidden shrink-0 w-[300px] md:w-[400px] lg:w-[500px] aspect-[3/4] interactive"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={500}
              height={667}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", companion: "no" });
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(true);

  useSmoothScroll();
  const { dotRef, ringRef } = useCustomCursor();

  // Hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.1]);

  const marqueeText = "Close the gap. \u00A0\u00A0\u00A0\u2022\u00A0\u00A0\u00A0 ";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, website: honeypot, _t: formLoadedAt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setSubmitted(true);
      setLoading(false);
    } catch {
      setError("Etwas ist schiefgelaufen.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Preloader */}
      <AnimatePresence>
        {preloading && <Preloader onComplete={() => setPreloading(false)} />}
      </AnimatePresence>

      {/* Custom Cursor */}
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />

      {/* Noise */}
      <div className="noise-overlay" />

      {/* Scroll progress */}
      <ScrollProgress />

      <div className="min-h-screen bg-off-white text-dark">
        <Nav />

        {/* ═══════ HERO ═══════ */}
        <section ref={heroRef} className="relative h-screen min-h-[750px] overflow-hidden">
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 -top-20 -bottom-20">
            <Image
              src="/images/hero.jpg"
              alt="H1-A1 AI Meetup"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark/50 via-dark/30 to-dark/80" />
          </motion.div>

          <div className="absolute top-0 left-0 w-24 h-28 md:w-36 md:h-40 gradient-accent opacity-90 z-10" />

          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-20 h-full flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-10"
          >
            <div className="max-w-[1400px] mx-auto w-full">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={!preloading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-sans text-off-white/60 text-sm md:text-base tracking-[0.2em] uppercase mb-6"
              >
                Offenes Community-Meetup in Kiel
              </motion.p>

              <div className="overflow-hidden mb-3">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={!preloading ? { y: 0 } : {}}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className="font-serif text-off-white text-6xl md:text-8xl lg:text-[10rem] font-bold leading-[0.85]"
                >
                  <em>H1</em>&ndash;A1
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-8">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={!preloading ? { y: 0 } : {}}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
                  className="font-serif text-orange text-6xl md:text-8xl lg:text-[10rem] font-bold leading-[0.85]"
                >
                  AI Meetup
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={!preloading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="font-sans text-off-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-10"
              >
                KI verstehen, ausprobieren und anwenden &ndash; gemeinsam, auf Augenh&ouml;he.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={!preloading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-wrap gap-4"
              >
                <MagneticButton
                  href="#anmeldung"
                  className="bg-orange text-off-white px-8 py-4 rounded-full text-base font-sans font-medium overflow-hidden relative group"
                >
                  <span className="btn-fill bg-off-white group-hover:text-dark" />
                  <span className="btn-text relative z-10 group-hover:text-dark transition-colors duration-500">Jetzt anmelden</span>
                </MagneticButton>
                <MagneticButton
                  href="#about"
                  className="border border-off-white/30 text-off-white px-8 py-4 rounded-full text-base font-sans font-medium hover:bg-off-white/10 transition-colors"
                >
                  <span className="btn-text">Mehr erfahren</span>
                </MagneticButton>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={!preloading ? { opacity: 1 } : {}}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 border-2 border-off-white/30 rounded-full flex justify-center pt-1.5"
            >
              <div className="w-1 h-2 bg-off-white/50 rounded-full" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ MARQUEE ═══════ */}
        <section className="py-5 bg-dark overflow-hidden interactive">
          <div className="flex whitespace-nowrap">
            <div className="marquee-track flex">
              {[0, 1].map((i) => (
                <span key={i} className="font-serif italic text-2xl md:text-4xl text-off-white/20">
                  {marqueeText.repeat(8)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ ABOUT ═══════ */}
        <section id="about" className="py-28 md:py-40 px-6 md:px-10 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-28 items-center">
              <div>
                <FadeUp>
                  <p className="font-sans text-orange text-xs tracking-[0.25em] uppercase mb-5">
                    Was ist das?
                  </p>
                </FadeUp>
                <div className="mb-10">
                  <div className="overflow-hidden mb-2">
                    <RevealText className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]">
                      KI verstehen hei&szlig;t
                    </RevealText>
                  </div>
                  <div className="overflow-hidden">
                    <RevealText className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-orange italic" delay={0.15}>
                      Zukunft gestalten.
                    </RevealText>
                  </div>
                </div>
                <FadeUp delay={0.3}>
                  <p className="font-sans text-lg md:text-xl leading-relaxed text-dark/65 mb-6">
                    Das H1&ndash;A1 AI Meetup ist ein offenes Community-Format rund um K&uuml;nstliche
                    Intelligenz &ndash; f&uuml;r alle, die KI verstehen, ausprobieren und im Alltag
                    oder Beruf anwenden wollen.
                  </p>
                </FadeUp>
                <FadeUp delay={0.4}>
                  <p className="font-sans text-lg md:text-xl leading-relaxed text-dark/65">
                    Alle 6&ndash;8 Wochen treffen wir uns, tauschen uns aus und schauen gemeinsam,
                    was KI gerade kann, was sie bedeutet und wo sie uns weiterbringt.
                    Vorkenntnisse? Nicht n&ouml;tig.
                  </p>
                </FadeUp>
              </div>

              <FadeUp delay={0.2}>
                <div className="relative">
                  <div className="photo-zoom rounded-2xl overflow-hidden interactive">
                    <ParallaxImage
                      src="/images/audience-wide.jpg"
                      alt="Teilnehmende"
                      width={1200}
                      height={800}
                      speed={0.15}
                    />
                  </div>
                  {/* Floating tags */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="absolute -bottom-6 -left-4 md:-left-8 bg-white rounded-xl shadow-lg px-5 py-3 border border-dark/5"
                  >
                    <p className="font-sans text-sm font-medium">
                      <AnimatedCounter value="15-18" /> Teilnehmende pro Abend
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="absolute -top-4 -right-4 md:-right-8 bg-dark text-off-white rounded-xl shadow-lg px-5 py-3"
                  >
                    <p className="font-sans text-sm font-medium">
                      Kostenlos &middot; Alle 6&ndash;8 Wochen
                    </p>
                  </motion.div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ═══════ USPs ═══════ */}
        <section className="py-28 md:py-40 px-6 md:px-10 bg-dark text-off-white overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <FadeUp className="mb-20 md:mb-28">
              <p className="font-sans text-orange text-xs tracking-[0.25em] uppercase mb-5">
                Was uns unterscheidet
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.05] max-w-4xl">
                Kein Fachvortrag.<br />
                <span className="text-off-white/30">Kein Expertenforum.</span>
              </h2>
            </FadeUp>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Hands-on", desc: "Anfassen, ausprobieren, verstehen. Jedes Meetup bringt ein Tool oder Thema live und interaktiv." },
                { title: "Zug\u00e4nglich", desc: "Niedrigschwellig f\u00fcr alle. Keine Vorkenntnisse, kein Fachjargon \u2013 nur echtes Interesse." },
                { title: "Divers", desc: "Gemischtes Moderationsduo mit unterschiedlichen Perspektiven auf Technik und Mensch." },
                { title: "Ganzheitlich", desc: "Technik und Ethik als fester Bestandteil. Wir denken KI immer auch menschlich." },
                { title: "Nahbar", desc: "Community-Charakter statt Konferenzatmosph\u00e4re. Locker, offen, echt." },
                { title: "Kostenlos", desc: "Ca. 2 Stunden, alle 6\u20138 Wochen. Du zahlst nur dein Getr\u00e4nk." },
              ].map((item, i) => (
                <FadeUp key={item.title} delay={i * 0.08}>
                  <TiltCard className="h-full">
                    <div className="interactive bg-off-white/[0.03] border border-off-white/[0.06] rounded-2xl p-8 md:p-10 h-full hover:bg-off-white/[0.07] hover:border-orange/20 transition-all duration-700 group">
                      <span className="inline-block font-sans text-[10px] tracking-[0.3em] uppercase text-orange/60 mb-6 border border-orange/20 px-3 py-1 rounded-full group-hover:bg-orange/10 transition-colors duration-500">
                        {item.title}
                      </span>
                      <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-orange transition-colors duration-500">
                        {item.title}
                      </h3>
                      <p className="font-sans text-off-white/50 leading-relaxed group-hover:text-off-white/70 transition-colors duration-500">
                        {item.desc}
                      </p>
                    </div>
                  </TiltCard>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FULL-WIDTH QUOTE ═══════ */}
        <section className="relative py-32 md:py-48 overflow-hidden">
          <ParallaxImage
            src="/images/networking-wide.jpg"
            alt="Networking"
            fill
            speed={0.3}
            className="absolute inset-0"
            priority={false}
          />
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-[2px]" />
          <div className="relative z-10 px-6 md:px-10">
            <div className="max-w-[1400px] mx-auto">
              <FadeUp>
                <blockquote className="font-serif italic text-off-white text-4xl md:text-6xl lg:text-8xl leading-[1.05] max-w-4xl">
                  &bdquo;Close<br />the gap.&ldquo;
                </blockquote>
              </FadeUp>
              <FadeUp delay={0.2}>
                <p className="font-sans text-off-white/50 mt-6 text-base md:text-lg max-w-lg">
                  Wissen zug&auml;nglich machen, Menschen verbinden, Technik menschlich halten.
                </p>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ═══════ ABLAUF ═══════ */}
        <section id="ablauf" className="py-28 md:py-40 px-6 md:px-10 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-28">
              <div>
                <FadeUp>
                  <p className="font-sans text-orange text-xs tracking-[0.25em] uppercase mb-5">
                    Der Abend
                  </p>
                  <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                    Wie l&auml;uft ein<br />Meetup ab?
                  </h2>
                  <p className="font-sans text-lg text-dark/50 leading-relaxed mb-16">
                    Locker in der Atmosph&auml;re, strukturiert im Inhalt.
                  </p>
                </FadeUp>

                {[
                  { num: "01", title: "KI Update", desc: "Was bewegt sich gerade in der KI-Welt? Kompakter \u00dcberblick zu Tools, Trends und Entwicklungen." },
                  { num: "02", title: "Speed-Networking", desc: "Eine Frage, passend zum Thema. Austausch in kleinen Gruppen \u2013 Interaktion und Offenheit." },
                  { num: "03", title: "Deep Dive", desc: "Ein Tool oder Thema im Detail \u2013 live, interaktiv, zum Anfassen." },
                  { num: "04", title: "KI & Ethik", desc: "Der menschliche Blick: Wo m\u00fcssen wir im Umgang mit KI genauer hinschauen?" },
                  { num: "05", title: "Q&A & Ausklang", desc: "Offener Austausch, Fragen, Gespr\u00e4che." },
                ].map((block, i) => (
                  <FadeUp key={block.num} delay={i * 0.08}>
                    <div className={`flex gap-6 md:gap-8 py-7 md:py-9 ${i < 4 ? "border-b border-dark/8" : ""} group interactive`}>
                      <motion.span
                        whileHover={{ x: 4 }}
                        className="font-sans text-orange/30 font-bold text-3xl md:text-4xl w-14 shrink-0 group-hover:text-orange transition-colors duration-500"
                      >
                        {block.num}
                      </motion.span>
                      <div>
                        <h3 className="font-serif text-xl md:text-2xl font-bold mb-1.5 group-hover:text-orange transition-colors duration-500">
                          {block.title}
                        </h3>
                        <p className="font-sans text-dark/50 leading-relaxed">{block.desc}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>

              {/* Right: stacked photos with different parallax speeds */}
              <div className="hidden lg:flex flex-col gap-6 pt-32">
                <FadeUp>
                  <div className="photo-zoom rounded-2xl overflow-hidden interactive">
                    <ParallaxImage src="/images/deep-dive.jpg" alt="Deep Dive" width={900} height={600} speed={0.1} />
                  </div>
                </FadeUp>
                <FadeUp delay={0.15}>
                  <div className="photo-zoom rounded-2xl overflow-hidden interactive">
                    <ParallaxImage src="/images/ethik.jpg" alt="KI & Ethik" width={900} height={600} speed={0.2} />
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ IMPRESSIONEN - Horizontal Gallery ═══════ */}
        <section id="impressionen" className="py-28 md:py-40 bg-dark text-off-white overflow-hidden scroll-mt-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-12">
            <FadeUp>
              <p className="font-sans text-orange text-xs tracking-[0.25em] uppercase mb-5">
                Impressionen
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold">
                So sieht&apos;s aus.
              </h2>
            </FadeUp>
          </div>

          <HorizontalGallery />

          {/* Second row: static masonry */}
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 mt-8">
            <div className="grid grid-cols-3 gap-4">
              <FadeUp className="col-span-2">
                <div className="photo-zoom rounded-xl overflow-hidden interactive">
                  <Image src="/images/room-full.jpg" alt="Voller Raum" width={1400} height={933} className="w-full h-full object-cover aspect-[16/9]" />
                </div>
              </FadeUp>
              <FadeUp delay={0.1}>
                <div className="photo-zoom rounded-xl overflow-hidden interactive">
                  <Image src="/images/audience.jpg" alt="Publikum" width={800} height={1200} className="w-full h-full object-cover aspect-[9/16] md:aspect-[16/9]" />
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ═══════ VISION ═══════ */}
        <section className="py-32 md:py-48 px-6 md:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <FadeUp>
              <p className="font-sans text-orange text-xs tracking-[0.25em] uppercase mb-8">
                Unsere Vision
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-snug mb-8">
                Einen Safe Space schaffen, in dem Fragen willkommen sind und
                <span className="text-orange"> Orientierung</span> entsteht.
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="font-sans text-lg md:text-xl text-dark/50 leading-relaxed max-w-2xl mx-auto">
                Die Zeit wird schneller, alles technischer &ndash; umso wichtiger ist es,
                Menschen zusammenzubringen. Genau die Spannung zwischen Mensch und Technik
                macht KI so relevant und interessant.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ═══════ ANMELDUNG ═══════ */}
        <section id="anmeldung" className="relative py-28 md:py-40 px-6 md:px-10 scroll-mt-20 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/room-presentation.jpg" alt="" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-dark/92 backdrop-blur-sm" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto">
            <FadeUp className="text-center mb-14">
              <p className="font-sans text-orange text-xs tracking-[0.25em] uppercase mb-5">
                Dabei sein
              </p>
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-off-white leading-tight mb-4">
                Sichere dir<br />deinen Platz.
              </h2>
              <p className="font-sans text-off-white/50 text-lg">
                Melde dich an f&uuml;r das n&auml;chste H1&ndash;A1 AI Meetup.
              </p>
            </FadeUp>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-off-white/[0.06] border border-off-white/10 rounded-3xl p-10 md:p-14 text-center backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <span className="text-4xl">👋</span>
                  </motion.div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-off-white mb-4">
                    Say hi, sch&ouml;n dass du dabei bist!
                  </h3>
                  <p className="font-sans text-off-white/60 leading-relaxed mb-8">
                    Du hast dich erfolgreich f&uuml;r das H1&ndash;A1 AI Meetup angemeldet.
                  </p>
                  <div className="bg-off-white/5 rounded-2xl p-6 text-left mb-8">
                    <p className="font-sans text-off-white/70 leading-relaxed">
                      <strong className="text-off-white">Was dich erwartet:</strong><br />
                      KI-Updates, ein Deep Dive, Speed-Networking und echte Gespr&auml;che &ndash;
                      ca. 2 Stunden, locker und hands-on.
                    </p>
                  </div>
                  <p className="font-sans text-off-white/35 text-sm">
                    <strong className="text-orange">H1&ndash;A1 AI Meetup</strong> &middot; Deine KI Community
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  {/* Honeypot – invisible to humans, bots fill it */}
                  <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {[
                    { label: "Name", type: "text", key: "name", placeholder: "Dein Name" },
                    { label: "E-Mail-Adresse", type: "email", key: "email", placeholder: "deine@email.de" },
                  ].map((field) => (
                    <div key={field.key} className="group">
                      <label className="font-sans text-xs text-off-white/40 tracking-wider uppercase block mb-2">
                        {field.label} *
                      </label>
                      <input
                        type={field.type}
                        required
                        value={formData[field.key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="interactive w-full bg-off-white/[0.04] border border-off-white/10 rounded-xl px-5 py-4 font-sans text-off-white placeholder:text-off-white/20 focus:outline-none focus:border-orange transition-all duration-500 hover:border-off-white/20"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="font-sans text-xs text-off-white/40 tracking-wider uppercase block mb-2">
                      Alleine oder mit Begleitung? *
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: "no", label: "Alleine" },
                        { value: "yes", label: "Mit Begleitung" },
                      ].map((opt) => (
                        <motion.button
                          key={opt.value}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setFormData({ ...formData, companion: opt.value })}
                          className={`interactive flex-1 py-4 rounded-xl font-sans text-sm border transition-all duration-500 ${
                            formData.companion === opt.value
                              ? "bg-orange border-orange text-off-white"
                              : "bg-off-white/[0.03] border-off-white/10 text-off-white/40 hover:border-off-white/25"
                          }`}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-orange/10 border border-orange/20 rounded-xl px-5 py-3 overflow-hidden"
                      >
                        <p className="font-sans text-sm text-orange">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <MagneticButton
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-orange text-off-white font-sans font-medium py-4 rounded-xl text-lg transition-all duration-500 mt-2 glow-pulse ${
                      loading ? "opacity-50" : "hover:bg-off-white hover:text-dark"
                    }`}
                  >
                    <span className="btn-text">
                      {loading ? "Wird gesendet\u2026" : "Anmelden"}
                    </span>
                  </MagneticButton>

                  <p className="font-sans text-off-white/25 text-xs text-center pt-2 tracking-wider">
                    Kostenlos &middot; Unverbindlich &middot; Kein Spam
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="py-20 md:py-28 px-6 md:px-10 border-t border-dark/8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
              <FadeUp>
                <motion.div className="flex items-baseline gap-0 mb-3" whileHover={{ scale: 1.03 }}>
                  <span className="font-serif italic text-4xl">H1</span>
                  <span className="font-sans font-bold text-4xl">&ndash;A1</span>
                </motion.div>
                <p className="font-sans text-gray text-sm">
                  Deine KI Community in Kiel
                </p>
              </FadeUp>
              <FadeUp delay={0.1}>
                <div className="md:text-right">
                  <p className="font-serif italic text-3xl text-dark/20 mb-2">
                    Close the gap.
                  </p>
                  <p className="font-sans text-xs text-gray tracking-wider">
                    Alle 6&ndash;8 Wochen &middot; Coworking Space Kiel &middot; Kostenlos
                    &middot; <a href="https://fairplay-management.de/impressum/" target="_blank" rel="noopener noreferrer" className="interactive underline hover:text-dark transition-colors">Impressum</a>
                  </p>
                </div>
              </FadeUp>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

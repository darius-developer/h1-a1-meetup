"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companion: "no",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Parallax on hero
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY;
        heroRef.current.style.transform = `translateY(${y * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      setLoading(false);
    }
  }

  const marqueeText = "Close the gap. \u00A0\u00A0\u00A0 Close the gap. \u00A0\u00A0\u00A0 Close the gap. \u00A0\u00A0\u00A0 Close the gap. \u00A0\u00A0\u00A0 Close the gap. \u00A0\u00A0\u00A0 Close the gap. \u00A0\u00A0\u00A0 ";

  return (
    <div className="min-h-screen bg-off-white text-dark">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-off-white/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#" className="flex items-baseline gap-0">
            <span className="font-serif italic text-xl">H1</span>
            <span className="font-sans font-bold text-xl">&ndash;A1</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-sans">
            <a href="#about" className="text-gray hover:text-dark transition-colors duration-300">
              Was ist das?
            </a>
            <a href="#ablauf" className="text-gray hover:text-dark transition-colors duration-300">
              Ablauf
            </a>
            <a href="#impressionen" className="text-gray hover:text-dark transition-colors duration-300">
              Impressionen
            </a>
            <a
              href="#anmeldung"
              className="bg-dark text-off-white px-5 py-2.5 rounded-full hover:bg-orange transition-colors duration-300"
            >
              Dabei sein
            </a>
          </div>
          <a
            href="#anmeldung"
            className="md:hidden bg-dark text-off-white px-4 py-2 rounded-full text-sm"
          >
            Dabei sein
          </a>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        {/* Background image with parallax */}
        <div ref={heroRef} className="absolute inset-0 -top-20 -bottom-20">
          <Image
            src="/images/hero.jpg"
            alt="H1-A1 AI Meetup im Coworking Space Kiel"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/40 to-dark/80" />
        </div>

        {/* Gradient accent block (from banner design) */}
        <div className="absolute top-0 left-0 w-24 h-28 md:w-32 md:h-36 gradient-accent opacity-90 z-10" />

        {/* Hero content */}
        <div className="relative z-20 h-full flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-10">
          <div className="max-w-[1400px] mx-auto w-full">
            <p className="font-sans text-off-white/70 text-sm md:text-base tracking-widest uppercase mb-4">
              Offenes Community-Meetup in Kiel
            </p>
            <h1 className="font-serif text-off-white text-5xl md:text-8xl lg:text-9xl font-bold leading-[0.9] mb-6">
              <span className="italic">H1</span>&ndash;A1
              <br />
              <span className="text-orange">AI Meetup</span>
            </h1>
            <p className="font-sans text-off-white/80 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              KI verstehen, ausprobieren und anwenden &ndash; gemeinsam, auf Augenh&ouml;he.
              Alle 6&ndash;8 Wochen. Kostenlos.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#anmeldung"
                className="font-sans font-medium bg-orange text-off-white px-8 py-4 rounded-full text-base hover:bg-off-white hover:text-dark transition-all duration-300"
              >
                Jetzt anmelden
              </a>
              <a
                href="#about"
                className="font-sans font-medium border border-off-white/30 text-off-white px-8 py-4 rounded-full text-base hover:bg-off-white/10 transition-all duration-300"
              >
                Mehr erfahren
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="w-5 h-8 border-2 border-off-white/40 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-off-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <section className="py-6 bg-dark overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="marquee-track flex">
            <span className="font-serif italic text-2xl md:text-4xl text-off-white/30">
              {marqueeText}
            </span>
            <span className="font-serif italic text-2xl md:text-4xl text-off-white/30">
              {marqueeText}
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════ ABOUT ═══════════════ */}
      <section id="about" className="py-24 md:py-36 px-6 md:px-10 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Text */}
            <div>
              <div className="fade-up">
                <p className="font-sans text-orange text-sm tracking-widest uppercase mb-4">
                  Was ist das?
                </p>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                  KI verstehen hei&szlig;t
                  <br />
                  <em className="text-orange">Zukunft gestalten.</em>
                </h2>
              </div>
              <div className="fade-up">
                <p className="font-sans text-lg md:text-xl leading-relaxed text-dark/70 mb-6">
                  Das H1&ndash;A1 AI Meetup ist ein offenes Community-Format rund um K&uuml;nstliche
                  Intelligenz &ndash; f&uuml;r alle, die KI verstehen, ausprobieren und im Alltag
                  oder Beruf anwenden wollen.
                </p>
                <p className="font-sans text-lg md:text-xl leading-relaxed text-dark/70">
                  Alle 6&ndash;8 Wochen treffen wir uns, tauschen uns aus und schauen gemeinsam,
                  was KI gerade kann, was sie bedeutet und wo sie uns weiterbringt.
                  Vorkenntnisse? Nicht n&ouml;tig.
                </p>
              </div>
            </div>

            {/* Right: Image + tags */}
            <div className="fade-up">
              <div className="photo-zoom rounded-2xl overflow-hidden mb-8">
                <Image
                  src="/images/audience-wide.jpg"
                  alt="Teilnehmende beim H1-A1 AI Meetup"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {["KI-Neugierige", "Freelancer", "Studierende", "Berufst\u00e4tige", "Quereinsteiger"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="font-sans text-sm border border-dark/15 px-4 py-2 rounded-full text-dark/60"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ USP SECTION ═══════════════ */}
      <section className="py-24 md:py-36 px-6 md:px-10 bg-dark text-off-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="fade-up mb-16 md:mb-24">
            <p className="font-sans text-orange text-sm tracking-widest uppercase mb-4">
              Was uns unterscheidet
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl">
              Kein Fachvortrag.
              <br />
              Kein Expertenforum.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-off-white/10 stagger">
            {[
              {
                title: "Hands-on",
                desc: "Anfassen, ausprobieren, verstehen. Jedes Meetup bringt ein Tool oder Thema live und interaktiv.",
              },
              {
                title: "Zug\u00e4nglich",
                desc: "Niedrigschwellig f\u00fcr alle. Keine Vorkenntnisse, kein Fachjargon \u2013 nur echtes Interesse.",
              },
              {
                title: "Divers",
                desc: "Gemischtes Moderationsduo mit unterschiedlichen Perspektiven auf Technik und Mensch.",
              },
              {
                title: "Ganzheitlich",
                desc: "Technik und Ethik als fester Bestandteil. Wir denken KI immer auch menschlich.",
              },
              {
                title: "Nahbar",
                desc: "Community-Charakter statt Konferenzatmosph\u00e4re. Locker, offen, echt.",
              },
              {
                title: "Kostenlos",
                desc: "Ca. 2 Stunden, alle 6\u20138 Wochen. Du zahlst nur dein Getr\u00e4nk.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="fade-up bg-dark p-8 md:p-10 group hover:bg-off-white/5 transition-colors duration-500"
              >
                <span className="font-sans text-orange text-sm tracking-widest uppercase">
                  {item.title}
                </span>
                <p className="font-serif text-xl md:text-2xl font-bold mt-3 mb-4 leading-snug group-hover:text-orange transition-colors duration-500">
                  {item.title}
                </p>
                <p className="font-sans text-off-white/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FULL-WIDTH PHOTO BREAK ═══════════════ */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/images/networking-wide.jpg"
          alt="Networking beim H1-A1 AI Meetup"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/50 to-transparent" />
        <div className="relative z-10 h-full flex items-center px-6 md:px-10">
          <div className="max-w-[1400px] mx-auto w-full">
            <blockquote className="font-serif italic text-off-white text-3xl md:text-5xl lg:text-6xl max-w-2xl leading-tight">
              &bdquo;Close the gap.&ldquo;
            </blockquote>
            <p className="font-sans text-off-white/60 mt-4 text-base md:text-lg">
              Wissen zug&auml;nglich machen, Menschen verbinden, Technik menschlich halten.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ ABLAUF ═══════════════ */}
      <section id="ablauf" className="py-24 md:py-36 px-6 md:px-10 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="fade-up mb-16 md:mb-24 max-w-2xl">
            <p className="font-sans text-orange text-sm tracking-widest uppercase mb-4">
              Der Abend
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Wie l&auml;uft ein Meetup ab?
            </h2>
            <p className="font-sans text-lg text-dark/60 leading-relaxed">
              Locker in der Atmosph&auml;re, strukturiert im Inhalt. Jeder Block hat ein klares Ziel.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24">
            {/* Left: Timeline */}
            <div className="space-y-0 stagger">
              {[
                {
                  num: "01",
                  title: "KI Update",
                  desc: "Was bewegt sich gerade in der KI-Welt? Ein kompakter \u00dcberblick zu Tools, Trends und Entwicklungen.",
                  img: null,
                },
                {
                  num: "02",
                  title: "Speed-Networking",
                  desc: "Eine Frage, passend zum Thema. Austausch in 2\u20134er Gruppen \u2013 Interaktion und Offenheit f\u00f6rdern.",
                  img: null,
                },
                {
                  num: "03",
                  title: "Deep Dive",
                  desc: "Ein Tool oder Thema im Detail \u2013 live, interaktiv, zum Anfassen.",
                  img: null,
                },
                {
                  num: "04",
                  title: "KI & Ethik",
                  desc: "Der menschliche Blick: Wo m\u00fcssen wir im Umgang mit KI genauer hinschauen?",
                  img: null,
                },
                {
                  num: "05",
                  title: "Q&A & Ausklang",
                  desc: "Offener Austausch, Fragen, Gespr\u00e4che \u2013 das Meetup klingt locker aus.",
                  img: null,
                },
              ].map((block, i) => (
                <div
                  key={block.num}
                  className={`fade-up flex gap-6 md:gap-8 py-8 md:py-10 ${
                    i < 4 ? "border-b border-dark/10" : ""
                  } group`}
                >
                  <span className="font-sans text-orange/40 font-bold text-3xl md:text-4xl w-14 shrink-0 group-hover:text-orange transition-colors duration-300">
                    {block.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 group-hover:text-orange transition-colors duration-300">
                      {block.title}
                    </h3>
                    <p className="font-sans text-dark/60 leading-relaxed">
                      {block.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Stacked photos */}
            <div className="hidden lg:flex flex-col gap-6">
              <div className="fade-up photo-zoom rounded-2xl overflow-hidden">
                <Image
                  src="/images/deep-dive.jpg"
                  alt="Deep Dive Session"
                  width={900}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="fade-up photo-zoom rounded-2xl overflow-hidden">
                <Image
                  src="/images/ethik.jpg"
                  alt="KI & Ethik Diskussion"
                  width={900}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ IMPRESSIONEN (Photo Grid) ═══════════════ */}
      <section id="impressionen" className="py-24 md:py-36 px-6 md:px-10 bg-dark text-off-white scroll-mt-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="fade-up mb-16">
            <p className="font-sans text-orange text-sm tracking-widest uppercase mb-4">
              Impressionen
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              So sieht&apos;s aus.
            </h2>
          </div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 stagger">
            <div className="fade-up photo-zoom rounded-xl overflow-hidden col-span-2 md:col-span-2 md:row-span-2">
              <Image
                src="/images/room-full.jpg"
                alt="Voller Raum beim Meetup"
                width={1400}
                height={933}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="fade-up photo-zoom rounded-xl overflow-hidden">
              <Image
                src="/images/networking-1.jpg"
                alt="Networking"
                width={800}
                height={1200}
                className="w-full h-full object-cover aspect-[3/4]"
              />
            </div>
            <div className="fade-up photo-zoom rounded-xl overflow-hidden">
              <Image
                src="/images/audience-detail.jpg"
                alt="Aufmerksames Publikum"
                width={800}
                height={1200}
                className="w-full h-full object-cover aspect-[3/4]"
              />
            </div>
            <div className="fade-up photo-zoom rounded-xl overflow-hidden">
              <Image
                src="/images/presenters.jpg"
                alt="Moderationsduo"
                width={900}
                height={600}
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="fade-up photo-zoom rounded-xl overflow-hidden">
              <Image
                src="/images/networking-2.jpg"
                alt="Gespräche"
                width={800}
                height={1200}
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="fade-up photo-zoom rounded-xl overflow-hidden">
              <Image
                src="/images/networking-3.jpg"
                alt="Community"
                width={800}
                height={1200}
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ VISION ═══════════════ */}
      <section className="py-24 md:py-36 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <p className="font-sans text-orange text-sm tracking-widest uppercase mb-6">
              Unsere Vision
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-snug mb-8">
              Einen Safe Space schaffen, in dem Fragen willkommen sind und Orientierung entsteht.
            </h2>
            <p className="font-sans text-lg md:text-xl text-dark/60 leading-relaxed">
              Die Zeit wird schneller, alles technischer &ndash; umso wichtiger ist es,
              Menschen zusammenzubringen, um Wissen und Perspektiven zu teilen.
              Genau die Spannung zwischen Mensch und Technik macht KI so relevant.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ ANMELDUNG ═══════════════ */}
      <section id="anmeldung" className="relative py-24 md:py-36 px-6 md:px-10 scroll-mt-20 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/room-presentation.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-dark/90 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="max-w-xl mx-auto">
            <div className="fade-up text-center mb-12">
              <p className="font-sans text-orange text-sm tracking-widest uppercase mb-4">
                Dabei sein
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-off-white leading-tight mb-4">
                Sichere dir deinen Platz.
              </h2>
              <p className="font-sans text-off-white/60 text-lg">
                Melde dich an f&uuml;r das n&auml;chste H1&ndash;A1 AI Meetup in Kiel.
              </p>
            </div>

            {submitted ? (
              <div className="fade-up visible bg-off-white/10 border border-off-white/15 rounded-3xl p-10 md:p-12 text-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">👋</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-off-white mb-4">
                  Say hi, sch&ouml;n dass du dabei bist!
                </h3>
                <p className="font-sans text-off-white/70 leading-relaxed mb-6">
                  Du hast dich erfolgreich f&uuml;r das H1&ndash;A1 AI Meetup angemeldet.
                </p>
                <div className="bg-off-white/5 rounded-2xl p-6 text-left mb-6">
                  <p className="font-sans text-off-white/80 leading-relaxed">
                    <strong className="text-off-white">Was dich erwartet:</strong>
                    <br />
                    KI-Updates, ein Deep Dive, Speed-Networking und echte Gespr&auml;che &ndash;
                    ca. 2 Stunden, locker und hands-on.
                  </p>
                </div>
                <p className="font-sans text-off-white/40 text-sm">
                  Wir freuen uns auf dich.
                  <br />
                  <strong className="text-orange">H1&ndash;A1 AI Meetup</strong> &middot; Deine KI Community
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="fade-up visible space-y-5">
                <div>
                  <label className="font-sans text-sm text-off-white/50 block mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-off-white/8 border border-off-white/15 rounded-xl px-5 py-4 font-sans text-off-white placeholder:text-off-white/25 focus:outline-none focus:border-orange transition-all duration-300"
                    placeholder="Dein Name"
                  />
                </div>
                <div>
                  <label className="font-sans text-sm text-off-white/50 block mb-2">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-off-white/8 border border-off-white/15 rounded-xl px-5 py-4 font-sans text-off-white placeholder:text-off-white/25 focus:outline-none focus:border-orange transition-all duration-300"
                    placeholder="deine@email.de"
                  />
                </div>
                <div>
                  <label className="font-sans text-sm text-off-white/50 block mb-2">
                    Kommst du alleine oder mit Begleitung? *
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, companion: "no" })
                      }
                      className={`flex-1 py-4 rounded-xl font-sans text-sm border transition-all duration-300 ${
                        formData.companion === "no"
                          ? "bg-orange border-orange text-off-white"
                          : "bg-off-white/5 border-off-white/15 text-off-white/50 hover:border-off-white/30"
                      }`}
                    >
                      Alleine
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, companion: "yes" })
                      }
                      className={`flex-1 py-4 rounded-xl font-sans text-sm border transition-all duration-300 ${
                        formData.companion === "yes"
                          ? "bg-orange border-orange text-off-white"
                          : "bg-off-white/5 border-off-white/15 text-off-white/50 hover:border-off-white/30"
                      }`}
                    >
                      Mit Begleitung
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-orange/10 border border-orange/20 rounded-xl px-5 py-3">
                    <p className="font-sans text-sm text-orange">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange text-off-white font-sans font-medium py-4 rounded-xl text-lg hover:bg-off-white hover:text-dark transition-all duration-300 disabled:opacity-50 mt-2"
                >
                  {loading ? "Wird gesendet\u2026" : "Anmelden"}
                </button>

                <p className="font-sans text-off-white/30 text-xs text-center pt-2">
                  Kostenlos &middot; Unverbindlich &middot; Kein Spam
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-16 md:py-20 px-6 md:px-10 border-t border-dark/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <div className="flex items-baseline gap-0 mb-3">
                <span className="font-serif italic text-3xl">H1</span>
                <span className="font-sans font-bold text-3xl">&ndash;A1</span>
              </div>
              <p className="font-sans text-gray text-sm">
                Deine KI Community in Kiel
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-2">
              <p className="font-serif italic text-2xl text-dark/40">
                Close the gap.
              </p>
              <p className="font-sans text-xs text-gray">
                Alle 6&ndash;8 Wochen &middot; Coworking Space Kiel &middot; Kostenlos
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import Lenis from "lenis";
import { BlogPost } from "@/lib/blog";

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

function BlogCard({
  post,
  formatDate,
  index,
}: {
  post: BlogPost;
  formatDate: (d: string) => string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: (index % 3) * 0.1,
      }}
    >
      <Link href={`/blog/${post.slug}`} className="group block interactive">
        <div className="overflow-hidden rounded-2xl bg-dark/5 aspect-[4/3] mb-5 relative">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/10 transition-colors duration-500" />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-sans font-medium text-orange border border-orange/30 rounded-full px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="font-serif text-xl md:text-2xl text-dark mb-2 group-hover:text-orange transition-colors duration-300 leading-snug">
          {post.title}
        </h2>
        <p className="text-gray font-sans text-sm leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-sans text-gray/70">
            {formatDate(post.date)}
          </span>
          <span className="text-sm font-sans font-medium text-dark group-hover:text-orange transition-colors duration-300 flex items-center gap-1">
            Lesen
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              className="inline-block"
            >
              →
            </motion.span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogGrid({
  posts,
  formatDate,
}: {
  posts: BlogPost[];
  formatDate: (d: string) => string;
}) {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-off-white">
      {/* Custom cursor */}
      <div className="cursor-dot" id="cursor-dot" />
      <div className="cursor-ring" id="cursor-ring" />
      <div className="noise-overlay" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-off-white/80 backdrop-blur-xl border-b border-dark/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-baseline gap-0 interactive hover:opacity-70 transition-opacity"
          >
            <span className="font-serif italic text-xl">H1</span>
            <span className="font-sans font-bold text-xl">&ndash;A1</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-sans text-gray hover:text-dark transition-colors interactive"
          >
            ← Zurück
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-sans text-sm text-orange uppercase tracking-widest mb-4">
            Community
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-dark leading-none mb-6">
            Blog
          </h1>
          <p className="font-sans text-lg text-gray max-w-xl leading-relaxed">
            Artikel, Einblicke und Gedanken rund um Künstliche Intelligenz –
            direkt aus der Kieler Community.
          </p>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="h-px bg-dark/10" />
      </div>

      {/* Grid */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        {posts.length === 0 ? (
          <p className="font-sans text-gray">
            Noch keine Artikel veröffentlicht.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {posts.map((post, i) => (
              <BlogCard
                key={post.slug}
                post={post}
                formatDate={formatDate}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 text-center border-t border-dark/10">
        <p className="font-sans text-gray text-sm mb-6">
          Willst du auch beim Meetup dabei sein?
        </p>
        <Link
          href="/#anmeldung"
          className="inline-flex items-center gap-2 bg-dark text-off-white font-sans text-sm px-6 py-3 rounded-full hover:bg-orange transition-colors duration-300 interactive"
        >
          Jetzt anmelden
        </Link>
      </section>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Lenis from "lenis";
import type { BlogPost as BlogPostType } from "@/lib/blog";

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

export default function BlogPost({
  post,
  formattedDate,
}: {
  post: BlogPostType;
  formattedDate: string;
}) {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-off-white">
      {/* Custom cursor */}
      <div className="cursor-dot" />
      <div className="cursor-ring" />
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
            href="/blog"
            className="text-sm font-sans text-gray hover:text-dark transition-colors interactive"
          >
            ← Blog
          </Link>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-[900px] mx-auto px-6 md:px-10 pt-16 pb-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-sans font-medium text-orange border border-orange/30 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-6xl text-dark leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm font-sans text-gray mb-10">
            <span>{formattedDate}</span>
            <span className="w-1 h-1 rounded-full bg-gray/40 inline-block" />
            <span>H1-A1 Community</span>
          </div>
        </motion.div>

        {/* Cover image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-14"
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent" />
        </motion.div>
      </motion.section>

      {/* Article body */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        className="max-w-[680px] mx-auto px-6 md:px-10 pb-24 blog-prose"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {/* Back link */}
      <div className="max-w-[680px] mx-auto px-6 md:px-10 pb-24 border-t border-dark/10 pt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-sans text-sm text-gray hover:text-orange transition-colors duration-300 interactive"
        >
          ← Zurück zum Blog
        </Link>
      </div>
    </div>
  );
}

import { getAllPosts } from "@/lib/blog";
import BlogGrid from "./BlogGrid";

export const metadata = {
  title: "Blog – H1-A1 AI Meetup",
  description:
    "Artikel, Einblicke und Gedanken rund um Künstliche Intelligenz aus der Kieler Community.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogGrid posts={posts} />;
}

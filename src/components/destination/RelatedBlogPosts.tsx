import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface RelatedBlogPostsProps {
  destinationName: string;
  destinationSlug: string;
}

export function RelatedBlogPosts({ destinationName, destinationSlug }: RelatedBlogPostsProps) {
  const { data: posts } = useQuery({
    queryKey: ['related-blog-posts', destinationSlug],
    queryFn: async () => {
      // Search for articles that mention the destination in title, tags, or content
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, image_url, category, published_at')
        .eq('is_published', true)
        .or(`title.ilike.%${destinationName}%,tags.cs.{${destinationSlug}}`)
        .order('published_at', { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              Guías y artículos sobre {destinationName}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/blog?q=${destinationName}`}>
                Ver todo <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/articulo/${post.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                    {post.image_url && (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      {post.category && (
                        <Badge variant="secondary" className="mb-2 text-xs">{post.category}</Badge>
                      )}
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}


import React, { useState, useMemo } from 'react';
import type { BlogPost } from '../../types';
import Card from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  posts: BlogPost[];
  onNavigate: (path: string) => void;
}

const BlogPage: React.FC<Props> = ({ posts, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(posts.map(p => p.category))];
    return cats;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter(p => p.category === activeCategory);
  }, [posts, activeCategory]);

  return (
    <Card>
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-brand-blue">
          From the <span className="text-brand-yellow">Ealing Exchange</span> Blog
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
          Expert tips, travel advice, and local guides to help you make the most of your money and your travels.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === category
                ? 'bg-brand-blue text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {filteredPosts.map(post => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={post.slug}
              onClick={() => onNavigate(`/blog/${post.slug}`)}
              className="group cursor-pointer flex flex-col bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200/80 hover:-translate-y-1"
            >
              <div className="overflow-hidden relative h-48">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=2942&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-sm font-bold">Read More →</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-brand-yellow uppercase tracking-wider">{post.category}</span>
                  <span className="text-[10px] text-slate-400 font-medium">5 min read</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 flex-grow group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {post.description}
                </p>
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center mr-2">
                      <span className="text-brand-blue text-[8px] font-bold">EE</span>
                    </div>
                    <span>{post.author}</span>
                  </div>
                  <span>{new Date(post.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
};

export default BlogPage;

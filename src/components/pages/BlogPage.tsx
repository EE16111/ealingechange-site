
import React from 'react';
import type { BlogPost } from '../../types';
import Card from '../ui/Card';

interface Props {
  posts: BlogPost[];
  onNavigate: (path: string) => void;
}

const BlogPage: React.FC<Props> = ({ posts, onNavigate }) => {
  return (
    <Card>
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-brand-blue">From the <span className="text-brand-yellow">Ealing Exchange</span> Blog</h1>
        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
          Expert tips, travel advice, and local guides to help you make the most of your money and your travels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <div key={post.slug} onClick={() => onNavigate(`/blog/${post.slug}`)} className="group cursor-pointer flex flex-col bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-slate-200/80">
            <div className="overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <p className="text-sm font-semibold text-brand-yellow uppercase">{post.category}</p>
              <h2 className="mt-2 text-xl font-bold text-slate-800 flex-grow group-hover:text-brand-blue transition-colors">{post.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{post.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                <span>By {post.author}</span> | <span>{new Date(post.date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BlogPage;

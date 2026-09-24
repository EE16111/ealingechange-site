import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogPosts } from '../../data/blogPosts';
import Card from '../ui/Card';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';

interface Props {
  onNavigate?: (path: string) => void;
}

const SocialShare: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 mt-8 pt-8 border-t border-slate-100">
      <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Share this:</span>
      <div className="flex space-x-2">
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 transition-colors">Facebook</button>
        <button className="bg-sky-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-sky-600 transition-colors">Twitter</button>
        <button className="bg-blue-800 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-900 transition-colors">LinkedIn</button>
        <button className="bg-slate-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-600 transition-colors">Email</button>
      </div>
    </div>
  )
}

const CTA: React.FC = () => (
  <div className="mt-12 bg-brand-blue rounded-xl p-8 text-center text-white relative overflow-hidden">
    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-brand-yellow rounded-full blur-3xl opacity-20"></div>
    <div className="relative z-10">
      <h3 className="text-2xl font-bold mb-2">Ready to Exchange?</h3>
      <p className="text-blue-200 mb-6">Lock in our competitive online rates today and pick up at your convenience.</p>
      <button className="bg-brand-yellow text-brand-blue font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg">
        View Live Rates
      </button>
    </div>
  </div>
)

const RelatedPosts: React.FC<{ currentSlug: string }> = ({ currentSlug }) => {
  // Get 3 random related posts (excluding current)
  // Simply filter and slice for demo
  const related = blogPosts.filter(p => p.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t-2 border-slate-100">
      <h3 className="text-2xl font-bold text-brand-blue mb-6">More from our Blog</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {related.map(post => (
          <Link key={post.slug} className="group cursor-pointer" to={`/blog/${post.slug}`}>
            <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <p className="text-xs font-bold text-brand-yellow uppercase mb-1">{post.category}</p>
            <h4 className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors line-clamp-2">{post.title}</h4>
          </Link>
        ))}
      </div>
    </div>
  )
}

const BlogPostPage: React.FC<Props> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.slug === slug);

  // Scroll to top when post changes
  useEffect(() => {
    if (post) {
      window.scrollTo(0, 0);
    }
  }, [post, post?.slug]);

  if (!post) {
    return (
      <Card>
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-red-600">Post Not Found</h1>
          <p className="mt-4 text-slate-500">Sorry, we couldn't find the blog post you were looking for.</p>
          <button onClick={() => navigate('/blog')} className="mt-8 flex items-center mx-auto text-sm font-semibold text-brand-blue hover:text-brand-yellow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Blog
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/blog')} className="flex items-center text-sm font-semibold text-brand-blue hover:text-brand-yellow transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Blog
        </button>
        <p className="text-base font-semibold text-brand-yellow uppercase">{post.category}</p>
        <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-blue leading-tight">{post.title}</h1>
        <div className="mt-4 text-sm text-slate-400">
          <span>By {post.author}</span> | <span>{new Date(post.date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <img src={post.imageUrl} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-lg mt-8 shadow-lg" />

        <div
          className="prose prose-lg lg:prose-xl max-w-none mt-8 text-slate-600 prose-headings:text-brand-blue prose-strong:text-slate-800 prose-a:text-brand-yellow hover:prose-a:text-yellow-700 prose-a:transition-colors"
          dangerouslySetInnerHTML={{ __html: post.content }}
        >
        </div>

        <SocialShare />
        <CTA />
        <RelatedPosts currentSlug={post.slug} />
      </div>
    </Card>
  );
};

export default BlogPostPage;

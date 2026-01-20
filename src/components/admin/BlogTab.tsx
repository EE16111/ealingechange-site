import React, { useState } from 'react';
import type { BlogPost } from '../../types';
import { blogPosts as initialPosts } from '../../data/blogPosts';

const BlogTab: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});

    const handleEdit = (post: BlogPost) => {
        setCurrentPost(post);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentPost({
            title: '',
            slug: '',
            category: 'Guides',
            author: 'Ealing Exchange Team',
            content: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            imageUrl: ''
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        // Mock save
        if (currentPost.slug) {
            const existingIndex = posts.findIndex(p => p.slug === currentPost.slug);
            if (existingIndex >= 0) {
                const newPosts = [...posts];
                newPosts[existingIndex] = currentPost as BlogPost;
                setPosts(newPosts);
            } else {
                setPosts([currentPost as BlogPost, ...posts]);
            }
        }
        setIsEditing(false);
    };

    const handleDelete = (slug: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            setPosts(posts.filter(p => p.slug !== slug));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Blog Management</h2>
                    <p className="text-slate-500">Create, edit, and manage your content marketing.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleCreate}
                        className="bg-brand-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors"
                    >
                        + New Post
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                        <input className="w-full p-2 border rounded" value={currentPost.title} onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Slug (URL)</label>
                            <input className="w-full p-2 border rounded" value={currentPost.slug} onChange={e => setCurrentPost({ ...currentPost, slug: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                            <select className="w-full p-2 border rounded" value={currentPost.category} onChange={e => setCurrentPost({ ...currentPost, category: e.target.value })}>
                                <option>Guides</option>
                                <option>News</option>
                                <option>Travel Tips</option>
                                <option>Finance</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description (Meta)</label>
                        <textarea className="w-full p-2 border rounded h-20" value={currentPost.description} onChange={e => setCurrentPost({ ...currentPost, description: e.target.value })} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Content (HTML)</label>
                        <textarea className="w-full p-2 border rounded h-64 font-mono text-sm" value={currentPost.content} onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })} />
                        <p className="text-xs text-slate-400 mt-1">Supports basic HTML tags.</p>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                        <input className="w-full p-2 border rounded" value={currentPost.imageUrl} onChange={e => setCurrentPost({ ...currentPost, imageUrl: e.target.value })} />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-slate-500 hover:text-slate-800 font-bold">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Save Post</button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {posts.map(post => (
                                <tr key={post.slug} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{post.title}</p>
                                        <p className="text-xs text-slate-400">/{post.slug}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{post.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{post.date}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(post)} className="text-brand-blue font-semibold hover:text-brand-yellow">Edit</button>
                                        <button onClick={() => handleDelete(post.slug)} className="text-red-400 hover:text-red-600">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BlogTab;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { BookOpen, ArrowLeft, Clock, Share2, Tag, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single();
        if (data) setPost(data);
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded-full" />
        <div className="h-20 bg-gray-100 rounded-2xl w-full" />
        <div className="h-96 bg-gray-100 rounded-[3rem] w-full" />
        <div className="space-y-4">
           <div className="h-4 bg-gray-100 rounded w-full" />
           <div className="h-4 bg-gray-100 rounded w-full" />
           <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100">
          <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Research Entry Forbidden</h2>
          <p className="text-gray-400 font-medium mb-8">The requested publication could not be identified.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
            <ArrowLeft className="h-3 w-3" /> Return to Archives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen pb-32">
      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors mb-12">
          <ArrowLeft className="h-3 w-3" /> Scientific Journals
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-wrap items-center gap-6 mb-8 text-[10px] font-black uppercase tracking-widest text-blue-600">
             <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full"><Tag className="h-3 w-3" /> Research Insight</span>
             <span className="flex items-center gap-2 text-gray-400"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
             <span className="flex items-center gap-2 text-gray-400"><Clock className="h-3 w-3" /> 5 Min Read</span>
          </div>
          
          <h1 className="mb-10 text-gray-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pb-12 border-b border-gray-100">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-900 p-0.5">
                   <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-xs text-blue-600">PS</div>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Authored by</p>
                   <p className="text-sm font-black text-gray-900">Research Peptides UK Editorial Board</p>
                </div>
             </div>
             <button className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Share2 className="h-5 w-5" />
             </button>
          </div>
        </motion.div>
      </header>

      {/* Featured Image */}
      {post.image_url && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-6xl mx-auto px-4 mb-20"
        >
          <div className="aspect-[21/9] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-blue-900/10">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="prose prose-xl prose-blue max-w-none text-gray-600 font-medium leading-relaxed"
        >
          <div className="whitespace-pre-wrap selection:bg-blue-100">
             {post.content}
          </div>
        </motion.div>

        {/* Footer Navigation */}
        <footer className="mt-24 pt-16 border-t border-gray-100 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">End of Scientific Journal Entry</p>
           <Link 
             to="/blog" 
             className="inline-flex items-center justify-center px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95"
           >
              Return to All Research
           </Link>
        </footer>
      </main>
    </article>
  );
}

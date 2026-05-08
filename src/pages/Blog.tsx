import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight, Clock, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        if (data) setPosts(data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Blog Hero */}
      <section className="bg-gray-50 border-b border-gray-100 pt-24 pb-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-600/5 -skew-x-12 translate-x-1/2" />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center gap-2 mb-6"
               >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Research Peptides UK Journals</span>
               </motion.div>
               <h1 className="mb-8">
                  Scientific <br /><span className="text-blue-600">Insights</span> & Research.
               </h1>
               <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
                  Deep dives into peptide synthesis, biological activity, and global research trends. 
                  Curated for the modern scientific community.
               </p>
            </div>
         </div>
      </section>

      {/* Blog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
         {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                   <div className="aspect-[16/10] bg-gray-100 rounded-[2.5rem] animate-pulse" />
                   <div className="h-8 bg-gray-100 rounded-xl w-3/4 animate-pulse" />
                   <div className="h-4 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
                </div>
             ))}
           </div>
         ) : posts.length === 0 ? (
           <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-sm">
              <BookOpen className="mx-auto h-16 w-16 text-gray-200 mb-6" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">No Publication Records</h3>
              <p className="text-gray-400 font-medium">Archived journals will appear here once peer-review is complete.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             {posts.map((post, idx) => (
               <motion.article 
                 key={post.id}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="group flex flex-col"
               >
                 <Link to={`/blog/${post.id}`} className="block relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-gray-100 mb-8 shadow-xl shadow-gray-200/20">
                   {post.image_url ? (
                     <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                        <BookOpen className="h-12 w-12" />
                     </div>
                   )}
                   <div className="absolute top-6 left-6 flex gap-2">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">Research</span>
                   </div>
                 </Link>

                 <div className="px-2 flex-grow flex flex-col">
                   <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">
                     <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> 4 Min Read</span>
                     <span className="flex items-center gap-2"><User className="h-3 w-3" /> Editorial Team</span>
                   </div>
                   
                   <h2 className="text-2xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                     {post.title}
                   </h2>
                   
                   <p className="text-gray-500 font-medium leading-relaxed mb-8 line-clamp-3">
                     {post.content.substring(0, 150)}...
                   </p>
                   
                   <div className="mt-auto">
                     <Link 
                       to={`/blog/${post.id}`} 
                       className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:gap-4 transition-all"
                     >
                       Explore Article <ArrowRight className="h-3 w-3" />
                     </Link>
                   </div>
                 </div>
               </motion.article>
             ))}
           </div>
         )}
      </main>
    </div>
  );
}

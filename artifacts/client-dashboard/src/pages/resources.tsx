import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetResources, useToggleSaveResource, getGetResourcesQueryKey, GetResourcesCategory } from '@workspace/api-client-react';
import { pageTransition, staggerContainer, staggerItem, PageHeader } from '@/components/shared';
import { BookOpen, PlayCircle, FileText, Download, Bookmark, BookmarkCheck, Search, Star, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Resources' },
  { id: 'article', label: 'Articles' },
  { id: 'video', label: 'Videos' },
  { id: 'worksheet', label: 'Worksheets' },
  { id: 'meditation', label: 'Meditations' },
  { id: 'pdf', label: 'PDFs' },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const queryParams = activeCategory !== 'all' ? { category: activeCategory as GetResourcesCategory } : undefined;
  const { data: apiResources, isLoading } = useGetResources(queryParams);

  const mockResources = [
    {
      id: 1,
      title: "Understanding Panic & Somatic Grounding Techniques",
      category: "article",
      description: "Practical step-by-step physical grounding tools to de-escalate panic attacks and physical hyperarousal.",
      thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80",
      readingMinutes: 5,
      author: "Dr. Sarah Jenkins",
      isSaved: true,
      isSharedByTherapist: true,
      downloadUrl: "#"
    },
    {
      id: 2,
      title: "Cognitive Distortions Reference Guide & Worksheet",
      category: "worksheet",
      description: "Identify and reframe the 10 most common unhelpful thinking habits with real-life examples.",
      thumbnailUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=80",
      readingMinutes: 8,
      author: "Hexpertify Clinical Team",
      isSaved: false,
      isSharedByTherapist: true,
      downloadUrl: "#"
    },
    {
      id: 3,
      title: "15-Minute Progressive Muscle Relaxation (PMR)",
      category: "meditation",
      description: "Guided audio session systematically tensing and relaxing major muscle groups to release somatic tension.",
      thumbnailUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80",
      readingMinutes: 15,
      author: "Dr. Sarah Jenkins",
      isSaved: true,
      isSharedByTherapist: false,
      downloadUrl: "#"
    }
  ];

  const resources = (Array.isArray(apiResources) && apiResources.length > 0) ? apiResources : mockResources;
  const toggleSaveMutation = useToggleSaveResource();
  const queryClient = useQueryClient();

  const handleToggleSave = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveMutation.mutate({ id }, {
      onSuccess: () => {
        // Invalidate to update the isSaved status
        queryClient.invalidateQueries({ queryKey: getGetResourcesQueryKey(queryParams) });
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'pdf':
      case 'worksheet': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const filteredResources = resources?.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-8 pb-12">
      <PageHeader 
        title="Resource Library" 
        description="Tools, exercises, and reading material to support your journey." 
        badge="RESOURCE LIBRARY"
        icon={<BookOpen className="w-4 h-4 text-purple-200" />}
      >
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/95 text-slate-900 placeholder:text-slate-400 rounded-full text-xs font-semibold shadow-md outline-none focus:ring-2 focus:ring-white transition-all"
          />
        </div>
      </PageHeader>

      <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 hide-scrollbar">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
              activeCategory === tab.id 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-white text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 bg-muted rounded-[24px]"></div>)}
        </div>
      ) : filteredResources?.length === 0 ? (
        <div className="hex-card !py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-accent text-primary flex items-center justify-center mb-6">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">No resources found</h3>
          <p className="text-muted-foreground">Try adjusting your search or selecting a different category.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources?.map((resource) => (
            <motion.div key={resource.id} variants={staggerItem} className="hex-card !p-0 overflow-hidden flex flex-col group">
              <div className="relative h-48 bg-muted overflow-hidden">
                {resource.thumbnailUrl ? (
                  <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-accent text-primary/50 flex items-center justify-center">
                    {getCategoryIcon(resource.category)}
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur text-foreground rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    {getCategoryIcon(resource.category)} {resource.category}
                  </span>
                </div>

                <button 
                  onClick={(e) => handleToggleSave(e, resource.id)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-white transition-colors shadow-sm"
                >
                  {resource.isSaved ? (
                    <BookmarkCheck className="w-5 h-5 text-primary" fill="currentColor" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="p-6 flex flex-col flex-1">
                {resource.isSharedByTherapist && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-3">
                    <Star className="w-4 h-4 fill-primary" /> Recommended by Therapist
                  </div>
                )}
                
                <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                  {resource.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {resource.readingMinutes} min read
                  </span>
                  
                  {resource.downloadUrl && (
                    <a href={resource.downloadUrl} download onClick={e => e.stopPropagation()} className="text-primary hover:bg-accent p-2 rounded-full transition-colors">
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

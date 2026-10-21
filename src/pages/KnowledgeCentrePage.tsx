import React, { useState } from 'react';
import { knowledgeService } from '../services/knowledgeService';
import { KnowledgeArticle } from '../types';
import { Search, BookOpen, Clock, User, Building, X, Tag } from 'lucide-react';

export const KnowledgeCentrePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  const categories = [
    'All',
    'Soil Health',
    'Natural & Bio-inputs',
    'Farm Mechanization',
    'Livestock Management',
    'Integrated Pest Management'
  ];

  const articles = knowledgeService.searchArticles({
    query: searchQuery,
    category: selectedCategory
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-agri">
            Agricultural Extension Repository
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest-900 mt-1">
            Agricultural Knowledge Centre
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 max-w-2xl">
            Practical field guides, crop stage calendars, soil health protocols, and integrated pest management manuals authored by ICAR and university researchers.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === c
                ? 'bg-forest-600 text-white shadow-subtle'
                : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-subtle relative">
        <Search className="w-4 h-4 text-brand-muted absolute left-7 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles on bio-priming, stubble management, dairy rations..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
        />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArticle(art)}
            className="group bg-white rounded-3xl overflow-hidden border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-cream-100">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10.5px] font-bold text-forest-900 shadow-subtle">
                  {art.category}
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                <h3 className="font-heading font-bold text-base text-forest-900 group-hover:text-forest-700 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-brand-muted line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-cream-200 mt-auto flex items-center justify-between text-[11px] text-brand-muted">
              <span className="truncate max-w-[150px]">By {art.author}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {art.readTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative h-56 shrink-0">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest-600">
                  {activeArticle.category}
                </span>
                <h2 className="font-heading font-bold text-lg sm:text-xl text-white">
                  {activeArticle.title}
                </h2>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-brand-text">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-3 text-brand-muted">
                <span>Author: <strong>{activeArticle.author}</strong> ({activeArticle.institution})</span>
                <span>Published: {activeArticle.publishedDate} • {activeArticle.readTime}</span>
              </div>

              <div className="text-sm leading-relaxed text-brand-text space-y-3 font-body">
                <p>{activeArticle.content}</p>
                <p className="text-xs text-brand-muted bg-cream-50 p-4 rounded-2xl border border-brand-border italic">
                  Note: For specific soil types and localized micro-climatic variations, consultation with the nearest Krishi Vigyan Kendra (KVK) or ICAR scientist is recommended before undertaking large-scale field applications.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {activeArticle.tags.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-[11px] bg-forest-50 text-forest-800 px-2.5 py-1 rounded-lg border border-forest-200">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-brand-border bg-cream-50 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

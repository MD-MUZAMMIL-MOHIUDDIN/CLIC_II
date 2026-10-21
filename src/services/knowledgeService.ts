import articlesSeed from '../data/knowledge-articles.json';
import { KnowledgeArticle } from '../types';
import { getInitialData } from './storageHelper';

const ARTICLES_KEY = 'knowledge_articles';

class KnowledgeService {
  public getAllArticles(): KnowledgeArticle[] {
    return getInitialData<KnowledgeArticle[]>(ARTICLES_KEY, articlesSeed as KnowledgeArticle[]);
  }

  public getArticleById(id: string): KnowledgeArticle | undefined {
    return this.getAllArticles().find(a => a.id === id);
  }

  public searchArticles(params: { query?: string; category?: string }): KnowledgeArticle[] {
    let list = this.getAllArticles();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
      );
    }
    if (params.category && params.category !== 'All') {
      list = list.filter(a => a.category === params.category);
    }
    return list;
  }
}

export const knowledgeService = new KnowledgeService();


import { Contact, Company, Task, Deal, Project, Sequence, KnowledgeArticle } from '../types';
import { MOCK_CONTACTS, MOCK_COMPANIES, MOCK_TASKS, MOCK_DEALS, MOCK_SEQUENCES } from '../constants';

const DB_PREFIX = 'thesolopreneur_db_';

class DatabaseService {
  private get<T>(key: string): T | null {
    const data = localStorage.getItem(DB_PREFIX + key);
    return data ? JSON.parse(data) : null;
  }

  private set<T>(key: string, value: T): void {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
  }

  // Contacts
  getContacts(): Contact[] {
    return this.get<Contact[]>('contacts') || MOCK_CONTACTS;
  }
  saveContacts(contacts: Contact[]): void {
    this.set('contacts', contacts);
  }

  // Companies
  getCompanies(): Company[] {
    return this.get<Company[]>('companies') || MOCK_COMPANIES;
  }
  saveCompanies(companies: Company[]): void {
    this.set('companies', companies);
  }

  // Tasks
  getTasks(): Task[] {
    return this.get<Task[]>('tasks') || MOCK_TASKS;
  }
  saveTasks(tasks: Task[]): void {
    this.set('tasks', tasks);
  }

  // Deals
  getDeals(): Deal[] {
    return this.get<Deal[]>('deals') || MOCK_DEALS;
  }
  saveDeals(deals: Deal[]): void {
    this.set('deals', deals);
  }

  // Projects
  getProjects(): Project[] {
    return this.get<Project[]>('projects') || [];
  }
  saveProjects(projects: Project[]): void {
    this.set('projects', projects);
  }

  // Sequences
  getSequences(): Sequence[] {
    return this.get<Sequence[]>('sequences') || MOCK_SEQUENCES;
  }
  saveSequences(sequences: Sequence[]): void {
    this.set('sequences', sequences);
  }

  // Knowledge Articles
  getKnowledgeArticles(): KnowledgeArticle[] {
    return this.get<KnowledgeArticle[]>('knowledge_articles') || [];
  }
  saveKnowledgeArticles(articles: KnowledgeArticle[]): void {
    this.set('knowledge_articles', articles);
  }

  // Reset Database
  reset(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(DB_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  }
}

export const db = new DatabaseService();

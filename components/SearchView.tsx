
import React, { useState, useCallback } from 'react';
import { findProspects, enrichProspect } from '../services/geminiService';
import { Contact, Company, ProspectGenerationResult } from '../types';
// Fixed missing LocationMarkerIcon import
import { SpinnerIcon, SearchIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, LinkedInIcon, DollarSignIcon, FileIcon, UserIcon, CompaniesIcon, PlusIcon, LocationMarkerIcon } from './ui/icons';

interface SearchViewProps {
  onAddProspects: (contacts: Contact[], companies: Company[]) => void;
}

const EnrichedSection: React.FC<{ contact: Contact; company?: Company }> = ({ contact, company }) => {
    if (!contact.enrichment || !company?.enrichment) return null;

    return (
        <div className="bg-gray-900/80 p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in border-t-2 border-black">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-secondary">
                    <SparklesIcon className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Contact Insights</h4>
                </div>
                <div className="glass border-2 border-white/10 p-4">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Recent Activity</p>
                    <p className="text-sm text-gray-200 italic font-medium leading-relaxed">"{contact.enrichment.recentPost}"</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {contact.enrichment.keyInterests?.map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-800 text-brand-secondary text-[10px] rounded-none uppercase font-black border-2 border-black shadow-brutalist-sm">
                            {interest}
                        </span>
                    ))}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Outreach Tone</p>
                    <p className="text-sm text-brand-primary font-black uppercase tracking-tighter italic">{contact.enrichment.communicationStyle}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-primary">
                    <DollarSignIcon className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Company Intelligence</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass border-2 border-white/10 p-3">
                        <p className="text-[10px] text-gray-500 font-black uppercase">Funding</p>
                        <p className="text-base text-white font-black">{company.enrichment.funding}</p>
                    </div>
                    <div className="glass border-2 border-white/10 p-3">
                        <p className="text-[10px] text-gray-500 font-black uppercase">Rev. Estimate</p>
                        <p className="text-base text-brand-accent font-black">{company.enrichment.estimatedRevenue}</p>
                    </div>
                </div>
                <div className="glass border-2 border-white/10 p-4">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Recent News</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{company.enrichment.recentNews}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                        {company.enrichment.techStack?.map((tech, i) => (
                            <span key={i} className="px-2 py-0.5 bg-brand-primary/20 text-white text-[10px] font-black uppercase border border-brand-primary/40">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SearchView: React.FC<SearchViewProps> = ({ onAddProspects }) => {
  const [searchMode, setSearchMode] = useState<'PEOPLE' | 'COMPANIES'>('PEOPLE');
  const [title, setTitle] = useState('Software Engineer');
  const [industry, setIndustry] = useState('Technology');
  const [location, setLocation] = useState('San Francisco');
  
  const [isLoading, setIsLoading] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProspectGenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'CONTACTS' | 'COMPANIES'>('CONTACTS');

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await findProspects(title, industry, location, searchMode);
      setResults(data);
      setActiveTab(searchMode === 'PEOPLE' ? 'CONTACTS' : 'COMPANIES');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [title, industry, location, searchMode]);

  const handleEnrich = async (contact: Contact) => {
    setEnrichingId(contact.id);
    try {
        const enrichment = await enrichProspect(contact.name, contact.companyName);
        
        setResults(prev => {
            if (!prev) return prev;
            return {
                contacts: prev.contacts.map(c => c.id === contact.id ? { ...c, enrichment: enrichment.contact } : c),
                companies: prev.companies.map(co => co.name === contact.companyName ? { ...co, enrichment: enrichment.company } : co)
            };
        });
        setExpandedId(contact.id);
    } catch (err) {
        console.error(err);
    } finally {
        setEnrichingId(null);
    }
  };
  
  const handleAddAll = () => {
      if(results) {
          onAddProspects(results.contacts, results.companies);
          setResults(null); // Clear results after adding
      }
  }

  const handleAddSingleCompany = (company: Company) => {
    // We add the company and the associated contact from the results list
    const associatedContacts = results?.contacts.filter(c => c.companyName === company.name) || [];
    onAddProspects(associatedContacts, [company]);
  }

  return (
    <div className="space-y-10">
      <div className="glass p-8 rounded-none border-2 border-white/10 shadow-glass-brutalist">
        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => setSearchMode('PEOPLE')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest border-2 border-black transition-all ${
                    searchMode === 'PEOPLE' ? 'bg-brand-primary text-white shadow-brutalist' : 'bg-gray-800 text-gray-500 hover:text-white'
                }`}
            >
                <UserIcon className="w-4 h-4" />
                Find People
            </button>
            <button 
                onClick={() => setSearchMode('COMPANIES')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest border-2 border-black transition-all ${
                    searchMode === 'COMPANIES' ? 'bg-brand-primary text-white shadow-brutalist' : 'bg-gray-800 text-gray-500 hover:text-white'
                }`}
            >
                <CompaniesIcon className="w-4 h-4" />
                Find Businesses
            </button>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <label htmlFor="title" className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                {searchMode === 'PEOPLE' ? 'Target Job Title' : 'Keywords / Focus'}
            </label>
            <input 
                type="text" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder={searchMode === 'PEOPLE' ? "e.g., CTO, VP Sales" : "e.g., Series A, Fintech"}
                className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-3 px-4 focus:ring-0 focus:border-brand-primary outline-none shadow-brutalist-sm focus:shadow-brutalist transition-all placeholder:text-gray-700" 
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="industry" className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Industry Vertical</label>
            <input type="text" id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-3 px-4 focus:ring-0 focus:border-brand-primary outline-none shadow-brutalist-sm focus:shadow-brutalist transition-all" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="location" className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Global Location</label>
            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-3 px-4 focus:ring-0 focus:border-brand-primary outline-none shadow-brutalist-sm focus:shadow-brutalist transition-all" />
          </div>
          <button type="submit" disabled={isLoading} className="md:col-span-1 w-full flex items-center justify-center bg-brand-primary brutalist-button text-white font-black py-3 px-6 rounded-none transition-all uppercase tracking-widest disabled:bg-gray-700 disabled:shadow-none">
            {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : <SearchIcon className="w-6 h-6 mr-2" />}
            {isLoading ? 'Scanning...' : 'Fetch Intel'}
          </button>
        </form>
        {error && <p className="text-red-400 mt-4 font-black uppercase text-xs">{error}</p>}
      </div>

      {isLoading && (
         <div className="flex justify-center items-center h-64 glass border-2 border-white/10 rounded-none shadow-glass-brutalist">
            <div className="text-center">
                 <div className="w-16 h-16 bg-brand-primary border-4 border-black shadow-brutalist flex items-center justify-center mx-auto mb-6">
                    <SpinnerIcon className="w-10 h-10 text-white animate-spin" />
                 </div>
                 <p className="text-2xl text-white font-black uppercase tracking-tighter">AI Mission Active</p>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Connecting to Real-time Grounding Nodes...</p>
            </div>
         </div>
      )}

      {results && (
        <div className="glass rounded-none shadow-glass-brutalist overflow-hidden border-2 border-white/10">
            <div className="p-6 flex justify-between items-center border-b-2 border-black bg-gray-900/50">
                <div className="flex gap-8">
                    <button 
                        onClick={() => setActiveTab('CONTACTS')}
                        className={`pb-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'CONTACTS' ? 'text-white border-b-4 border-brand-primary' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        People ({results.contacts.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('COMPANIES')}
                        className={`pb-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'COMPANIES' ? 'text-white border-b-4 border-brand-primary' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Companies ({results.companies.length})
                    </button>
                </div>
                <button onClick={handleAddAll} className="bg-brand-accent brutalist-button text-gray-900 font-black py-3 px-6 rounded-none uppercase tracking-widest">Import All</button>
            </div>
            
            {activeTab === 'CONTACTS' ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-black/20">
                            <tr className="border-b-2 border-black">
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Unit</th>
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Geography</th>
                            <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                            {results.contacts.map((contact) => (
                            <React.Fragment key={contact.id}>
                                <tr className={`transition-colors ${expandedId === contact.id ? 'bg-brand-primary/20' : 'hover:bg-white/5'}`}>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-800 border-2 border-black shadow-brutalist-sm flex items-center justify-center text-brand-secondary font-black">
                                                {contact.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-black text-white uppercase tracking-tight">{contact.name}</div>
                                                <div className="text-[10px] text-gray-500 font-bold">{contact.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-xs text-white font-black uppercase tracking-tighter">{contact.title}</div>
                                        <div className="text-[10px] text-gray-500 font-bold">{contact.companyName}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-[10px] font-black text-gray-400 uppercase">{contact.location}</td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                            onClick={() => contact.enrichment ? setExpandedId(expandedId === contact.id ? null : contact.id) : handleEnrich(contact)}
                                            disabled={enrichingId === contact.id}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-brutalist-sm active:shadow-none transition-all ${
                                                contact.enrichment 
                                                ? 'bg-gray-700 text-white' 
                                                : 'bg-brand-secondary text-gray-900'
                                            }`}
                                            >
                                                {enrichingId === contact.id ? <SpinnerIcon className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                                                {enrichingId === contact.id ? 'Enriching...' : contact.enrichment ? (expandedId === contact.id ? 'Close' : 'View') : 'Enrich'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === contact.id && (
                                    <tr>
                                        <td colSpan={4} className="p-0 border-b-2 border-black">
                                            <EnrichedSection 
                                                contact={contact} 
                                                company={results.companies.find(co => co.name === contact.companyName)} 
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-900/40">
                    {results.companies.map((company) => (
                        <div key={company.id} className="glass p-6 border-2 border-black shadow-brutalist-sm hover:translate-y-[-2px] transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-gray-800 border-2 border-black flex items-center justify-center text-xl font-black text-brand-primary">
                                        {company.name.charAt(0)}
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest border border-gray-700 px-2 py-0.5">{company.size}</span>
                                </div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">{company.name}</h4>
                                <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-3">{company.industry}</p>
                                <p className="text-xs text-gray-400 font-bold leading-relaxed line-clamp-2 mb-4 italic">"{company.description}"</p>
                                <div className="flex items-center text-[10px] text-gray-500 font-black uppercase gap-2 mb-6">
                                    <LocationMarkerIcon className="w-3 h-3" />
                                    {company.location}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a 
                                    href={`https://${company.website}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex-1 bg-gray-800 border-2 border-black text-[10px] font-black uppercase text-center py-2 hover:bg-gray-700 transition-all"
                                >
                                    Website
                                </a>
                                <button 
                                    onClick={() => handleAddSingleCompany(company)}
                                    className="flex-1 bg-brand-primary border-2 border-black text-[10px] font-black uppercase text-white py-2 hover:bg-brand-primary/80 transition-all flex items-center justify-center gap-1 shadow-brutalist-sm active:shadow-none"
                                >
                                    <PlusIcon className="w-3 h-3" />
                                    Import
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchView;

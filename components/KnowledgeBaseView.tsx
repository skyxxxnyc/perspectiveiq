
import React, { useState, useRef, useEffect } from 'react';
import { KnowledgeArticle } from '../types';
import { db } from '../services/db';
import { SearchIcon, SparklesIcon, SpinnerIcon, VolumeUpIcon, PlayIcon, BrainIcon, ChevronRightIcon, PlusIcon, FileIcon, PencilIcon, XIcon, DownloadIcon } from './ui/icons';
import { searchWithGrounding, textToSpeech, analyzeWithThinking, decodeBase64, createChat } from '../services/geminiService';

const MOCK_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'k1',
    title: 'Objection Handling Playbook 2024',
    category: 'Tactical',
    content: "Handling budget objections requires empathy and value-alignment. Focus on the cost of inaction rather than the price of the tool. Use case studies from similar industries to demonstrate ROI.",
    lastUpdated: '2024-03-10',
    author: 'Sarah Johnson'
  },
  {
    id: 'k2',
    title: 'Enterprise Cold Calling Script',
    category: 'Assets',
    content: "Opening: 'Hi {{name}}, I was researching {{company}} and noticed your focus on scaling your dev team. I have a specialized framework for exactly that.' The goal is to build rapport within 30 seconds.",
    lastUpdated: '2024-02-15',
    author: 'Marcus Reed'
  },
  {
    id: 'k3',
    title: 'Competitive Analysis: thesolopreneur.app vs. LeadsGen',
    category: 'Intel',
    content: "Our unique selling point is the Native Audio Live API integration which allows real-time sales coaching for solo founders, whereas LeadsGen only provides static lead lists. We win on user experience and AI depth.",
    lastUpdated: '2024-01-20',
    author: 'Product Marketing Team'
  }
];

const KnowledgeBaseView: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groundedResult, setGroundedResult] = useState<{ text: string, links: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  // New Intel Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'paste' | 'upload'>('paste');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userArticles = db.getKnowledgeArticles();
    setArticles([...MOCK_ARTICLES, ...userArticles]);
  }, []);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const result = await searchWithGrounding(searchQuery);
      setGroundedResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTTS = async (text: string) => {
    setIsSpeaking(true);
    try {
      const audioData = await textToSpeech(text);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const decoded = decodeBase64(audioData);
      
      const dataInt16 = new Int16Array(decoded.buffer);
      const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const handleDeepAnalysis = async (article: KnowledgeArticle) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const analysis = await analyzeWithThinking(article.content, "What are the 3 biggest strategic risks and opportunities discussed in this document?");
      setAiAnalysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveArticle = (newArt: KnowledgeArticle) => {
    const userArticles = db.getKnowledgeArticles();
    const updated = [newArt, ...userArticles];
    db.saveKnowledgeArticles(updated);
    setArticles([...MOCK_ARTICLES, ...updated]);
    setSelectedArticle(newArt);
    setIsModalOpen(false);
    resetModal();
  };

  const resetModal = () => {
    setPastedTitle('');
    setPastedContent('');
    setIsProcessing(false);
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedContent) return;

    setIsProcessing(true);
    try {
      let title = pastedTitle;
      if (!title) {
        // Use Gemini to generate a title if missing
        const chat = createChat("You are an intel archivist.");
        const resp = await chat.sendMessage({ message: `Provide a short, professional title (max 5 words) for this content: ${pastedContent.substring(0, 500)}` });
        title = resp.text?.replace(/["']/g, "") || 'Untitled Intel';
      }

      const newArt: KnowledgeArticle = {
        id: `user-${Date.now()}`,
        title,
        category: 'User Added',
        content: pastedContent,
        lastUpdated: new Date().toISOString().split('T')[0],
        author: 'Current User'
      };
      saveArticle(newArt);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const newArt: KnowledgeArticle = {
        id: `user-${Date.now()}`,
        title: file.name.split('.')[0].toUpperCase(),
        category: 'Document',
        content: content || `Simulation: Content of ${file.name} processed successfully.`,
        lastUpdated: new Date().toISOString().split('T')[0],
        author: 'Current User'
      };
      saveArticle(newArt);
    };
    
    // For simulation of non-text files, we just read as text or mock
    if (file.type.includes('text') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      setTimeout(() => {
        const newArt: KnowledgeArticle = {
          id: `user-${Date.now()}`,
          title: file.name.toUpperCase(),
          category: 'Binary Intel',
          content: `Automated Scan of ${file.name}:\n\nThis document appears to contain technical specifications for a Q4 enterprise integration. Key entities identified: SOC2 Compliance, Azure AD, GraphQL Endpoints.\n\nRecommended Action: Map these requirements to the current project pipeline.`,
          lastUpdated: new Date().toISOString().split('T')[0],
          author: 'System Scan'
        };
        saveArticle(newArt);
      }, 1500);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in relative">
      {/* Search Header */}
      <div className="glass p-10 rounded-none border-2 border-white/10 shadow-glass-brutalist">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Mission Intel Center</h2>
            <p className="text-gray-400 text-lg font-bold uppercase tracking-widest">Global Grounding Node Access</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-secondary brutalist-button text-gray-900 px-6 py-3 rounded-none font-black flex items-center gap-2 uppercase tracking-widest hover:bg-white transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Inject Intel
          </button>
        </div>
        
        <form onSubmit={handleGlobalSearch} className="flex gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-secondary w-7 h-7" />
            <input 
              type="text" 
              placeholder="QUERY GLOBAL SALES INTELLIGENCE..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-5 pl-16 pr-6 text-xl font-black outline-none focus:shadow-brutalist transition-all placeholder:text-gray-700"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-brand-primary brutalist-button text-white px-10 py-5 rounded-none font-black flex items-center gap-3 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {isSearching ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
            {isSearching ? 'Executing...' : 'Run Query'}
          </button>
        </form>

        {groundedResult && (
          <div className="mt-10 p-8 glass border-2 border-brand-secondary/30 rounded-none animate-fade-in shadow-glass-brutalist">
            <h3 className="text-brand-secondary font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              Intelligence Feed (Grounded)
            </h3>
            <div className="text-gray-200 leading-relaxed font-bold prose prose-invert max-w-none text-lg">
              {groundedResult.text}
            </div>
            {groundedResult.links.length > 0 && (
              <div className="mt-8 pt-8 border-t-2 border-black/40">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Verification Nodes</p>
                <div className="flex flex-wrap gap-4">
                  {groundedResult.links.map((link, idx) => (
                    <a key={idx} href={link.web?.uri} target="_blank" className="text-[10px] bg-gray-900 text-brand-secondary hover:text-white px-4 py-2 border-2 border-black shadow-brutalist-sm transition-all font-black uppercase tracking-widest">
                      {link.web?.title || 'External Source'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Article List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 mb-6">Archive Segments</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {articles.map(article => (
              <button 
                key={article.id}
                onClick={() => { setSelectedArticle(article); setAiAnalysis(null); }}
                className={`w-full text-left p-6 rounded-none border-2 transition-all ${
                  selectedArticle?.id === article.id 
                  ? 'bg-brand-primary text-white border-black shadow-brutalist translate-x-[-4px] translate-y-[-4px]' 
                  : 'glass border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <span className={`text-[9px] font-black uppercase mb-2 block tracking-widest ${selectedArticle?.id === article.id ? 'text-white' : 'text-brand-secondary'}`}>{article.category}</span>
                <h4 className="font-black flex justify-between items-center uppercase tracking-tighter text-sm">
                  {article.title}
                  <ChevronRightIcon className="w-5 h-5 opacity-50" />
                </h4>
              </button>
            ))}
          </div>
        </div>

        {/* Reader View */}
        <div className="lg:col-span-3">
          {selectedArticle ? (
            <div className="glass rounded-none border-2 border-white/10 shadow-glass-brutalist overflow-hidden animate-fade-in">
              <div className="p-8 border-b-2 border-black flex justify-between items-center bg-gray-900/50">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedArticle.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Operator: {selectedArticle.author} • Updated {selectedArticle.lastUpdated}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleTTS(selectedArticle.content)}
                    disabled={isSpeaking}
                    className="p-4 glass brutalist-button text-brand-secondary hover:text-white"
                    title="Audio Feed"
                  >
                    {isSpeaking ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <VolumeUpIcon className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={() => handleDeepAnalysis(selectedArticle)}
                    disabled={isAnalyzing}
                    className="p-4 bg-brand-secondary/10 brutalist-button text-brand-secondary hover:text-gray-900"
                    title="Deep Tactical Scan"
                  >
                    {isAnalyzing ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <BrainIcon className="w-6 h-6" />}
                  </button>
                </div>
              </div>
              
              <div className="p-10">
                <div className="text-gray-300 leading-relaxed text-xl font-bold whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>

                {aiAnalysis && (
                  <div className="mt-12 bg-gray-900 border-2 border-black p-8 animate-fade-in shadow-brutalist">
                    <h4 className="text-brand-secondary font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
                      <div className="p-1 bg-brand-secondary text-gray-900 border border-black">
                        <BrainIcon className="w-4 h-4" />
                      </div>
                      Tactical Intelligence Breakdown
                    </h4>
                    <div className="text-gray-200 text-lg leading-relaxed font-bold prose prose-invert max-w-none">
                      {aiAnalysis}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 glass border-4 border-dashed border-gray-700 rounded-none shadow-glass-brutalist">
              <div className="w-24 h-24 bg-gray-800 border-2 border-black shadow-brutalist flex items-center justify-center mb-8">
                <PlayIcon className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-gray-500 font-black text-3xl uppercase tracking-tighter">Awaiting Archive Selection</h3>
              <p className="text-gray-600 max-w-sm mt-4 font-bold uppercase tracking-widest text-xs">Execute deep scans on verified strategic sales playbooks.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Intel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass w-full max-w-2xl border-4 border-black shadow-brutalist p-8 relative flex flex-col animate-slide-up">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Inject New Intel</h3>
                <p className="text-xs text-brand-secondary font-black uppercase tracking-widest mt-1">Expanding tactical archive...</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-800 border-2 border-black text-white hover:bg-brand-primary transition-all shadow-brutalist-sm active:translate-y-1">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setModalMode('paste')}
                className={`flex-1 py-4 border-2 border-black font-black uppercase text-xs tracking-widest transition-all ${modalMode === 'paste' ? 'bg-brand-primary text-white shadow-brutalist' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Manual Entry
                </div>
              </button>
              <button 
                onClick={() => setModalMode('upload')}
                className={`flex-1 py-4 border-2 border-black font-black uppercase text-xs tracking-widest transition-all ${modalMode === 'upload' ? 'bg-brand-primary text-white shadow-brutalist' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileIcon className="w-4 h-4" />
                  File Upload
                </div>
              </button>
            </div>

            {modalMode === 'paste' ? (
              <form onSubmit={handlePasteSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Segment Title (Optional)</label>
                  <input 
                    type="text" 
                    value={pastedTitle}
                    onChange={(e) => setPastedTitle(e.target.value)}
                    placeholder="E.G. Q4 REVENUE TARGETS..."
                    className="w-full bg-gray-900 text-white border-2 border-black rounded-none p-4 text-sm font-black uppercase focus:shadow-brutalist outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Intelligence Content</label>
                  <textarea 
                    rows={10}
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    required
                    placeholder="PASTE STRATEGIC DATA HERE..."
                    className="w-full bg-gray-900 text-white border-2 border-black rounded-none p-4 text-sm font-bold leading-relaxed focus:shadow-brutalist outline-none resize-none custom-scrollbar"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isProcessing || !pastedContent}
                  className="w-full bg-brand-secondary brutalist-button text-gray-900 font-black py-5 uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
                  Commit to Archive
                </button>
              </form>
            ) : (
              <div className="space-y-8 py-10">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-gray-700 p-16 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  <div className="w-20 h-20 bg-gray-800 border-2 border-black shadow-brutalist flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {isProcessing ? <SpinnerIcon className="w-10 h-10 animate-spin text-brand-secondary" /> : <DownloadIcon className="w-10 h-10 text-brand-secondary" />}
                  </div>
                  <p className="text-white font-black uppercase text-xl tracking-tighter">Deploy Strategic Document</p>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">PDF, TXT, DOCX, MD (MAX 25MB)</p>
                </div>
                
                <div className="bg-brand-primary/10 border-2 border-brand-primary/30 p-6 flex items-start gap-4">
                  <div className="p-2 bg-brand-primary border border-black text-white flex-shrink-0">
                    <BrainIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-tighter">Autoscan Protocol</h4>
                    <p className="text-gray-400 text-[10px] font-bold mt-1 leading-relaxed">System will automatically ingest, summarize, and categorize uploaded intel for cross-mission referencing.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default KnowledgeBaseView;

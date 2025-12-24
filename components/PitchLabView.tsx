
import React, { useState, useEffect } from 'react';
import { Contact, Company, PitchScript } from '../types';
import { PlayIcon, SpinnerIcon, SparklesIcon, ChevronRightIcon, UserIcon, VideoIcon, StarIcon, CheckCircleIcon, XIcon } from './ui/icons';
import { generatePitchScript, generateOutreachVideo } from '../services/geminiService';

interface PitchLabViewProps {
  contacts: Contact[];
  companies: Company[];
}

const PitchLabView: React.FC<PitchLabViewProps> = ({ contacts, companies }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [script, setScript] = useState<PitchScript | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [vibe, setVibe] = useState('Cinematic Tech');

  useEffect(() => {
    const checkApiKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkApiKey();
  }, []);

  const handleGenerateScript = async () => {
    if (!selectedContact) return;
    setIsGeneratingScript(true);
    setScript(null);
    try {
      const company = companies.find(c => c.name === selectedContact.companyName);
      const data = await generatePitchScript(selectedContact, company);
      setScript(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!hasApiKey) {
        await (window as any).aistudio.openSelectKey();
        setHasApiKey(true);
        return;
    }

    setIsGeneratingVideo(true);
    setVideoUrl(null);
    try {
      const company = companies.find(c => c.name === selectedContact?.companyName);
      const prompt = `A cinematic, slow-moving drone shot of a futuristic ${company?.industry || 'Modern Office'} headquarters, ${vibe} lighting, high detail, 720p.`;
      const url = await generateOutreachVideo(prompt);
      setVideoUrl(url);
    } catch (err) {
        if (err.message.includes("Requested entity was not found")) {
            setHasApiKey(false);
            alert("API Key session expired. Please re-select your paid GCP project key.");
        }
        console.error(err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="glass p-10 border-2 border-white/10 shadow-glass-brutalist relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-2xl">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Outreach Studio</h2>
                <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mt-2">Generate hyper-personalized video payloads. Turn cold prospects into warm allies.</p>
            </div>
            <div className="bg-brand-primary/10 border-2 border-brand-primary/30 p-4 flex items-center gap-4">
                <VideoIcon className="w-8 h-8 text-brand-primary" />
                <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Render Capacity</p>
                    <p className="text-sm font-black text-brand-primary uppercase">Veo 3.1 Fast Enabled</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Step 1: Identity Selection */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-black p-8 border-4 border-black shadow-brutalist h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-brand-secondary text-gray-900 font-black flex items-center justify-center border-2 border-black">1</div>
                    <h3 className="text-white font-black uppercase tracking-tighter text-xl">Target Identity</h3>
                </div>

                <div className="space-y-6 flex-grow">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Prospect Node</label>
                        <select 
                            value={selectedContact?.id || ''}
                            onChange={(e) => {
                                setSelectedContact(contacts.find(c => c.id === e.target.value) || null);
                                setScript(null);
                                setVideoUrl(null);
                            }}
                            className="w-full bg-gray-900 text-white border-2 border-black py-4 px-4 text-xs font-black uppercase outline-none focus:shadow-brutalist transition-all"
                        >
                            <option value="">-- SELECT TARGET --</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>)}
                        </select>
                    </div>

                    {selectedContact && (
                        <div className="glass p-6 border-2 border-black shadow-brutalist-sm animate-fade-in">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-800 border-2 border-black flex items-center justify-center text-brand-secondary font-black">
                                    {selectedContact.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase">{selectedContact.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{selectedContact.title}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] text-brand-accent font-black uppercase">
                                    <StarIcon className="w-3 h-3" />
                                    <span>Lead Score: {selectedContact.leadScore}/100</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    <span>Intel Enrichment: Complete</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    disabled={!selectedContact || isGeneratingScript}
                    onClick={handleGenerateScript}
                    className="w-full mt-10 bg-brand-secondary brutalist-button text-gray-900 font-black py-5 uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isGeneratingScript ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
                    Architect Script
                </button>
            </div>
        </div>

        {/* Step 2 & 3: Script and Preview */}
        <div className="lg:col-span-2 space-y-10">
            {script ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Script View */}
                    <div className="glass p-8 border-2 border-brand-primary/30 shadow-glass-brutalist animate-fade-in flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-brand-primary text-white font-black flex items-center justify-center border-2 border-black shadow-brutalist-sm">2</div>
                            <h3 className="text-white font-black uppercase tracking-tighter text-xl">Tactical Script</h3>
                        </div>

                        <div className="flex-grow space-y-6">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest">THE HOOK</span>
                                <p className="text-sm font-bold text-white leading-relaxed italic border-l-4 border-brand-secondary pl-4">"{script.hook}"</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">THE VALUE</span>
                                <p className="text-sm font-bold text-white leading-relaxed italic border-l-4 border-brand-primary pl-4">"{script.valueProp}"</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">THE CLOSE</span>
                                <p className="text-sm font-bold text-white leading-relaxed italic border-l-4 border-brand-accent pl-4">"{script.callToAction}"</p>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t-2 border-black/20">
                            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Production Vibe</label>
                            <div className="flex flex-wrap gap-2">
                                {['Cinematic Tech', 'Noir Corporate', 'Sun-drenched Startup', 'Cyberpunk Blue'].map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => setVibe(v)}
                                        className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 border-black transition-all ${vibe === v ? 'bg-brand-primary text-white shadow-brutalist-sm' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Video Studio View */}
                    <div className="bg-black border-4 border-black shadow-brutalist flex flex-col h-full relative overflow-hidden animate-fade-in">
                        {/* Status Overlays */}
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                             <div className="px-3 py-1 bg-red-600 border border-black text-[9px] font-black uppercase tracking-widest animate-pulse">REC</div>
                             <div className="px-3 py-1 bg-gray-900/80 border border-black text-[9px] font-black uppercase tracking-widest text-gray-400">4K UPSCALE READY</div>
                        </div>

                        <div className="flex-grow flex items-center justify-center bg-gray-900 relative">
                            {isGeneratingVideo ? (
                                <div className="text-center p-10 space-y-6">
                                    <div className="w-20 h-20 bg-brand-primary/20 border-4 border-brand-primary shadow-brutalist flex items-center justify-center mx-auto animate-pulse">
                                        <SpinnerIcon className="w-10 h-10 text-white animate-spin" />
                                    </div>
                                    <h3 className="text-white font-black text-xl uppercase tracking-tighter animate-bounce">Synthesizing Backdrop...</h3>
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest max-w-xs">Veo API is rendering your industry cinematic assets. Est. 30-60s.</p>
                                </div>
                            ) : videoUrl ? (
                                <div className="w-full h-full relative group">
                                    <video 
                                        src={videoUrl} 
                                        autoPlay 
                                        loop 
                                        muted 
                                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                                    />
                                    {/* Teleprompter Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 pointer-events-none">
                                        <div className="bg-black/80 backdrop-blur-md p-6 border-l-4 border-brand-primary shadow-brutalist-sm max-h-48 overflow-y-auto custom-scrollbar scroll-animate">
                                            <p className="text-lg font-black text-white uppercase leading-tight tracking-tighter">
                                                {script.fullText}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-10 space-y-6">
                                    <div className="w-20 h-20 bg-gray-800 border-4 border-black shadow-brutalist flex items-center justify-center mx-auto opacity-50">
                                        <VideoIcon className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Awaiting backdrop generation</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-900 border-t-2 border-black">
                            <button 
                                onClick={handleGenerateVideo}
                                disabled={isGeneratingVideo}
                                className="w-full bg-brand-primary brutalist-button text-white font-black py-4 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                            >
                                {!hasApiKey ? 'Connect GCP Key' : isGeneratingVideo ? 'Encoding...' : 'Deploy Backdrop (Veo)'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 glass border-4 border-dashed border-gray-700 rounded-none shadow-glass-brutalist">
                    <div className="w-24 h-24 bg-gray-800 border-2 border-black shadow-brutalist flex items-center justify-center mb-8">
                        <StarIcon className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-gray-500 font-black text-3xl uppercase tracking-tighter">Studio Idle</h3>
                    <p className="text-gray-600 max-w-sm mt-4 font-bold uppercase tracking-widest text-xs">Identify a target and architect a custom script to unlock the production studio.</p>
                </div>
            )}
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .scroll-animate {
            animation: scrollText 20s linear infinite;
        }
        @keyframes scrollText {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
};

export default PitchLabView;

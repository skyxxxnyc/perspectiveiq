
import React, { useState, useCallback } from 'react';
import { LocationMarkerIcon, SpinnerIcon, SparklesIcon, SearchIcon, ChevronRightIcon, PlayIcon } from './ui/icons';
import { scoutTerritory } from '../services/geminiService';

const TerritoryView: React.FC = () => {
  const [scoutQuery, setScoutQuery] = useState('New York, NY');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutResult, setScoutResult] = useState<{ text: string, grounding: any[] } | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleScout = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsScouting(true);
    setScoutResult(null);

    try {
      let lat, lng;
      if (useCurrentLocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      const result = await scoutTerritory(scoutQuery, lat, lng);
      setScoutResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScouting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="glass p-10 rounded-none border-2 border-white/10 shadow-glass-brutalist relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex-grow space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Territory Radar</h2>
                <p className="text-gray-400 text-lg font-bold uppercase tracking-widest max-w-2xl">Geospatial Intelligence Engine. Identify high-density B2B clusters for immediate operational deployment.</p>
                
                <form onSubmit={handleScout} className="flex flex-col md:flex-row gap-4 mt-8">
                    <div className="relative flex-grow">
                        <LocationMarkerIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary w-6 h-6" />
                        <input 
                            type="text" 
                            value={scoutQuery}
                            onChange={(e) => {
                                setScoutQuery(e.target.value);
                                setUseCurrentLocation(false);
                            }}
                            placeholder="ENTER TARGET ZIP, CITY, OR COORDS..."
                            className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-4 pl-14 pr-6 text-sm font-black outline-none focus:shadow-brutalist transition-all placeholder:text-gray-700"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={() => { setUseCurrentLocation(true); setScoutQuery('MY CURRENT POSITION'); }}
                        className={`p-4 border-2 border-black font-black uppercase text-[10px] tracking-widest transition-all ${useCurrentLocation ? 'bg-brand-secondary text-gray-900 shadow-brutalist' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        GPS Pin
                    </button>
                    <button 
                        type="submit" 
                        disabled={isScouting}
                        className="bg-brand-primary brutalist-button text-white px-10 py-4 rounded-none font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        {isScouting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <PlayIcon className="w-5 h-5" />}
                        Scout Zone
                    </button>
                </form>
            </div>

            <div className="hidden lg:block">
                <div className="w-48 h-48 bg-black border-4 border-brand-primary rounded-full relative flex items-center justify-center shadow-brutalist overflow-hidden">
                    <div className={`absolute inset-0 bg-[conic-gradient(from_0deg,#6366F1,transparent)] opacity-20 ${isScouting ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 border border-brand-primary/20 rounded-full animate-ping"></div>
                        <div className="w-16 h-16 border border-brand-primary/40 rounded-full animate-ping delay-75"></div>
                    </div>
                    <LocationMarkerIcon className="w-10 h-10 text-brand-secondary relative z-10" />
                </div>
            </div>
        </div>
      </div>

      {scoutResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Tactical Briefing */}
            <div className="lg:col-span-2 space-y-8">
                <div className="glass p-8 border-2 border-brand-secondary/30 rounded-none shadow-glass-brutalist">
                    <h3 className="text-brand-secondary font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        Operational Analysis (Grounded)
                    </h3>
                    <div className="text-gray-200 leading-relaxed font-bold text-lg whitespace-pre-wrap italic">
                        {scoutResult.text}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scoutResult.grounding.map((item, idx) => (
                        <div key={idx} className="glass border-2 border-black p-6 shadow-brutalist-sm flex flex-col justify-between group hover:translate-y-[-2px] transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-gray-800 border-2 border-black text-brand-secondary">
                                        <LocationMarkerIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest border border-gray-700 px-2 py-0.5">Verified Node</span>
                                </div>
                                <h4 className="text-white font-black text-lg uppercase tracking-tight mb-2 truncate">
                                    {item.maps?.title || item.web?.title || 'Unknown Asset'}
                                </h4>
                            </div>
                            <a 
                                href={item.maps?.uri || item.web?.uri} 
                                target="_blank" 
                                className="mt-6 flex items-center justify-center gap-2 bg-brand-primary text-white py-3 font-black uppercase text-[10px] tracking-widest border-2 border-black shadow-brutalist-sm hover:shadow-brutalist transition-all"
                            >
                                Navigate to Intel
                                <ChevronRightIcon className="w-4 h-4" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Territory Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-black p-8 border-4 border-black shadow-brutalist">
                    <h4 className="text-white font-black uppercase tracking-tighter text-xl mb-4">Territory Health</h4>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                                <span>Density Rating</span>
                                <span>High</span>
                            </div>
                            <div className="h-4 bg-gray-900 border-2 border-black">
                                <div className="h-full bg-brand-accent w-[85%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                                <span>Operational Friction</span>
                                <span>Low</span>
                            </div>
                            <div className="h-4 bg-gray-900 border-2 border-black">
                                <div className="h-full bg-brand-secondary w-[20%]"></div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-10 bg-brand-primary brutalist-button text-white font-black py-4 uppercase tracking-widest text-xs">
                        Generate Route Map
                    </button>
                </div>

                <div className="glass border-2 border-dashed border-gray-700 p-8 text-center">
                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Scout more zones to compare strategic saturation across the mission globe.</p>
                </div>
            </div>
        </div>
      )}

      {isScouting && (
        <div className="h-96 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-brand-primary/20 border-4 border-brand-primary shadow-brutalist flex items-center justify-center mb-6 animate-pulse">
                <SpinnerIcon className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter animate-bounce">Scanning Grid...</h3>
            <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] mt-2">Connecting to Google Maps Grounding Nodes</p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}</style>
    </div>
  );
};

export default TerritoryView;

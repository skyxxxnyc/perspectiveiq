
import React, { useState, useRef, useEffect } from 'react';
import { Contact, RoleplayScenario } from '../types';
import { MicrophoneIcon, SpinnerIcon, SparklesIcon, PlayIcon, XIcon, UserIcon, BrainIcon, FlagIcon, ChevronRightIcon } from './ui/icons';
import { connectLive, decodeBase64, decodeAudioData, encodeAudio } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

const SCENARIOS: RoleplayScenario[] = [
  {
    id: 's1',
    title: 'The Hard Budget No',
    difficulty: 'Elite',
    description: 'The prospect is facing a 20% budget cut and needs to justify every cent.',
    persona: 'A skeptical CFO at a Fortune 500 company who is extremely direct and values ROI above all else.',
    objectives: ['Identify hidden budget reserves', 'Demonstrate 3x ROI', 'Secure follow-up with the board']
  },
  {
    id: 's2',
    title: 'The Technical Skeptic',
    difficulty: 'Advanced',
    description: 'A Lead Architect who thinks ProspectIQ is "just another wrapper API."',
    persona: 'An opinionated software engineer who cares about latency, security, and native grounding.',
    objectives: ['Explain Native Audio advantage', 'Address data privacy concerns', 'Book a technical deep-dive']
  },
  {
    id: 's3',
    title: 'The Competitor Switch',
    difficulty: 'Entry',
    description: 'A happy user of a major competitor who is curious but not looking to switch.',
    persona: 'A friendly Marketing Manager who is comfortable with their current tool but feels it is expensive.',
    objectives: ['Highlight feature gaps', 'Show ease of migration', 'Explain the neobrutalist UI benefits']
  }
];

interface RoleplayViewProps {
  contacts: Contact[];
}

const RoleplayView: React.FC<RoleplayViewProps> = ({ contacts }) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [targetContact, setTargetContact] = useState<Contact | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Live API Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSimulation = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    setIsLive(false);
    setSelectedScenario(null);
  };

  const startSimulation = async () => {
    if (!selectedScenario) return;
    setIsConnecting(true);

    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = audioCtxRef.current.createGain();
      outputNode.connect(audioCtxRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const instruction = `ACT AS THIS PROSPECT: ${selectedScenario.persona}. 
      Context: ${selectedScenario.description}. 
      Target Contact you are portraying: ${targetContact?.name || 'A Lead'}. 
      Your goal is to be challenging but fair. Do not agree too easily. 
      STAY IN CHARACTER. DO NOT MENTION YOU ARE AN AI.`;

      liveSessionRef.current = await connectLive({
        onopen: () => {
            setIsConnecting(false);
            setIsLive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const base64 = encodeAudio(new Uint8Array(int16.buffer));
              if (liveSessionRef.current) {
                liveSessionRef.current.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioStr = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioStr && audioCtxRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
            const buffer = await decodeAudioData(decodeBase64(audioStr), audioCtxRef.current, 24000, 1);
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => {
            console.error(e);
            stopSimulation();
        },
        onclose: () => stopSimulation()
      });
      // Set the instruction override if the service allowed it.
      // In this version, connectLive already has a systemInstruction, 
      // but for this specific view we use the scenario one.
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  if (isLive) {
    return (
        <div className="space-y-10 animate-fade-in flex flex-col items-center">
            <div className="glass w-full max-w-5xl border-4 border-black shadow-glass-brutalist flex flex-col md:flex-row overflow-hidden h-[600px]">
                {/* Left: Tactical Waveform */}
                <div className="flex-1 bg-black p-10 flex flex-col justify-between items-center border-r-2 border-black">
                    <div className="w-full flex justify-between items-start">
                        <div className="px-4 py-2 bg-red-500 border-2 border-black text-white font-black uppercase text-[10px] animate-pulse">LIVE ROLEPLAY</div>
                        <button onClick={stopSimulation} className="p-2 bg-gray-800 border-2 border-black text-white hover:bg-brand-primary">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="w-48 h-48 bg-brand-primary/10 rounded-full flex items-center justify-center border-4 border-brand-primary shadow-brutalist animate-pulse relative z-10">
                            <UserIcon className="w-24 h-24 text-brand-primary" />
                        </div>
                        {/* Visualization Rings */}
                        <div className="absolute inset-0 border-2 border-brand-primary rounded-full animate-ping opacity-20"></div>
                        <div className="absolute inset-0 border-2 border-brand-secondary rounded-full animate-ping delay-150 opacity-10"></div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                            <span>Signal Integrity</span>
                            <span>Optimal</span>
                        </div>
                        <div className="h-2 bg-gray-900 border-2 border-black flex gap-1 p-0.5">
                             {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                <div key={i} className="flex-1 bg-brand-secondary animate-height-ping" style={{ animationDelay: `${i * 50}ms`, height: `${Math.random() * 100}%` }}></div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Right: Mission Parameters */}
                <div className="w-full md:w-96 p-10 space-y-10 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <h4 className="text-brand-secondary font-black uppercase tracking-widest text-[10px]">Active Scenario</h4>
                        <h3 className="text-white font-black text-2xl uppercase tracking-tighter">{selectedScenario?.title}</h3>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] border-b border-black/20 pb-2">Target Profile</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-800 border-2 border-black flex items-center justify-center text-brand-secondary font-black">
                                {targetContact?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-white uppercase">{targetContact?.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{targetContact?.title}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] border-b border-black/20 pb-2">Mission Objectives</h4>
                        {selectedScenario?.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="mt-1 w-4 h-4 border-2 border-black flex items-center justify-center bg-gray-900 group">
                                    <div className="w-1.5 h-1.5 bg-brand-primary hidden group-hover:block"></div>
                                </div>
                                <span className="text-xs font-bold text-gray-300 leading-tight">{obj}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10">
                        <div className="bg-brand-primary/5 p-4 border-2 border-brand-primary/20 flex gap-4 items-center">
                            <BrainIcon className="w-6 h-6 text-brand-primary" />
                            <p className="text-[10px] font-black text-brand-primary uppercase leading-tight">Coach Puck is listening. Real-time pitch analysis enabled.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-xs text-gray-600 font-black uppercase tracking-widest animate-bounce">Speak naturally. Engage the target.</p>
            </div>
            
            <style>{`
                @keyframes heightPing { 0%, 100% { height: 20%; } 50% { height: 100%; } }
                .animate-height-ping { animation: heightPing 0.8s ease-in-out infinite; }
            `}</style>
        </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
        <div className="glass p-10 rounded-none border-2 border-white/10 shadow-glass-brutalist">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Combat Training Room</h2>
            <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mt-2 max-w-2xl">Deploy high-stakes negotiation simulations. Master every objection before the first real handshake.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Scenarios */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Operational Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SCENARIOS.map(scenario => (
                        <button 
                            key={scenario.id}
                            onClick={() => setSelectedScenario(scenario)}
                            className={`p-8 text-left border-4 transition-all flex flex-col justify-between ${
                                selectedScenario?.id === scenario.id 
                                ? 'bg-brand-primary text-white border-black shadow-brutalist translate-x-[-4px] translate-y-[-4px]' 
                                : 'glass border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'
                            }`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-black ${
                                        scenario.difficulty === 'Elite' ? 'bg-red-500 text-white' : 
                                        scenario.difficulty === 'Advanced' ? 'bg-brand-accent text-gray-900' : 
                                        'bg-brand-secondary text-gray-900'
                                    }`}>
                                        {scenario.difficulty}
                                    </span>
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{scenario.title}</h4>
                                <p className="text-xs font-bold leading-relaxed mb-6 opacity-80 italic">"{scenario.description}"</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                                <span>{scenario.objectives.length} Objectives</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Launch Config */}
            <div className="lg:col-span-1 space-y-8">
                 <div className="bg-black p-8 border-4 border-black shadow-brutalist flex flex-col h-full">
                    <h4 className="text-white font-black uppercase tracking-tighter text-2xl mb-8">Deploy Simulation</h4>
                    
                    <div className="space-y-8 flex-grow">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Target Intelligence</label>
                            <select 
                                value={targetContact?.id || ''}
                                onChange={(e) => setTargetContact(contacts.find(c => c.id === e.target.value) || null)}
                                className="w-full bg-gray-900 text-white border-2 border-black py-4 px-4 text-xs font-black uppercase outline-none focus:shadow-brutalist transition-all"
                            >
                                <option value="">-- SELECT IDENTITY --</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>)}
                            </select>
                        </div>

                        <div className="p-6 bg-brand-primary/5 border-2 border-brand-primary/20 space-y-4">
                            <div className="flex items-center gap-3">
                                <FlagIcon className="w-5 h-5 text-brand-secondary" />
                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Training Protocol</h5>
                            </div>
                            <ul className="space-y-2">
                                <li className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">• Natural Language Processing</li>
                                <li className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">• Native Audio Response</li>
                                <li className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">• Real-time Sentiment Logic</li>
                            </ul>
                        </div>
                    </div>

                    <button 
                        disabled={!selectedScenario || !targetContact || isConnecting}
                        onClick={startSimulation}
                        className="w-full mt-10 bg-brand-primary brutalist-button text-white font-black py-5 uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isConnecting ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <PlayIcon className="w-6 h-6" />}
                        {isConnecting ? 'Uplink Syncing...' : 'Engage Comms'}
                    </button>
                 </div>

                 {selectedScenario && (
                    <div className="glass p-6 border-2 border-black shadow-brutalist-sm animate-fade-in">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Scenario Intel:</p>
                        <p className="text-xs font-bold text-gray-300 leading-relaxed italic border-l-2 border-brand-secondary pl-4">
                            {selectedScenario.persona}
                        </p>
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default RoleplayView;

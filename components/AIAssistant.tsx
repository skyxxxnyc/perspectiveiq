
import React, { useState, useEffect, useRef } from 'react';
import { ChatIcon, XIcon, SendIcon, MicrophoneIcon, SpinnerIcon, SparklesIcon, VolumeUpIcon } from './ui/icons';
import { createChat, connectLive, decodeBase64, decodeAudioData, encodeAudio } from '../services/geminiService';
import { GenerateContentResponse, LiveServerMessage } from '@google/genai';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'live'>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Ready for deep tactical support. What mission are we on today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Live API Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Chat instance
  const chatRef = useRef<any>(null);
  if (!chatRef.current) {
    chatRef.current = createChat("You are a high-performance sales strategist for thesolopreneur.app. Your persona is direct, data-driven, and highly tactical. No fluff.");
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startLiveCoaching = async () => {
    setMode('live');
    setIsLiveActive(true);
    
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = audioCtxRef.current.createGain();
    outputNode.connect(audioCtxRef.current.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    liveSessionRef.current = await connectLive({
      onopen: () => {
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
      onerror: (e) => console.error("Live Error", e),
      onclose: () => setIsLiveActive(false)
    });
  };

  const stopLiveCoaching = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    setIsLiveActive(false);
    setMode('chat');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="glass w-96 h-[600px] rounded-none shadow-glass-brutalist border-2 border-black flex flex-col mb-4 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-black border-b-2 border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-brand-primary border border-black shadow-brutalist-sm">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-white uppercase tracking-tighter text-sm">IQ Tactician</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => mode === 'chat' ? startLiveCoaching() : stopLiveCoaching()}
                className={`p-2 border-2 border-black shadow-brutalist-sm active:shadow-none transition-all ${mode === 'live' ? 'bg-red-500 text-white' : 'bg-gray-800 text-brand-secondary hover:bg-gray-700'}`}
                title={mode === 'chat' ? "Live Comms" : "Text Comms"}
              >
                <MicrophoneIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-white hover:bg-gray-700">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-900/40">
            {mode === 'chat' ? (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-4 text-xs font-bold leading-relaxed border-2 border-black shadow-brutalist-sm ${
                      m.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-none' 
                      : 'bg-white text-gray-900 rounded-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 p-4 border-2 border-black shadow-brutalist-sm flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
                <div className="relative">
                  <div className="w-32 h-32 bg-brand-secondary/20 rounded-none flex items-center justify-center border-4 border-black shadow-brutalist animate-pulse">
                    <MicrophoneIcon className="w-16 h-16 text-brand-secondary" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Live Sync Active</h4>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto">Voice coaching enabled. Puck is analyzing your strategy input.</p>
                </div>
                <div className="flex items-center gap-2 h-16">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className={`w-2 bg-brand-secondary border border-black shadow-brutalist-sm animate-height-ping`} style={{ animationDelay: `${i * 100}ms` }}></div>
                  ))}
                </div>
                <button 
                  onClick={stopLiveCoaching}
                  className="bg-red-500 brutalist-button text-white px-8 py-3 rounded-none font-black uppercase tracking-widest"
                >
                  Cut Comms
                </button>
              </div>
            )}
          </div>

          {/* Footer (Chat Only) */}
          {mode === 'chat' && (
            <form onSubmit={handleSendMessage} className="p-4 bg-black border-t-2 border-white/10 flex gap-3">
              <input 
                type="text" 
                placeholder="INPUT MISSION PARAMETERS..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-gray-900 text-white text-xs font-black border-2 border-black rounded-none px-4 py-3 outline-none focus:border-brand-primary focus:shadow-brutalist transition-all"
              />
              <button 
                type="submit" 
                className="p-3 bg-brand-secondary brutalist-button text-gray-900 rounded-none"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 bg-brand-primary brutalist-button text-white rounded-none flex items-center justify-center transition-all hover:scale-105 group relative"
      >
        {isOpen ? <XIcon className="w-10 h-10" /> : <ChatIcon className="w-10 h-10" />}
        {!isOpen && (
           <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-accent border-2 border-black shadow-brutalist-sm animate-bounce flex items-center justify-center">
                <span className="text-[10px] font-black text-gray-900">!</span>
           </div>
        )}
      </button>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @keyframes heightPing { 0%, 100% { height: 10px; } 50% { height: 60px; } }
        .animate-height-ping { animation: heightPing 0.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AIAssistant;

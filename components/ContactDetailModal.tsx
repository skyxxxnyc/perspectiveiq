
import React, { useState, useEffect } from 'react';
import { Contact, ContactStatus, Task, Deal, PipelineStage, Company, Sequence, Priority } from '../types';
import { XIcon, MailIcon, LocationMarkerIcon, LinkedInIcon, CompaniesIcon, PencilIcon, TasksIcon, CheckCircleIcon, PlusIcon, DollarSignIcon, SendIcon, UserIcon, FlagIcon, SparklesIcon, SpinnerIcon, CalendarIcon } from './ui/icons';
import { analyzeLeadScore } from '../services/geminiService';

interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
  onViewCompany: (companyName: string) => void;
  tasks: Task[];
  deals: Deal[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (taskData: Omit<Task, 'id' | 'completed'>) => void;
  onAddDeal: (dealData: Omit<Deal, 'id' | 'stage' | 'createdAt'>) => void;
  companies: Company[];
  companyLogos: Record<string, string>;
  onAddToSequence: (contact: Contact) => void;
  sequences: Sequence[];
}

type ModalTab = 'details' | 'activity';

const statusColors: Record<ContactStatus, string> = {
    [ContactStatus.New]: 'bg-indigo-500',
    [ContactStatus.Contacted]: 'bg-cyan-500',
    [ContactStatus.Replied]: 'bg-brand-accent',
    [ContactStatus.MeetingBooked]: 'bg-brand-primary',
    [ContactStatus.NotInterested]: 'bg-red-500',
};

const stageColors: Record<PipelineStage, string> = {
    [PipelineStage.New]: 'bg-gray-500',
    [PipelineStage.Discovery]: 'bg-indigo-500',
    [PipelineStage.Proposal]: 'bg-cyan-500',
    [PipelineStage.Negotiation]: 'bg-brand-primary',
    [PipelineStage.ClosedWon]: 'bg-brand-accent',
    [PipelineStage.ClosedLost]: 'bg-red-500',
};

const priorityColors: Record<Priority, string> = {
  [Priority.High]: 'text-red-400',
  [Priority.Medium]: 'text-cyan-400',
  [Priority.Low]: 'text-gray-400',
};

const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-brand-accent border-brand-accent';
    if (score >= 40) return 'text-cyan-400 border-cyan-400';
    return 'text-red-400 border-red-400';
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-6 h-6 text-gray-500 mt-1">{icon}</div>
        <div className="ml-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-white uppercase tracking-tighter">{value}</p>
        </div>
    </div>
);

const ActivityItem: React.FC<{icon: React.ReactNode, title: string, subtitle: string, time: string, children?: React.ReactNode}> = ({icon, title, subtitle, time, children}) => (
    <div className="flex gap-4 group">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 glass border-2 border-black shadow-brutalist-sm flex items-center justify-center flex-shrink-0 text-white z-10">
                {icon}
            </div>
            <div className="w-0.5 h-full bg-black/20 group-last:hidden mt-2"></div>
        </div>
        <div className="flex-grow pb-8">
            <div className="flex justify-between items-baseline mb-1">
                <p className="text-xs font-black text-white uppercase tracking-widest">{title}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase">{time}</p>
            </div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-tight mb-2">{subtitle}</p>
            {children && (
                <div className="p-4 glass border-2 border-black shadow-brutalist-sm text-xs font-bold text-gray-300 leading-relaxed italic">
                    {children}
                </div>
            )}
        </div>
    </div>
);

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, onClose, onViewCompany, tasks, deals, onToggleTask, onAddTask, onAddDeal, companies, companyLogos, onAddToSequence, sequences }) => {
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('details');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(contact.scoreAnalysis || '');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealValue, setNewDealValue] = useState('');
  const [newDealPriority, setNewDealPriority] = useState<'Medium' | 'High' | 'Low'>('Medium');
  const [newDealCloseDate, setNewDealCloseDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
  
  const company = companies.find(c => c.name === contact.companyName);
  const logoUrl = company ? companyLogos[company.id] : undefined;
  const enrolledSequence = contact.enrolledInSequenceId ? sequences.find(s => s.id === contact.enrolledInSequenceId) : null;

  useEffect(() => {
    const storedNote = localStorage.getItem(`prospectiq-note-${contact.id}`);
    if (storedNote) {
      setNote(storedNote);
    } else {
      setNote('');
    }
    setIsSaved(false);
    setAnalysis(contact.scoreAnalysis || '');
  }, [contact.id, contact.scoreAnalysis]);

  const handleAnalyzeScore = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeLeadScore(contact);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNote = () => {
    localStorage.setItem(`prospectiq-note-${contact.id}`, note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
        title: newTaskTitle.trim(),
        dueDate: newTaskDueDate,
        contactId: contact.id,
        priority: Priority.Medium,
        subtasks: []
    });
    setNewTaskTitle('');
  };

  const handleQuickFollowUp = () => {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 3);
    onAddTask({
        title: `Priority Follow-up: ${contact.name}`,
        dueDate: followUpDate.toISOString().split('T')[0],
        contactId: contact.id,
        priority: Priority.High,
        subtasks: []
    });
  };

  const handleAddDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim() || !newDealValue) return;
    onAddDeal({
        title: newDealTitle.trim(),
        value: Number(newDealValue),
        priority: newDealPriority,
        expectedCloseDate: newDealCloseDate,
        contactId: contact.id,
        companyName: contact.companyName,
    });
    setNewDealTitle('');
    setNewDealValue('');
    setIsAddingDeal(false);
  };

  const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const renderDetails = () => (
      <>
        <div className="p-6 space-y-8">
            {/* Lead Vitality Card */}
            <div className="glass border-2 border-black shadow-brutalist p-6 flex items-center gap-6 relative overflow-hidden group">
                <div className="flex-shrink-0 relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={213.6}
                            strokeDashoffset={213.6 - (213.6 * (contact.leadScore || 0)) / 100}
                            className={`${getScoreColor(contact.leadScore || 0)} transition-all duration-1000`} 
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black text-white">{contact.leadScore || '-'}</span>
                    </div>
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Lead Vitality Index</h4>
                        <button 
                            onClick={handleAnalyzeScore}
                            disabled={isAnalyzing}
                            className="bg-brand-primary brutalist-button text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest disabled:opacity-50"
                        >
                            {isAnalyzing ? <SpinnerIcon className="w-2.5 h-2.5" /> : <SparklesIcon className="w-2.5 h-2.5" />}
                            Run AI Scan
                        </button>
                    </div>
                    {isAnalyzing ? (
                        <div className="mt-3 space-y-2">
                            <div className="h-2 bg-gray-700 rounded w-full animate-pulse"></div>
                            <div className="h-2 bg-gray-700 rounded w-4/5 animate-pulse"></div>
                        </div>
                    ) : (
                        <p className="text-xs font-bold text-gray-300 mt-2 leading-relaxed italic border-l-2 border-brand-primary pl-3">
                            {analysis || "Awaiting intelligence scan. Execute 'Run AI Scan' to evaluate conversion potential."}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <DetailItem icon={<MailIcon className="w-5 h-5"/>} label="Secure Email" value={<a href={`mailto:${contact.email}`} className="text-brand-secondary hover:text-white transition-colors">{contact.email}</a>}/>
                <DetailItem icon={<LocationMarkerIcon className="w-5 h-5"/>} label="Geography" value={contact.location}/>
                <DetailItem icon={<CompaniesIcon className="w-5 h-5"/>} label="Organization" value={<button onClick={() => onViewCompany(contact.companyName)} className="text-brand-primary hover:underline">{contact.companyName}</button>}/>
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Stage</p>
                    <span className={`px-4 py-1.5 inline-flex text-[10px] font-black border-2 border-black shadow-brutalist-sm uppercase tracking-widest ${statusColors[contact.status]} text-white`}>{contact.status}</span>
                </div>
            </div>
        </div>
        
        {/* Sequence Section */}
        <div className="px-6 pb-8 border-t-2 border-black pt-8">
            <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-cyan-400">
                        <SendIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Campaign Sequence</h3>
                </div>
                {!enrolledSequence && (
                     <button onClick={() => onAddToSequence(contact)} className="bg-brand-secondary brutalist-button text-gray-900 text-[10px] font-black px-4 py-2 uppercase tracking-widest">
                        + Enroll
                    </button>
                )}
            </div>
            {enrolledSequence ? (
                <div className="p-4 glass border-2 border-black shadow-brutalist-sm flex justify-between items-center">
                    <div>
                        <p className="font-black text-white uppercase text-sm tracking-tighter">{enrolledSequence.name}</p>
                        <p className="text-[10px] text-brand-secondary font-black uppercase mt-1">Active Step: {contact.currentSequenceStep} / {enrolledSequence.steps.length}</p>
                    </div>
                    <div className="h-2 w-24 bg-gray-900 border border-black overflow-hidden">
                        <div className="h-full bg-brand-primary" style={{ width: `${(contact.currentSequenceStep || 1) / enrolledSequence.steps.length * 100}%` }}></div>
                    </div>
                </div>
            ) : (
                 <p className="text-xs text-gray-600 font-black uppercase tracking-widest text-center py-4 glass border-2 border-dashed border-gray-700">Not assigned to outreach</p>
            )}
        </div>
        
        {/* Deals Section */}
        <div className="px-6 pb-8 border-t-2 border-black pt-8">
            <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-brand-accent">
                        <DollarSignIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Sales Pipeline ({deals.length})</h3>
                </div>
                {!isAddingDeal && (
                    <button onClick={() => setIsAddingDeal(true)} className="bg-brand-accent brutalist-button text-gray-900 text-[10px] font-black px-4 py-2 uppercase tracking-widest">
                        + New Deal
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {deals.length > 0 ? (
                    deals.map(deal => (
                        <div key={deal.id} className="flex justify-between items-center p-4 glass border-2 border-black shadow-brutalist-sm hover:translate-x-1 transition-transform cursor-pointer">
                            <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight">{deal.title}</p>
                                <span className={`mt-2 px-3 py-0.5 inline-flex text-[10px] font-black border-2 border-black uppercase tracking-widest ${stageColors[deal.stage]} text-white`}>
                                    {deal.stage}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-brand-accent tracking-tighter">{currencyFormatter.format(deal.value)}</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase mt-1">Priority: {deal.priority}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    !isAddingDeal && <p className="text-xs text-gray-600 font-black uppercase tracking-widest text-center py-4">No active opportunities</p>
                )}
            </div>
        </div>

        {/* Tasks Section */}
        <div className="px-6 pb-8 border-t-2 border-black pt-8">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-white">
                    <TasksIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest ml-3">Mission Checklist ({tasks.length})</h3>
            </div>
            <div className="space-y-3 mb-6">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className="flex items-center p-4 glass border-2 border-black shadow-brutalist-sm transition-all">
                            <button onClick={() => onToggleTask(task.id)} className="mr-4">
                                <CheckCircleIcon completed={task.completed} className={`w-8 h-8 ${task.completed ? 'text-brand-accent' : 'text-gray-700 hover:text-white'} transition-colors`} />
                            </button>
                            <div className="flex-1">
                                <span className={`text-sm font-black uppercase tracking-tighter block ${task.completed ? 'text-gray-600 line-through' : 'text-white'}`}>{task.title}</span>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-[10px] font-black text-gray-500 uppercase">DUE: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${priorityColors[task.priority]}`}>
                                        <FlagIcon className="w-3 h-3" /> {task.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                 ) : (
                    <p className="text-xs text-gray-600 font-black uppercase tracking-widest text-center py-4">No pending operations</p>
                 )}
            </div>
            <form onSubmit={handleAddTaskSubmit} className="pt-6 border-t-2 border-black flex items-center gap-4">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="ENTER NEW OBJECTIVE..."
                    className="flex-grow bg-gray-900 text-white border-2 border-black rounded-none py-3 px-4 text-xs font-black uppercase focus:shadow-brutalist outline-none transition-all placeholder:text-gray-700"
                    required
                />
                <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="bg-gray-900 text-white border-2 border-black rounded-none py-3 px-4 text-xs font-black uppercase focus:shadow-brutalist outline-none transition-all"
                    required
                />
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        onClick={handleQuickFollowUp}
                        className="p-3 bg-brand-secondary brutalist-button text-gray-900 flex items-center gap-2 group relative" 
                    >
                        <CalendarIcon className="w-6 h-6" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[8px] font-black px-2 py-1 uppercase whitespace-nowrap shadow-brutalist-sm">Follow-up (3d)</span>
                    </button>
                    <button type="submit" className="p-3 bg-brand-primary brutalist-button text-white" aria-label="Add Task">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </form>
        </div>
        
        {/* Notes Section - Hidden when activity is active, or we could keep it for details */}
        <div className="px-6 pb-8 border-t-2 border-black pt-8">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-brand-secondary">
                    <PencilIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest ml-3">Strategic Intelligence</h3>
            </div>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="INPUT DEEP NOTES..."
                className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-4 px-4 text-xs font-bold leading-relaxed focus:shadow-brutalist outline-none transition-all placeholder:text-gray-700"
            />
            <div className="mt-4 flex justify-end items-center h-8">
                {isSaved && <span className="text-brand-accent text-[10px] font-black uppercase mr-4 animate-bounce">INTEL SAVED</span>}
                <button onClick={handleSaveNote} className="bg-brand-secondary brutalist-button text-gray-900 font-black py-2 px-8 uppercase text-xs tracking-widest">Commit Note</button>
            </div>
        </div>
      </>
  );

  const renderActivity = () => (
      <div className="p-8 space-y-10 bg-gray-900/40">
         {/* Chronological Activity Feed */}
         <div className="flex flex-col">
            <ActivityItem 
                icon={<MailIcon className="w-6 h-6"/>}
                title="Response Transmitted"
                subtitle={`Channel: Email to ${contact.name}`}
                time="2 days ago"
            >
                <p className="font-black mb-1 uppercase tracking-tighter">RE: Q4 PLATFORM ARCHITECTURE</p>
                <p>Confirming availability for the technical deep-dive. Scaling concerns addressed in the updated whitepaper attached.</p>
            </ActivityItem>

            {note && (
                <ActivityItem 
                    icon={<PencilIcon className="w-6 h-6"/>}
                    title="Intel Logged"
                    subtitle="System: Internal Repository"
                    time="Recent Update"
                >
                    <p className="font-bold text-brand-primary uppercase tracking-tighter mb-1">LOCAL INTELLIGENCE OVERRIDE:</p>
                    {note}
                </ActivityItem>
            )}

            <ActivityItem 
                icon={<UserIcon className="w-6 h-6"/>}
                title="Operational Status Shift"
                subtitle="Entity Migration"
                time="3 days ago"
            >
                <p>Account shifted from <span className="text-indigo-400 font-black uppercase">Contacted</span> to <span className="text-brand-accent font-black uppercase">Replied</span>. Engagement triggers verified.</p>
            </ActivityItem>

            <ActivityItem 
                icon={<MailIcon className="w-6 h-6"/>}
                title="Inbound Intel Received"
                subtitle={`Identity: ${contact.name}`}
                time="4 days ago"
            >
                <p className="font-black mb-1 uppercase tracking-tighter text-cyan-400">INCOMING RE: QUICK QUERY</p>
                <p>"The proposal looks solid. I need to clear the technical compliance audit with our security lead before we sign. Can you provide SOC2 reports?"</p>
            </ActivityItem>

            <ActivityItem 
                icon={<SparklesIcon className="w-6 h-6"/>}
                title="Intelligence Scanned"
                subtitle="AI Lead Scoring Engine"
                time="5 days ago"
            >
                <p>Score validated at {contact.leadScore}/100 based on seniority and company growth signals. High-value target status confirmed.</p>
            </ActivityItem>
         </div>
         
         <div className="flex justify-center pt-6 border-t border-white/5">
            <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                Load Full Historical Log
            </button>
         </div>
      </div>
  );

  return (
    <div 
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 transition-opacity duration-300 backdrop-blur-sm p-4"
        onClick={onClose}
    >
      <div 
        className="glass border-4 border-black shadow-brutalist w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b-2 border-black flex justify-between items-start flex-shrink-0 bg-gray-900/50">
          <div className="flex items-center">
            <div className="relative">
                <img className="h-20 w-20 rounded-none border-2 border-black shadow-brutalist-sm" src={`https://i.pravatar.cc/150?u=${contact.email}`} alt={contact.name} />
                <div className={`absolute -bottom-2 -right-2 w-6 h-6 border-2 border-black shadow-brutalist-sm ${statusColors[contact.status]}`}></div>
            </div>
            <div className="ml-6">
              <h2 id="modal-title" className="text-3xl font-black text-white uppercase tracking-tighter">{contact.name}</h2>
              <div className="flex items-center mt-2">
                {logoUrl && (
                  <div className="bg-white p-1 border border-black mr-3">
                    <img src={`data:image/png;base64,${logoUrl}`} alt={`${contact.companyName} logo`} className="h-4 w-4" />
                  </div>
                )}
                <p className="text-xs font-black text-cyan-400 uppercase tracking-widest">{contact.title} @ {contact.companyName}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-white hover:bg-gray-700 transition-all">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="border-b-2 border-black px-8 bg-gray-900/30">
            <nav className="flex space-x-10">
                <button 
                    onClick={() => setActiveTab('details')} 
                    className={`py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'details' ? 'border-b-4 border-brand-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Mission Data
                </button>
                <button 
                    onClick={() => setActiveTab('activity')} 
                    className={`py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'activity' ? 'border-b-4 border-brand-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Activity Log
                </button>
            </nav>
        </div>

        <div className="overflow-y-auto custom-scrollbar">
            {activeTab === 'details' ? renderDetails() : renderActivity()}
        </div>

        <div className="p-8 bg-black border-t-2 border-black flex-shrink-0 flex gap-4">
            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center bg-indigo-600 brutalist-button text-white font-black py-4 uppercase tracking-widest text-xs">
                <LinkedInIcon className="w-5 h-5 mr-3" />
                Network Intel
            </a>
            <button className="flex-1 flex items-center justify-center bg-brand-secondary brutalist-button text-gray-900 font-black py-4 uppercase tracking-widest text-xs">
                <MailIcon className="w-5 h-5 mr-3" />
                Transmit Comms
            </button>
        </div>
      </div>
       <style>{`
          @keyframes fade-in-scale {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        `}</style>
    </div>
  );
};

export default ContactDetailModal;

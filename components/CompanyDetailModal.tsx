
import React, { useState, useEffect, useRef } from 'react';
import { Company, Contact, Deal, Task, PipelineStage, ContactStatus, Priority } from '../types';
import { XIcon, CompaniesIcon, LocationMarkerIcon, TasksIcon, DollarSignIcon, FileIcon, PencilIcon, UserIcon, CheckCircleIcon, PlusIcon, DownloadIcon, SparklesIcon, SpinnerIcon, FlagIcon, FolderIcon } from './ui/icons';

interface CompanyDetailModalProps {
  company: Company;
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  logo?: string;
  onClose: () => void;
  onViewCompany: (companyName: string) => void;
  onGenerateLogo: (companyId: string, companyName: string, companyIndustry: string) => Promise<void>;
  onEnrichCompany: (companyId: string, companyName: string, companyIndustry: string) => Promise<void>;
  onViewContact: (contact: Contact) => void;
}

type ModalTab = 'overview' | 'contacts' | 'deals' | 'tasks' | 'notes' | 'files';

const statusColors: Record<ContactStatus, string> = {
    [ContactStatus.New]: 'bg-blue-500',
    [ContactStatus.Contacted]: 'bg-yellow-500',
    [ContactStatus.Replied]: 'bg-green-500',
    [ContactStatus.MeetingBooked]: 'bg-purple-500',
    [ContactStatus.NotInterested]: 'bg-red-500',
};

const stageColors: Record<PipelineStage, string> = {
    [PipelineStage.New]: 'bg-gray-500',
    [PipelineStage.Discovery]: 'bg-blue-500',
    [PipelineStage.Proposal]: 'bg-yellow-500',
    [PipelineStage.Negotiation]: 'bg-purple-500',
    [PipelineStage.ClosedWon]: 'bg-green-500',
    [PipelineStage.ClosedLost]: 'bg-red-500',
};

const priorityColors: Record<Priority, string> = {
  [Priority.High]: 'text-red-400',
  [Priority.Medium]: 'text-yellow-400',
  [Priority.Low]: 'text-green-400',
};

const INITIAL_MOCK_FILES = [
    { id: 'f1', name: 'Master Services Agreement.pdf', size: '2.4 MB', date: '2023-10-15' },
    { id: 'f2', name: 'Q3 Business Review.pptx', size: '5.1 MB', date: '2023-11-02' },
    { id: 'f3', name: 'Pricing Proposal v2.pdf', size: '1.2 MB', date: '2023-12-10' },
    { id: 'f4', name: 'Company Profile.pdf', size: '0.8 MB', date: '2023-09-01' },
];

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, contacts, deals, tasks, logo, onClose, onGenerateLogo, onEnrichCompany, onViewContact }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [companyFiles, setCompanyFiles] = useState(INITIAL_MOCK_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedNote = localStorage.getItem(`prospectiq-company-note-${company.id}`);
    if (storedNote) {
      setNote(storedNote);
    } else {
      setNote('');
    }
    setIsSaved(false);
    
    // Load company specific files if any were "uploaded" in this session
    const sessionFiles = sessionStorage.getItem(`prospectiq-company-files-${company.id}`);
    if (sessionFiles) {
        setCompanyFiles(JSON.parse(sessionFiles));
    } else {
        setCompanyFiles(INITIAL_MOCK_FILES);
    }
  }, [company.id]);

  const handleSaveNote = () => {
    localStorage.setItem(`prospectiq-company-note-${company.id}`, note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleGenerateLogoClick = async () => {
      setIsGeneratingLogo(true);
      try {
        await onGenerateLogo(company.id, company.name, company.industry);
      } catch (e) {
        // error handled in parent
      } finally {
        setIsGeneratingLogo(false);
      }
  }

  const handleEnrichClick = async () => {
      setIsEnriching(true);
      try {
          await onEnrichCompany(company.id, company.name, company.industry);
      } catch (e) {
          // error handled in parent
      } finally {
          setIsEnriching(false);
      }
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFilesList = Array.from(files).map(file => ({
        id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0]
    }));

    const updatedFiles = [...newFilesList, ...companyFiles];
    setCompanyFiles(updatedFiles);
    sessionStorage.setItem(`prospectiq-company-files-${company.id}`, JSON.stringify(updatedFiles));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const renderOverview = () => (
    <div className="space-y-6">
        {/* AI Enrichment Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
                <button 
                    onClick={handleEnrichClick}
                    disabled={isEnriching}
                    className="flex items-center gap-2 bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-all border border-brand-primary/30"
                >
                    {isEnriching ? <SpinnerIcon className="w-3.5 h-3.5" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                    {company.enrichment ? 'Refresh Insights' : 'Enrich with AI'}
                </button>
            </div>
            
            <div className="flex items-center gap-2 text-brand-secondary mb-6">
                <SparklesIcon className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-widest">AI Intelligence Profile</h4>
            </div>

            {company.enrichment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/50">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-1">Funding Stage</p>
                                <p className="text-sm text-white font-semibold">{company.enrichment.funding}</p>
                            </div>
                            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/50">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-1">Est. Revenue</p>
                                <p className="text-sm text-green-400 font-semibold">{company.enrichment.estimatedRevenue}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-2">Recent News & Signals</p>
                            <div className="bg-brand-primary/5 border-l-2 border-brand-primary p-3 text-sm text-gray-300 italic">
                                "{company.enrichment.recentNews}"
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-2">Technology Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {company.enrichment.techStack?.map((tech, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-gray-700 text-brand-primary text-[11px] rounded-md border border-gray-600 font-medium">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                        <SparklesIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">Click 'Enrich with AI' to fetch deep funding data, news, and tech stack information for this account.</p>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Basic Information</h4>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Industry</span>
                        <span className="text-white text-sm">{company.industry}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Size</span>
                        <span className="text-white text-sm">{company.size}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Location</span>
                        <span className="text-white text-sm">{company.location}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Website</span>
                        <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline text-sm">{company.website}</a>
                    </div>
                </div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">About</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{company.description}</p>
            </div>
        </div>
        
        <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Recent Activity</h4>
            <div className="space-y-4">
                {contacts.slice(0, 1).map(contact => (
                    <div key={contact.id} className="flex gap-3 items-start">
                        <div className="mt-1">
                             <UserIcon className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-white"><span className="font-semibold">You</span> added <span className="font-semibold">{contact.name}</span> as a contact.</p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                    </div>
                ))}
                 <div className="flex gap-3 items-start">
                    <div className="mt-1">
                            <TasksIcon className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm text-white">Task created: <span className="italic">"Quarterly Review"</span></p>
                        <p className="text-xs text-gray-500">5 days ago</p>
                    </div>
                </div>
                 <div className="flex gap-3 items-start">
                    <div className="mt-1">
                            <DollarSignIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-white">New deal opportunity identified: <span className="font-semibold">Q4 Expansion</span></p>
                        <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderContacts = () => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {contacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                                <img className="h-8 w-8 rounded-full" src={`https://i.pravatar.cc/150?u=${contact.email}`} alt="" />
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-white">{contact.name}</div>
                                    <div className="text-xs text-gray-400">{contact.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{contact.title}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[contact.status]} text-white`}>
                                {contact.status}
                            </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => onViewContact(contact)} className="text-brand-primary hover:text-brand-secondary">View</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {contacts.length === 0 && <p className="p-4 text-center text-gray-500 text-sm">No contacts found for this company.</p>}
    </div>
  );

  const renderDeals = () => (
      <div className="space-y-3">
          {deals.map(deal => (
            <div key={deal.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-white">{deal.title}</h4>
                    <div className="flex items-center mt-1 space-x-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${stageColors[deal.stage]} text-white`}>{deal.stage}</span>
                        <span className="text-xs text-gray-400">Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{currencyFormatter.format(deal.value)}</p>
                    <p className="text-xs text-gray-400">{deal.priority} Priority</p>
                </div>
            </div>
          ))}
          {deals.length === 0 && <p className="text-center text-gray-500 py-4">No deals associated with this company.</p>}
      </div>
  );

  const renderTasks = () => (
      <div className="space-y-2">
          {tasks.map(task => (
              <div key={task.id} className="flex items-center bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <CheckCircleIcon completed={task.completed} className={`w-5 h-5 mr-3 flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-gray-500'}`} />
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <p className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</p>
                        <FlagIcon className={`w-3 h-3 ${priorityColors[task.priority]}`} />
                    </div>
                    <p className="text-xs text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    {task.subtasks && task.subtasks.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</p>
                    )}
                </div>
                {task.contactId && (
                    <div className="ml-2 flex items-center text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        <UserIcon className="w-3 h-3 mr-1" />
                        {contacts.find(c => c.id === task.contactId)?.name || 'Unknown'}
                    </div>
                )}
              </div>
          ))}
           {tasks.length === 0 && <p className="text-center text-gray-500 py-4">No tasks found.</p>}
      </div>
  );

  const renderFiles = () => (
      <div className="space-y-8">
          <div 
            className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
                isDragging 
                ? 'border-brand-primary bg-brand-primary/10 scale-[0.99] shadow-inner' 
                : 'border-gray-700 bg-gray-900/30 hover:border-brand-primary/60 hover:bg-gray-900/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileInputChange}
              />
              <div className={`p-5 rounded-full mb-5 transition-all duration-300 ${isDragging ? 'bg-brand-primary text-white scale-110 shadow-lg' : 'bg-gray-800 text-brand-primary'}`}>
                {isDragging ? <FolderIcon className="w-12 h-12 animate-pulse" /> : <PlusIcon className="w-12 h-12" />}
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-base font-black text-white uppercase tracking-tighter">
                  {isDragging ? 'Release to upload intel' : 'Deploy strategic assets'}
                </p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                  {isDragging ? 'Engaging uplink...' : 'Click or drag files to the mission dropzone'}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-black border border-indigo-500/30">PDF</span>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-black border border-cyan-500/30">PPTX</span>
                        <span className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-[9px] font-black border border-brand-primary/30">DOCX</span>
                    </div>
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Accepted Manifests</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-white text-xs font-black">10 MB</span>
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Payload Limit</span>
                </div>
              </div>
              
              {isDragging && (
                  <div className="absolute inset-0 bg-brand-primary/5 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10 animate-fade-in">
                      <div className="bg-brand-primary border-2 border-black text-white px-8 py-4 shadow-brutalist flex items-center gap-3">
                          <PlusIcon className="w-6 h-6" />
                          <span className="font-black uppercase tracking-widest text-sm">Commit Payload</span>
                      </div>
                  </div>
              )}
          </div>

          <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Asset Archive</h4>
                  <span className="text-[10px] text-brand-secondary font-black uppercase">{companyFiles.length} Documents</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companyFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-900/50 p-4 border-2 border-black shadow-brutalist-sm hover:translate-x-1 transition-all group cursor-pointer">
                        <div className="flex items-center min-w-0">
                            <div className="p-2 bg-gray-800 border border-black mr-4 group-hover:bg-brand-primary transition-colors">
                                <FileIcon className="w-6 h-6 text-brand-primary group-hover:text-white" />
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-black text-white uppercase tracking-tight truncate">{file.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{file.size} • {file.date}</p>
                            </div>
                        </div>
                        <button className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 transition-all ml-2" title="Download Asset">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
              </div>
              {companyFiles.length === 0 && (
                  <div className="text-center py-12 glass border-2 border-dashed border-gray-800">
                      <p className="text-gray-600 font-black uppercase tracking-widest text-xs italic">Asset archive currently empty.</p>
                  </div>
              )}
          </div>
      </div>
  );

  const renderNotes = () => (
      <div className="space-y-4">
          <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={8}
                placeholder="INPUT STRATEGIC OVERRIDE NOTES..."
                className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-4 px-4 text-xs font-bold leading-relaxed focus:shadow-brutalist outline-none transition-all placeholder:text-gray-700"
            />
            <div className="flex justify-end items-center">
                {isSaved && <span className="text-brand-accent text-[10px] font-black uppercase mr-4 animate-bounce">INTEL SAVED</span>}
                <button onClick={handleSaveNote} className="bg-brand-secondary brutalist-button text-gray-900 font-black py-2 px-8 uppercase text-xs tracking-widest">
                    Commit Note
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
            className="glass border-4 border-black shadow-brutalist w-full max-w-4xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
        >
            <div className="p-8 border-b-2 border-black flex justify-between items-start flex-shrink-0 bg-gray-900/50">
                <div className="flex items-center">
                    <div className="h-20 w-20 bg-gray-800 border-2 border-black shadow-brutalist-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                         {logo ? (
                            <img src={`data:image/png;base64,${logo}`} alt={`${company.name} logo`} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-3xl font-black text-white">{company.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="ml-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{company.name}</h2>
                            {!logo && (
                                <button 
                                    onClick={handleGenerateLogoClick}
                                    disabled={isGeneratingLogo}
                                    className="p-1.5 bg-gray-800 border border-black hover:bg-brand-primary text-brand-secondary hover:text-white transition-all disabled:opacity-50 shadow-brutalist-sm"
                                    title="Generate AI Branding"
                                >
                                    {isGeneratingLogo ? <SpinnerIcon className="w-3.5 h-3.5" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center mt-2 text-gray-500 text-xs font-black uppercase tracking-widest space-x-6">
                             <div className="flex items-center">
                                <CompaniesIcon className="w-4 h-4 mr-2 text-brand-secondary" />
                                {company.industry}
                             </div>
                             <div className="flex items-center">
                                <LocationMarkerIcon className="w-4 h-4 mr-2 text-brand-secondary" />
                                {company.location}
                             </div>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-white hover:bg-gray-700 transition-all">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="border-b-2 border-black px-8 bg-gray-900/30">
                <nav className="flex space-x-10 overflow-x-auto no-scrollbar">
                    {(['overview', 'contacts', 'deals', 'tasks', 'files', 'notes'] as ModalTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-5 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest transition-all ${
                                activeTab === tab
                                ? 'border-brand-primary text-white'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab}
                            {tab === 'contacts' && <span className="ml-3 bg-gray-800 border border-black text-brand-secondary py-0.5 px-2 shadow-brutalist-sm">{contacts.length}</span>}
                            {tab === 'deals' && deals.length > 0 && <span className="ml-3 bg-gray-800 border border-black text-brand-accent py-0.5 px-2 shadow-brutalist-sm">{deals.length}</span>}
                             {tab === 'tasks' && tasks.filter(t => !t.completed).length > 0 && <span className="ml-3 bg-gray-800 border border-black text-red-400 py-0.5 px-2 shadow-brutalist-sm">{tasks.filter(t => !t.completed).length}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-8 overflow-y-auto flex-grow bg-gray-800/50 custom-scrollbar">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'contacts' && renderContacts()}
                {activeTab === 'deals' && renderDeals()}
                {activeTab === 'tasks' && renderTasks()}
                {activeTab === 'files' && renderFiles()}
                {activeTab === 'notes' && renderNotes()}
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

export default CompanyDetailModal;


import React, { useState, useEffect } from 'react';
import { Task, Contact, Priority, Company, Subtask, Project, ProjectTemplate, ProjectTemplateStep } from '../types';
import { CheckCircleIcon, UserIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon, SpinnerIcon, PlusIcon, CompaniesIcon, FlagIcon, FileIcon, BookOpenIcon, XIcon } from './ui/icons';
import { generateSubtasks } from '../services/geminiService';
import { MOCK_PROJECT_TEMPLATES } from '../constants';

interface TasksViewProps {
  tasks: Task[];
  contacts: Contact[];
  companies: Company[];
  projects: Project[];
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onLaunchProject: (template: ProjectTemplate, targetId: string, targetType: 'contact' | 'company') => void;
}

const priorityColors: Record<Priority, string> = {
  [Priority.High]: 'text-red-400',
  [Priority.Medium]: 'text-yellow-400',
  [Priority.Low]: 'text-green-400',
};

const TaskItem: React.FC<{ 
    task: Task; 
    contactName?: string; 
    companyName?: string;
    onToggle: () => void; 
    onToggleSubtask: (subId: string) => void;
}> = ({ task, contactName, companyName, onToggle, onToggleSubtask }) => {
    const [expanded, setExpanded] = useState(false);

    const completedSubtasks = task.subtasks.filter(s => s.completed).length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <div className="bg-gray-800 rounded-lg hover:bg-gray-800/80 transition-all border border-gray-700/50 shadow-sm">
            <div className="p-4 flex items-start gap-4">
                <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="mt-1 flex-shrink-0">
                    <CheckCircleIcon completed={task.completed} className={`w-6 h-6 ${task.completed ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'}`} />
                </button>
                
                <div className="flex-grow cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <div className="flex justify-between items-start">
                        <div>
                             <h3 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</h3>
                             {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{task.description}</p>}
                        </div>
                        <div className={`flex items-center space-x-2 ${priorityColors[task.priority]}`}>
                            <FlagIcon className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                         <span className="bg-gray-700/50 px-2 py-1 rounded text-gray-300 font-bold uppercase tracking-wider">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        
                        {contactName && (
                            <div className="flex items-center text-brand-secondary font-bold uppercase tracking-tighter">
                                <UserIcon className="w-3 h-3 mr-1"/>
                                <span>{contactName}</span>
                            </div>
                        )}
                        
                        {companyName && (
                            <div className="flex items-center text-cyan-400 font-bold uppercase tracking-tighter">
                                <CompaniesIcon className="w-3 h-3 mr-1"/>
                                <span>{companyName}</span>
                            </div>
                        )}
                    </div>

                    {totalSubtasks > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex-grow h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-400">{completedSubtasks}/{totalSubtasks}</span>
                        </div>
                    )}
                </div>

                <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-white">
                    {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
            </div>

            {expanded && (
                <div className="px-4 pb-4 pl-14 border-t border-gray-700/50 pt-3 bg-gray-900/30">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Subtasks</h4>
                    <div className="space-y-2">
                        {task.subtasks.length > 0 ? (
                             task.subtasks.map(st => (
                                <div key={st.id} className="flex items-center gap-3">
                                    <button onClick={() => onToggleSubtask(st.id)}>
                                         <div className={`w-4 h-4 rounded border ${st.completed ? 'bg-brand-primary border-brand-primary' : 'border-gray-500 hover:border-gray-300'} flex items-center justify-center`}>
                                            {st.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                         </div>
                                    </button>
                                    <span className={`text-sm ${st.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{st.title}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 italic">No subtasks defined.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TemplateGallery: React.FC<{
  onSelect: (template: ProjectTemplate) => void;
}> = ({ onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {MOCK_PROJECT_TEMPLATES.map(template => (
      <button 
        key={template.id}
        onClick={() => onSelect(template)}
        className="glass p-6 text-left border-2 border-white/10 shadow-glass-brutalist hover:shadow-brutalist hover:translate-y-[-2px] transition-all group"
      >
        <div className="p-3 bg-brand-primary/20 border border-brand-primary w-fit mb-4">
          <BookOpenIcon className="w-6 h-6 text-brand-primary" />
        </div>
        <h4 className="text-white font-black uppercase tracking-tighter text-lg">{template.name}</h4>
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{template.description}</p>
        <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase text-brand-secondary tracking-widest">
          <span>{template.steps.length} Phases</span>
          <span className="group-hover:translate-x-1 transition-transform">Apply Plan &rarr;</span>
        </div>
      </button>
    ))}
  </div>
);

const TasksView: React.FC<TasksViewProps> = ({ tasks, contacts, companies, projects, onAddTask, onToggleTask, onToggleSubtask, onLaunchProject }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates' | 'active-projects'>('tasks');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [editableSteps, setEditableSteps] = useState<ProjectTemplateStep[]>([]);
  const [projectTargetType, setProjectTargetType] = useState<'contact' | 'company'>('company');
  const [projectTargetId, setProjectTargetId] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [relatedToType, setRelatedToType] = useState<'contact' | 'company'>('contact');
  const [relatedId, setRelatedId] = useState<string>('');
  const [generatedSubtasks, setGeneratedSubtasks] = useState<{title: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (selectedTemplate) {
      setEditableSteps([...selectedTemplate.steps]);
    } else {
      setEditableSteps([]);
    }
  }, [selectedTemplate]);

  const handleAiGenerate = async () => {
      if (!title) return;
      setIsGenerating(true);
      try {
          const subtasks = await generateSubtasks(title, description);
          setGeneratedSubtasks(subtasks.map(t => ({ title: t })));
      } catch (e) {
          console.error("Failed to generate subtasks");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleLaunchSubmit = () => {
    if (selectedTemplate && projectTargetId) {
      const modifiedTemplate = {
        ...selectedTemplate,
        steps: editableSteps
      };
      onLaunchProject(modifiedTemplate, projectTargetId, projectTargetType);
      setSelectedTemplate(null);
      setProjectTargetId('');
      setActiveTab('active-projects');
    }
  };

  const handleStepChange = (index: number, field: keyof ProjectTemplateStep, value: any) => {
    const updated = [...editableSteps];
    updated[index] = { ...updated[index], [field]: value };
    setEditableSteps(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const subtasks: Subtask[] = generatedSubtasks
        .filter(st => st.title.trim() !== '')
        .map((st, idx) => ({
            id: `new-st-${Date.now()}-${idx}`,
            title: st.title,
            completed: false
        }));

    onAddTask({
        title,
        description,
        dueDate,
        priority,
        contactId: relatedToType === 'contact' && relatedId ? relatedId : undefined,
        companyId: relatedToType === 'company' && relatedId ? relatedId : undefined,
        subtasks
    });

    setTitle('');
    setDescription('');
    setGeneratedSubtasks([]);
    setRelatedId('');
  };

  const contactMap = contacts.reduce((acc, c) => ({...acc, [c.id]: c.name}), {} as Record<string, string>);
  const companyMap = companies.reduce((acc, c) => ({...acc, [c.id]: c.name}), {} as Record<string, string>);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-black/20 gap-8">
        {[
          { id: 'tasks', label: 'Single Tasks' },
          { id: 'templates', label: 'Playbook Library' },
          { id: 'active-projects', label: 'Active Blueprints' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'border-b-4 border-brand-primary text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && (
        <div className="space-y-8">
          <div className="glass p-8 border-2 border-white/10 shadow-glass-brutalist">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Templates</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Pre-built playbooks for complex account management.</p>
          </div>
          <TemplateGallery onSelect={setSelectedTemplate} />
        </div>
      )}

      {activeTab === 'active-projects' && (
        <div className="space-y-6">
          <div className="glass p-8 border-2 border-white/10 shadow-glass-brutalist mb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Active Blueprints</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Tracking multi-step sales operations.</p>
          </div>
          {projects.length === 0 ? (
            <div className="glass border-4 border-dashed border-gray-700 p-20 text-center">
              <p className="text-gray-500 font-black uppercase tracking-widest">No projects currently instantiated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const completedCount = projectTasks.filter(t => t.completed).length;
                const totalCount = projectTasks.length;
                const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                
                return (
                  <div key={project.id} className="glass p-6 border-2 border-white/10 shadow-glass-brutalist flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-brand-primary text-white border border-black shadow-brutalist-sm">ACTIVE</span>
                        <h4 className="text-white font-black text-lg uppercase tracking-tight">{project.name}</h4>
                      </div>
                      <div className="flex gap-4 mt-3">
                         {project.companyId && (
                            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">{companyMap[project.companyId]}</span>
                         )}
                         <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Start: {new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="md:w-64">
                       <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{completedCount} / {totalCount}</span>
                       </div>
                       <div className="h-2 bg-gray-900 border border-black rounded-none overflow-hidden">
                          <div className="h-full bg-brand-accent transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-8">
          <div className="glass p-8 border-2 border-white/10 shadow-glass-brutalist">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-brand-secondary" />
              AI Project Planner
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Describe a sales mission and let AI map the milestones.</p>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Objective</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Finalize Partnership Agreement" className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-3 px-4 focus:shadow-brutalist outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Contextual Intelligence</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Provide details for better AI decomposition..." className="w-full bg-gray-900 text-white border-2 border-black rounded-none py-3 px-4 focus:shadow-brutalist outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={handleAiGenerate} disabled={!title || isGenerating} className="bg-brand-secondary brutalist-button text-gray-900 font-black py-3 px-6 uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                      {isGenerating ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                      Generate Phases
                    </button>
                    <button type="submit" className="bg-brand-primary brutalist-button text-white font-black py-3 px-6 uppercase text-xs tracking-widest">
                      Create Project
                    </button>
                  </div>
                </div>

                <div className="glass bg-black/40 border-2 border-white/5 p-6 flex flex-col">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Milestone Preview</h4>
                  <div className="flex-grow space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {generatedSubtasks.length === 0 ? (
                      <p className="text-gray-700 font-black uppercase italic text-center py-10">No milestones defined yet.</p>
                    ) : (
                      generatedSubtasks.map((st, i) => (
                        <div key={i} className="flex gap-3 items-center border-b border-white/5 pb-2">
                           <span className="text-brand-secondary font-black text-[10px]">{i+1}.</span>
                           <span className="text-white text-xs font-bold">{st.title}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Pending Operations</h3>
            <div className="grid grid-cols-1 gap-3">
              {incompleteTasks.length > 0 ? (
                incompleteTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    contactName={task.contactId ? contactMap[task.contactId] : undefined} 
                    companyName={task.companyId ? companyMap[task.companyId] : undefined}
                    onToggle={() => onToggleTask(task.id)} 
                    onToggleSubtask={(subId) => onToggleSubtask(task.id, subId)}
                  />
                ))
              ) : (
                <div className="text-center py-12 glass border-2 border-dashed border-gray-800">
                  <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Clear skies. No pending tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Launcher Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-6 animate-fade-in" onClick={() => setSelectedTemplate(null)}>
          <div className="glass w-full max-w-2xl border-4 border-black shadow-brutalist flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b-2 border-black flex justify-between items-start bg-gray-900/50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-primary border-2 border-black shadow-brutalist-sm">
                    <BookOpenIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Instantiate Blueprint</h3>
                    <p className="text-brand-secondary font-black uppercase tracking-widest text-[10px]">Playbook ID: {selectedTemplate.id}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedTemplate(null)} className="p-2 bg-gray-800 border-2 border-black shadow-brutalist-sm text-white hover:bg-gray-700 transition-all">
                  <XIcon className="w-6 h-6" />
               </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div className="bg-brand-primary/5 p-6 border-2 border-brand-primary/20">
                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{selectedTemplate.name}</h4>
                <p className="text-sm text-gray-400 font-medium leading-relaxed italic border-l-4 border-brand-primary pl-4">{selectedTemplate.description}</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Operational Objective Target</label>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setProjectTargetType('company')} className={`flex-1 py-3 text-[10px] font-black border-2 border-black uppercase tracking-widest transition-all ${projectTargetType === 'company' ? 'bg-brand-primary text-white shadow-brutalist' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Target Company</button>
                  <button onClick={() => setProjectTargetType('contact')} className={`flex-1 py-3 text-[10px] font-black border-2 border-black uppercase tracking-widest transition-all ${projectTargetType === 'contact' ? 'bg-brand-primary text-white shadow-brutalist' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Target Contact</button>
                </div>
                <select 
                  value={projectTargetId} 
                  onChange={e => setProjectTargetId(e.target.value)}
                  className="w-full bg-gray-900 text-white border-2 border-black py-4 px-4 text-sm font-black uppercase outline-none focus:shadow-brutalist transition-all"
                >
                  <option value="">-- IDENTIFY TARGET --</option>
                  {projectTargetType === 'company' 
                    ? companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    : contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
              </div>

              <div className="glass border-2 border-white/10 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Blueprint Configuration</h4>
                    <span className="text-[10px] text-brand-secondary font-black uppercase">Phase Count: {editableSteps.length}</span>
                </div>
                <div className="space-y-4">
                  {editableSteps.map((step, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-900/50 border border-black group">
                      <div className="flex-grow">
                        <p className="text-xs font-black text-white uppercase tracking-tight mb-2">{step.title}</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-black uppercase">Priority:</span>
                                <select 
                                    value={step.priority}
                                    onChange={(e) => handleStepChange(i, 'priority', e.target.value as Priority)}
                                    className={`bg-gray-800 text-[10px] font-black border-2 border-black px-2 py-1 rounded-none outline-none focus:border-brand-primary ${priorityColors[step.priority]}`}
                                >
                                    <option value={Priority.High}>High</option>
                                    <option value={Priority.Medium}>Medium</option>
                                    <option value={Priority.Low}>Low</option>
                                </select>
                            </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[9px] text-gray-500 font-black uppercase mb-1">Schedule Offset</span>
                        <div className="flex items-center gap-2">
                             <input 
                                type="number" 
                                value={step.dayOffset} 
                                onChange={(e) => handleStepChange(i, 'dayOffset', parseInt(e.target.value) || 0)}
                                className="w-16 bg-gray-800 text-brand-secondary text-xs font-black border-2 border-black px-2 py-1 outline-none focus:border-brand-primary text-center"
                             />
                             <span className="text-[10px] font-black text-gray-400 uppercase">Days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-black border-t-2 border-black flex-shrink-0">
                <button 
                  onClick={handleLaunchSubmit}
                  disabled={!projectTargetId}
                  className="w-full bg-brand-primary brutalist-button text-white font-black py-5 uppercase tracking-widest disabled:opacity-50 text-sm flex items-center justify-center gap-3"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Initialize Operation
                </button>
                <p className="text-[9px] text-gray-600 font-black text-center mt-4 uppercase tracking-widest">Confirmation of blueprints deployment will generate {editableSteps.length} individual tasks across the mission timeline.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;

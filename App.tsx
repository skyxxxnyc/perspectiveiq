
import React, { useState, useCallback, useEffect } from 'react';
import { View, Contact, Company, Task, Deal, PipelineStage, Sequence, Priority, Project, ProjectTemplate } from './types';
import { db } from './services/db';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SearchView from './components/SearchView';
import ContactsList from './components/ContactsList';
import CompaniesList from './components/CompaniesList';
import ContactDetailModal from './components/ContactDetailModal';
import CompanyDetailModal from './components/CompanyDetailModal';
import TasksView from './components/TasksView';
import PipelineView from './components/PipelineView';
import IntegrationsView from './components/IntegrationsView';
import SequencesView from './components/SequencesView';
import AddToSequenceModal from './components/AddToSequenceModal';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import TerritoryView from './components/TerritoryView';
import RoleplayView from './components/RoleplayView';
import PitchLabView from './components/PitchLabView';
import AIAssistant from './components/AIAssistant';
import { generateCompanyLogo, enrichCompany } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  
  // Initial state from Database
  const [contacts, setContacts] = useState<Contact[]>(db.getContacts());
  const [companies, setCompanies] = useState<Company[]>(db.getCompanies());
  const [tasks, setTasks] = useState<Task[]>(db.getTasks());
  const [deals, setDeals] = useState<Deal[]>(db.getDeals());
  const [sequences, setSequences] = useState<Sequence[]>(db.getSequences());
  const [projects, setProjects] = useState<Project[]>(db.getProjects());
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [contactToSequence, setContactToSequence] = useState<Contact | null>(null);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});

  // Sync state to Database on changes
  useEffect(() => db.saveContacts(contacts), [contacts]);
  useEffect(() => db.saveCompanies(companies), [companies]);
  useEffect(() => db.saveTasks(tasks), [tasks]);
  useEffect(() => db.saveDeals(deals), [deals]);
  useEffect(() => db.saveSequences(sequences), [sequences]);
  useEffect(() => db.saveProjects(projects), [projects]);

  const addProspects = useCallback((newContacts: Contact[], newCompanies: Company[]) => {
    setContacts(prev => [...prev, ...newContacts.filter(nc => !prev.some(c => c.email === nc.email))]);
    setCompanies(prev => [...prev, ...newCompanies.filter(nco => !prev.some(c => c.name === nco.name))]);
    setCurrentView(View.Contacts);
  }, []);

  const handleLaunchProject = (template: ProjectTemplate, targetId: string, targetType: 'contact' | 'company') => {
    const projectId = `p${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      name: `${template.name} - ${targetType === 'contact' ? contacts.find(c => c.id === targetId)?.name : companies.find(c => c.id === targetId)?.name}`,
      templateId: template.id,
      startDate: new Date().toISOString(),
      status: 'Active',
      contactId: targetType === 'contact' ? targetId : undefined,
      companyId: targetType === 'company' ? targetId : undefined,
    };

    const newTasks: Task[] = template.steps.map((step, idx) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + step.dayOffset);
      return {
        id: `t-p-${projectId}-${idx}`,
        title: step.title,
        completed: false,
        priority: step.priority,
        projectId: projectId,
        contactId: newProject.contactId,
        companyId: newProject.companyId,
        dueDate: dueDate.toISOString().split('T')[0],
        subtasks: [],
      };
    });

    setProjects(prev => [...prev, newProject]);
    setTasks(prev => [...newTasks, ...prev]);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedContact(null);
    setSelectedCompany(company);
  };
  
  const handleViewCompanyByName = (companyName: string) => {
      const company = companies.find(c => c.name === companyName);
      if (company) {
          setSelectedContact(null);
          setSelectedCompany(company);
      } else {
          console.warn(`Company ${companyName} not found.`);
      }
  };

  const handleEnrichCompany = async (companyId: string, companyName: string, companyIndustry: string) => {
    try {
        const enrichment = await enrichCompany(companyName, companyIndustry);
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, enrichment } : c));
        if (selectedCompany?.id === companyId) {
            setSelectedCompany(prev => prev ? { ...prev, enrichment } : prev);
        }
    } catch (error) {
        console.error("Enrichment failed in App:", error);
        throw error;
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      description: '',
      priority: Priority.Medium,
      subtasks: [],
      ...taskData,
      id: `t${Date.now()}`,
      completed: false,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    subtasks: task.subtasks.map(st => 
                        st.id === subtaskId ? { ...st, completed: !st.completed } : st
                    )
                };
            }
            return task;
        })
      );
  };

  const handleUpdateDealStage = (dealId: string, newStage: PipelineStage) => {
    setDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealId ? { ...deal, stage: newStage } : deal
      )
    );
  };

  const handleAddDeal = (dealData: Omit<Deal, 'id' | 'stage' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `d${Date.now()}`,
      stage: PipelineStage.New,
      createdAt: new Date().toISOString(),
    };
    setDeals(prevDeals => [newDeal, ...prevDeals]);
  };
  
  const handleEnrollContactInSequence = (contactId: string, sequenceId: string) => {
    const sequence = sequences.find(s => s.id === sequenceId);
    if (!sequence) return;

    setContacts(prevContacts => prevContacts.map(c => 
        c.id === contactId 
            ? { ...c, enrolledInSequenceId: sequenceId, currentSequenceStep: 1, sequenceStartDate: new Date().toISOString() } 
            : c
    ));

    const newTasks: Task[] = sequence.steps.map((step, index) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + step.day);
        return {
            id: `t${Date.now()}-${contactId}-${sequenceId}-${index}`,
            title: `Sequence ${index + 1}/${sequence.steps.length} (${sequence.name}): ${step.templateName}`,
            completed: false,
            contactId: contactId,
            dueDate: dueDate.toISOString().split('T')[0],
            priority: Priority.Medium,
            subtasks: [],
        };
    });
    setTasks(prevTasks => [...newTasks, ...prevTasks]);
    setContactToSequence(null);
  };

  const handleUpdateSequenceStep = (sequenceId: string, stepIndex: number, newContent: string) => {
    setSequences(prev => prev.map(seq => {
      if (seq.id === sequenceId) {
        const newSteps = [...seq.steps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], content: newContent };
        return { ...seq, steps: newSteps };
      }
      return seq;
    }));
  };

  const handleGenerateLogo = async (companyId: string, companyName: string, companyIndustry: string) => {
    try {
      const logoBase64 = await generateCompanyLogo(companyName, companyIndustry);
      setCompanyLogos(prev => ({...prev, [companyId]: logoBase64}));
    } catch(error) {
      console.error("Logo generation failed in App:", error);
      throw error;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard contactsCount={contacts.length} companiesCount={companies.length}/>;
      case View.Search:
        return <SearchView onAddProspects={addProspects} />;
      case View.Contacts:
        return <ContactsList contacts={contacts} onViewContact={setSelectedContact} />;
      case View.Companies:
        return <CompaniesList 
                  companies={companies}
                  companyLogos={companyLogos}
                  onGenerateLogo={handleGenerateLogo}
                  onViewCompany={handleViewCompany}
                />;
      case View.Tasks:
        return <TasksView 
                  tasks={tasks} 
                  contacts={contacts} 
                  companies={companies}
                  projects={projects}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onToggleSubtask={handleToggleSubtask}
                  onLaunchProject={handleLaunchProject}
                />;
      case View.Pipeline:
        return <PipelineView
                  deals={deals}
                  contacts={contacts}
                  onUpdateDealStage={handleUpdateDealStage}
                />;
      case View.Sequences:
        return <SequencesView 
                  sequences={sequences} 
                  onUpdateStep={handleUpdateSequenceStep}
                />;
      case View.KnowledgeBase:
        return <KnowledgeBaseView />;
      case View.Territory:
        return <TerritoryView />;
      case View.Roleplay:
        return <RoleplayView contacts={contacts} />;
      case View.PitchLab:
        return <PitchLabView contacts={contacts} companies={companies} />;
      case View.Integrations:
        return <IntegrationsView />;
      default:
        return <Dashboard contactsCount={contacts.length} companiesCount={companies.length}/>;
    }
  };
  
  const viewTitles: Record<View, string> = {
    [View.Dashboard]: 'Dashboard',
    [View.Search]: 'Prospect Search',
    [View.Contacts]: 'Contacts',
    [View.Companies]: 'Companies',
    [View.Tasks]: 'Projects & Tasks',
    [View.Pipeline]: 'Sales Pipeline',
    [View.Sequences]: 'Email Sequences',
    [View.KnowledgeBase]: 'Knowledge Base',
    [View.Territory]: 'Territory Radar',
    [View.Roleplay]: 'Tactical Roleplay',
    [View.PitchLab]: 'AI Video Pitch Lab',
    [View.Integrations]: 'Integrations',
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={viewTitles[currentView]} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 md:p-8 relative">
          {renderContent()}
        </main>
      </div>
      
      <AIAssistant />

      {selectedContact && (
        <ContactDetailModal 
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onViewCompany={handleViewCompanyByName}
          tasks={tasks.filter(t => t.contactId === selectedContact.id)}
          deals={deals.filter(d => d.contactId === selectedContact.id)}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onAddDeal={handleAddDeal}
          companies={companies}
          companyLogos={companyLogos}
          onAddToSequence={() => setContactToSequence(selectedContact)}
          sequences={sequences}
        />
      )}

      {selectedCompany && (
        <CompanyDetailModal
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
            contacts={contacts.filter(c => c.companyName === selectedCompany.name)}
            deals={deals.filter(d => d.companyName === selectedCompany.name)}
            tasks={tasks.filter(t => {
                if (t.companyId === selectedCompany.id) return true;
                const contact = contacts.find(c => c.id === t.contactId);
                return contact && contact.companyName === selectedCompany.name;
            })}
            logo={companyLogos[selectedCompany.id]}
            onGenerateLogo={handleGenerateLogo}
            onEnrichCompany={handleEnrichCompany}
            onViewContact={(contact) => {
                setSelectedCompany(null);
                setSelectedContact(contact);
            }}
        />
      )}

      {contactToSequence && (
        <AddToSequenceModal
          contact={contactToSequence}
          sequences={sequences}
          onClose={() => setContactToSequence(null)}
          onEnroll={handleEnrollContactInSequence}
        />
      )}
    </div>
  );
};

export default App;


import React from 'react';
import { View } from '../types';
import { db } from '../services/db';
import { DashboardIcon, SearchIcon, ContactsIcon, CompaniesIcon, LogoIcon, TasksIcon, PipelineIcon, SequenceIcon, IntegrationsIcon, BookOpenIcon, LocationMarkerIcon, MicrophoneIcon, VideoIcon, XIcon } from './ui/icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-bold rounded-none transition-all duration-200 border-2 ${
        isActive
          ? 'bg-brand-primary text-white border-black shadow-brutalist translate-x-[-2px] translate-y-[-2px]'
          : 'text-gray-400 border-transparent hover:border-white/10 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="ml-4 uppercase tracking-tighter">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const handleReset = () => {
    if (confirm("Reset all operational data? This will restore mock defaults and clear your current mission progress.")) {
      db.reset();
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 glass border-r-2 border-white/10 p-4 flex flex-col justify-between z-10">
      <div className="overflow-y-auto no-scrollbar">
        <div className="flex items-center mb-12 px-2">
          <div className="p-2 bg-brand-primary border-2 border-black shadow-brutalist">
            <LogoIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black ml-3 text-white tracking-tighter uppercase leading-none">thesolopreneur.app</h1>
        </div>
        <nav className="space-y-2">
          <NavItem
            icon={<DashboardIcon className="w-5 h-5" />}
            label="Dashboard"
            isActive={currentView === View.Dashboard}
            onClick={() => setCurrentView(View.Dashboard)}
          />
          <NavItem
            icon={<SearchIcon className="w-5 h-5" />}
            label="Search"
            isActive={currentView === View.Search}
            onClick={() => setCurrentView(View.Search)}
          />
          <NavItem
            icon={<VideoIcon className="w-5 h-5" />}
            label="Pitch Lab"
            isActive={currentView === View.PitchLab}
            onClick={() => setCurrentView(View.PitchLab)}
          />
           <NavItem
            icon={<LocationMarkerIcon className="w-5 h-5" />}
            label="Territory"
            isActive={currentView === View.Territory}
            onClick={() => setCurrentView(View.Territory)}
          />
          <NavItem
            icon={<MicrophoneIcon className="w-5 h-5" />}
            label="Roleplay"
            isActive={currentView === View.Roleplay}
            onClick={() => setCurrentView(View.Roleplay)}
          />
           <NavItem
            icon={<PipelineIcon className="w-5 h-5" />}
            label="Pipeline"
            isActive={currentView === View.Pipeline}
            onClick={() => setCurrentView(View.Pipeline)}
          />
          <NavItem
            icon={<ContactsIcon className="w-5 h-5" />}
            label="Contacts"
            isActive={currentView === View.Contacts}
            onClick={() => setCurrentView(View.Contacts)}
          />
          <NavItem
            icon={<CompaniesIcon className="w-5 h-5" />}
            label="Companies"
            isActive={currentView === View.Companies}
            onClick={() => setCurrentView(View.Companies)}
          />
           <NavItem
            icon={<TasksIcon className="w-5 h-5" />}
            label="Tasks"
            isActive={currentView === View.Tasks}
            onClick={() => setCurrentView(View.Tasks)}
          />
          <NavItem
            icon={<SequenceIcon className="w-5 h-5" />}
            label="Sequences"
            isActive={currentView === View.Sequences}
            onClick={() => setCurrentView(View.Sequences)}
          />
          <NavItem
            icon={<BookOpenIcon className="w-5 h-5" />}
            label="Knowledge Base"
            isActive={currentView === View.KnowledgeBase}
            onClick={() => setCurrentView(View.KnowledgeBase)}
          />
           <NavItem
            icon={<IntegrationsIcon className="w-5 h-5" />}
            label="Integrations"
            isActive={currentView === View.Integrations}
            onClick={() => setCurrentView(View.Integrations)}
          />
        </nav>
      </div>
       <div className="mt-auto pt-6 border-t border-white/5">
        <div className="bg-white/5 border-2 border-white/10 p-4 rounded-none text-left">
            <h3 className="font-black text-white text-xs uppercase tracking-widest">System Health</h3>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">DB Sync Active</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="text-[9px] text-red-400 font-black uppercase hover:text-red-300 transition-colors"
                >
                  Hard Reset
                </button>
            </div>
            <button className="w-full mt-4 bg-brand-secondary brutalist-button text-gray-900 text-xs font-black py-2 px-4 uppercase">
                Coach Me
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

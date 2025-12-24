
import React from 'react';
import { UserIcon, SearchIcon } from './ui/icons';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="glass border-b-2 border-white/10 p-5 flex items-center justify-between flex-shrink-0 z-20">
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{title}</h2>
      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary transition-transform group-focus-within:scale-110" />
            <input 
                type="text" 
                placeholder="EXECUTE SEARCH..." 
                className="bg-gray-900 text-gray-200 border-2 border-black focus:border-brand-primary rounded-none pl-12 pr-4 py-2 text-xs font-black w-72 shadow-brutalist-sm focus:shadow-brutalist outline-none transition-all placeholder:text-gray-600"
            />
        </div>
        <div className="w-12 h-12 glass flex items-center justify-center border-2 border-black shadow-brutalist-sm hover:translate-y-[-2px] hover:shadow-brutalist transition-all cursor-pointer">
            <UserIcon className="w-7 h-7 text-brand-secondary" />
        </div>
      </div>
    </header>
  );
};

export default Header;

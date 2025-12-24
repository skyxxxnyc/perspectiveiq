import React, { useState, useEffect } from 'react';
import { GmailIcon, CalendarIcon } from './ui/icons';

const IntegrationCard: React.FC<{
    icon: React.ReactNode;
    name: string;
    description: string;
    storageKey: string;
}> = ({ icon, name, description, storageKey }) => {
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => {
        const storedStatus = localStorage.getItem(storageKey);
        if(storedStatus === 'true') {
            setIsConnected(true);
        }
    }, [storageKey]);

    const handleToggleConnection = () => {
        const newStatus = !isConnected;
        setIsConnected(newStatus);
        localStorage.setItem(storageKey, newStatus.toString());
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 text-gray-300">{icon}</div>
                <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">{name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{description}</p>
                </div>
            </div>
            <button
                onClick={handleToggleConnection}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    isConnected 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
                {isConnected ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    );
}

const IntegrationsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Connect Your Apps</h2>
            <p className="mt-2 text-gray-400">Streamline your workflow by connecting your favorite tools with ProspectIQ.</p>
        </div>
        <div className="space-y-4">
            <IntegrationCard 
                icon={<GmailIcon />}
                name="Gmail"
                description="Sync emails with your contacts and create new tasks from your inbox."
                storageKey="gmailConnected"
            />
            <IntegrationCard 
                icon={<CalendarIcon className="text-blue-400"/>}
                name="Google Calendar"
                description="Sync your meetings and get reminders for your sales tasks."
                storageKey="gcalConnected"
            />
        </div>
    </div>
  );
};

export default IntegrationsView;

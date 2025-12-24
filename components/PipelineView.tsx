import React, { useState } from 'react';
import { Deal, PipelineStage, Contact } from '../types';
import { UserIcon, FlagIcon, CalendarIcon } from './ui/icons';

interface PipelineViewProps {
    deals: Deal[];
    contacts: Contact[];
    onUpdateDealStage: (dealId: string, newStage: PipelineStage) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const priorityColors: Record<Deal['priority'], string> = {
    High: 'text-red-400',
    Medium: 'text-yellow-400',
    Low: 'text-gray-400',
};

const DealCard: React.FC<{ deal: Deal; contactName?: string }> = ({ deal, contactName }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('dealId', deal.id);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="bg-gray-800 p-4 rounded-lg shadow-md mb-3 cursor-grab active:cursor-grabbing border-l-4 border-gray-700 hover:border-brand-primary transition-colors"
        >
            <h4 className="font-bold text-sm text-white">{deal.title}</h4>
            <p className="text-green-400 font-semibold text-sm my-1">{currencyFormatter.format(deal.value)}</p>
            <div className="flex items-center text-xs text-gray-400 mt-2">
                <UserIcon className="w-4 h-4 mr-1.5" />
                <span>{contactName || 'Unknown Contact'}</span>
            </div>
             <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2 border-t border-gray-700/50">
                <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1.5"/>
                    <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                </div>
                <div className={`flex items-center font-semibold ${priorityColors[deal.priority]}`}>
                    <FlagIcon className="w-4 h-4 mr-1"/>
                    <span>{deal.priority}</span>
                </div>
             </div>
        </div>
    );
};

interface PipelineColumnProps {
    stage: PipelineStage;
    deals: Deal[];
    contactMap: Record<string, string>;
    onUpdateDealStage: (dealId: string, newStage: PipelineStage) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, deals, contactMap, onUpdateDealStage }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData('dealId');
        if (dealId) {
            onUpdateDealStage(dealId, stage);
        }
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };
    
    const stageTotal = deals.reduce((sum, deal) => sum + deal.value, 0);

    return (
        <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex-1 min-w-[280px] bg-gray-800/50 rounded-xl transition-colors ${isDragOver ? 'bg-brand-primary/20' : ''}`}
        >
            <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white flex justify-between items-center">
                    <span>{stage} <span className="text-xs text-gray-400 ml-1">({deals.length})</span></span>
                    <span className="text-sm text-green-400">{currencyFormatter.format(stageTotal)}</span>
                </h3>
            </div>
            <div className="p-4 h-full">
                {deals.map(deal => (
                    <DealCard key={deal.id} deal={deal} contactName={contactMap[deal.contactId]} />
                ))}
            </div>
        </div>
    );
};


const PipelineView: React.FC<PipelineViewProps> = ({ deals, contacts, onUpdateDealStage }) => {
    
    const contactMap = contacts.reduce((acc, contact) => {
        acc[contact.id] = contact.name;
        return acc;
    }, {} as Record<string, string>);

    const pipelineStages: PipelineStage[] = [
        PipelineStage.New,
        PipelineStage.Discovery,
        PipelineStage.Proposal,
        PipelineStage.Negotiation,
        PipelineStage.ClosedWon,
        PipelineStage.ClosedLost
    ];

    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 h-full">
            {pipelineStages.map(stage => (
                <PipelineColumn
                    key={stage}
                    stage={stage}
                    deals={deals.filter(d => d.stage === stage)}
                    contactMap={contactMap}
                    onUpdateDealStage={onUpdateDealStage}
                />
            ))}
        </div>
    );
};

export default PipelineView;

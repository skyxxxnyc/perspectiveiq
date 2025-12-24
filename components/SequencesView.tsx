
import React, { useState } from 'react';
import { Sequence, SequenceStep, SequenceStepType } from '../types';
import { MailIcon, TasksIcon, LinkedInIcon, ChevronDownIcon, ChevronUpIcon } from './ui/icons';

const stepIcons: Record<SequenceStepType, React.ReactNode> = {
    [SequenceStepType.Email]: <MailIcon className="w-5 h-5 text-brand-primary" />,
    [SequenceStepType.Call]: <TasksIcon className="w-5 h-5 text-yellow-400" />,
    [SequenceStepType.LinkedIn]: <LinkedInIcon className="w-5 h-5 text-blue-500" />,
};

const SequenceStepPill: React.FC<{
    step: SequenceStep; 
    isSelected: boolean; 
    onClick: () => void;
    onSave: (newContent: string) => void;
}> = ({ step, isSelected, onClick, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(step.content || '');

    const handleEditToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave(editedContent);
        setIsEditing(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditedContent(step.content || '');
        setIsEditing(false);
    };

    return (
        <div className="space-y-2">
            <button 
                onClick={onClick}
                className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 text-left border ${
                    isSelected 
                    ? 'bg-gray-700/80 border-brand-primary shadow-inner' 
                    : 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/30'
                }`}
            >
                <div className="flex-shrink-0 mr-3">{stepIcons[step.type]}</div>
                <div className="flex-grow">
                    <p className="text-sm font-medium text-white">{step.templateName}</p>
                    <p className="text-xs text-gray-400">{step.type}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-300 font-semibold">Day {step.day}</div>
                    <div className="text-gray-500">
                        {isSelected ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </div>
                </div>
            </button>
            
            {isSelected && step.content && (
                <div className="mx-2 p-4 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 animate-fade-in shadow-xl">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {step.type === SequenceStepType.Email ? 'Email Template' : step.type === SequenceStepType.LinkedIn ? 'Message Template' : 'Step Notes'}
                        </span>
                        {!isEditing ? (
                            <button 
                                onClick={handleEditToggle}
                                className="text-brand-primary hover:text-brand-secondary text-xs font-medium bg-brand-primary/10 px-2 py-1 rounded"
                            >
                                Edit Template
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCancel}
                                    className="text-gray-400 hover:text-gray-200 text-xs font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="text-brand-primary hover:text-brand-secondary text-xs font-bold"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={6}
                            className="w-full bg-gray-800 text-gray-200 text-sm border border-gray-700 rounded-md p-3 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none resize-none"
                        />
                    ) : (
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-300">{step.content}</p>
                    )}
                    
                    {step.type === SequenceStepType.Email && !isEditing && (
                        <div className="mt-3 pt-3 border-t border-gray-800 flex gap-2">
                            <span className="text-[10px] text-gray-500">Variables available:</span>
                            <span className="text-[10px] bg-gray-800 px-1 rounded text-brand-primary">{"{{name}}"}</span>
                            <span className="text-[10px] bg-gray-800 px-1 rounded text-brand-primary">{"{{company}}"}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const SequenceCard: React.FC<{
    sequence: Sequence;
    onUpdateStep: (stepIndex: number, newContent: string) => void;
}> = ({ sequence, onUpdateStep }) => {
    const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

    const handleStepClick = (index: number) => {
        setSelectedStepIndex(selectedStepIndex === index ? null : index);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-gray-700">
            <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                <h3 className="text-lg font-bold text-white">{sequence.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{sequence.description}</p>
            </div>
            <div className="p-5 space-y-3 flex-grow overflow-y-auto max-h-[500px] custom-scrollbar">
                {sequence.steps.map((step, index) => (
                    <SequenceStepPill 
                        key={index} 
                        step={step} 
                        isSelected={selectedStepIndex === index}
                        onClick={() => handleStepClick(index)}
                        onSave={(newContent) => onUpdateStep(index, newContent)}
                    />
                ))}
            </div>
            <div className="p-4 bg-gray-900/30 border-t border-gray-700 text-center">
                <button className="text-xs font-medium text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors">
                    Sequence Stats & View Full Details
                </button>
            </div>
        </div>
    );
}

interface SequencesViewProps {
  sequences: Sequence[];
  onUpdateStep: (sequenceId: string, stepIndex: number, newContent: string) => void;
}

const SequencesView: React.FC<SequencesViewProps> = ({ sequences, onUpdateStep }) => {
  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-bold text-white">Email Sequences</h2>
                <p className="mt-1 text-gray-400">Automate your outreach with high-converting multi-step workflows.</p>
            </div>
            <button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-6 rounded-md shadow-lg transition-all hover:scale-105">
                Create New Sequence
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sequences.map(seq => (
                <SequenceCard 
                    key={seq.id} 
                    sequence={seq} 
                    onUpdateStep={(stepIndex, newContent) => onUpdateStep(seq.id, stepIndex, newContent)}
                />
            ))}
        </div>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.2s ease-out;
            }
            .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #4B5563;
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #6B7280;
            }
        `}</style>
    </div>
  );
};

export default SequencesView;

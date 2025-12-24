import React, { useState } from 'react';
import { Contact, Sequence } from '../types';
import { XIcon, SendIcon } from './ui/icons';

interface AddToSequenceModalProps {
  contact: Contact;
  sequences: Sequence[];
  onClose: () => void;
  onEnroll: (contactId: string, sequenceId: string) => void;
}

const AddToSequenceModal: React.FC<AddToSequenceModalProps> = ({ contact, sequences, onClose, onEnroll }) => {
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>(sequences[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSequenceId) return;
    onEnroll(contact.id, selectedSequenceId);
  };
  
  const selectedSequence = sequences.find(s => s.id === selectedSequenceId);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-labelledby="sequence-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 id="sequence-modal-title" className="text-xl font-bold text-white">Add to Sequence</h2>
            <p className="text-sm text-gray-400">Enroll {contact.name} in an outreach sequence.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
                <label htmlFor="sequence" className="block text-sm font-medium text-gray-300 mb-2">
                    Select a sequence
                </label>
                <select 
                    id="sequence" 
                    value={selectedSequenceId}
                    onChange={(e) => setSelectedSequenceId(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md py-2 px-3 focus:ring-brand-primary focus:border-brand-primary"
                >
                    {sequences.map(seq => (
                        <option key={seq.id} value={seq.id}>{seq.name}</option>
                    ))}
                </select>
            </div>
            {selectedSequence && (
                <div className="text-sm p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-gray-300">{selectedSequence.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{selectedSequence.steps.length} steps over {selectedSequence.steps[selectedSequence.steps.length - 1].day} days</p>
                </div>
            )}
          </div>

          <div className="p-6 bg-gray-900/50 border-t border-gray-700 rounded-b-2xl flex justify-end items-center space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-600 focus:outline-none">
                Cancel
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none flex items-center">
                <SendIcon className="w-4 h-4 mr-2"/>
                Start Sequence
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-scale {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AddToSequenceModal;

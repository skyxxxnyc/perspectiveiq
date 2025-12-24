
import React from 'react';
import { Contact, ContactStatus } from '../types';

interface ContactsListProps {
  contacts: Contact[];
  onViewContact: (contact: Contact) => void;
}

const statusColors: Record<ContactStatus, string> = {
    [ContactStatus.New]: 'bg-blue-500',
    [ContactStatus.Contacted]: 'bg-yellow-500',
    [ContactStatus.Replied]: 'bg-green-500',
    [ContactStatus.MeetingBooked]: 'bg-purple-500',
    [ContactStatus.NotInterested]: 'bg-red-500',
};

const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400 border-green-400/30 bg-green-400/5';
    if (score >= 40) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5';
    return 'text-red-400 border-red-400/30 bg-red-400/5';
};

const ContactsList: React.FC<ContactsListProps> = ({ contacts, onViewContact }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
       <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full border border-gray-600 shadow-sm" src={`https://i.pravatar.cc/150?u=${contact.email}`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{contact.name}</div>
                        <div className="text-sm text-gray-400">{contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{contact.title}</div>
                    <div className="text-sm text-gray-400">{contact.companyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full border text-xs font-bold ${getScoreColor(contact.leadScore || 0)}`}>
                        {contact.leadScore || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[contact.status]} text-white`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contact.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onViewContact(contact)} className="text-brand-primary hover:text-brand-secondary font-bold">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default ContactsList;

import React, { useState } from 'react';
import { Company } from '../types';
import { SparklesIcon, SpinnerIcon } from './ui/icons';

interface CompaniesListProps {
  companies: Company[];
  companyLogos: Record<string, string>;
  onGenerateLogo: (companyId: string, companyName: string, companyIndustry: string) => Promise<void>;
  onViewCompany: (company: Company) => void;
}

const CompaniesList: React.FC<CompaniesListProps> = ({ companies, companyLogos, onGenerateLogo, onViewCompany }) => {
  const [generatingLogoId, setGeneratingLogoId] = useState<string | null>(null);

  const handleGenerateClick = async (e: React.MouseEvent, company: Company) => {
    e.stopPropagation(); // Prevent opening modal
    if (generatingLogoId) return;
    setGeneratingLogoId(company.id);
    try {
      await onGenerateLogo(company.id, company.name, company.industry);
    } catch (error) {
      console.error(`Failed to generate logo for ${company.name}`, error);
      alert(`Could not generate a logo for ${company.name}. Please try again.`);
    } finally {
      setGeneratingLogoId(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Industry</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => onViewCompany(company)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-600">
                      {companyLogos[company.id] ? (
                        <img src={`data:image/png;base64,${companyLogos[company.id]}`} alt={`${company.name} logo`} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-white">{company.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{company.name}</div>
                      <div className="text-sm text-gray-400">{company.website}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{company.industry}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{company.size}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{company.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button
                      onClick={(e) => handleGenerateClick(e, company)}
                      disabled={!!generatingLogoId}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:bg-brand-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      {generatingLogoId === company.id ? (
                        <>
                          <SpinnerIcon className="w-4 h-4 mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4 mr-2" />
                          Generate Logo
                        </>
                      )}
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesList;
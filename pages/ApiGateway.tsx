
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Endpoint } from '../types';
import { KeyRound, PlusCircle, Copy, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import EndpointModal from '../components/modals/AddEndpointModal';
import DeleteEndpointConfirmModal from '../components/modals/DeleteEndpointConfirmModal';

const SecurityScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let color: 'green' | 'yellow' | 'red' = 'green';
  if (score < 50) color = 'red';
  else if (score < 80) color = 'yellow';

  const colorClasses = {
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-full text-sm border ${colorClasses[color]}`}>
      {score}
    </span>
  );
};

const ApiGateway: React.FC = () => {
  const { endpoints, addEndpoint, updateEndpoint, toggleEndpointStatus, getSecurityScoreForEndpoint, deleteEndpoint } = useAppContext();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [endpointToDelete, setEndpointToDelete] = useState<Endpoint | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here in a real app
  };

  const handleAddClick = () => {
    setEditingEndpoint(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (endpoint: Endpoint) => {
    setEditingEndpoint(endpoint);
    setOpenActionMenu(null);
    setIsModalOpen(true);
  };
  
  const handleOpenDeleteModal = (endpoint: Endpoint) => {
    setEndpointToDelete(endpoint);
    setOpenActionMenu(null); // Close the actions menu
  };

  const handleConfirmDelete = (keepLogs: boolean) => {
    if (endpointToDelete) {
      deleteEndpoint(endpointToDelete.id, { keepLogs });
    }
    setEndpointToDelete(null); // Close modal
  };

  const handleSaveEndpoint = (endpointData: Omit<Endpoint, 'id' | 'apiKey' | 'createdAt'>, id?: string) => {
    if (id) {
        updateEndpoint(id, endpointData);
    } else {
        addEndpoint(endpointData);
    }
    setIsModalOpen(false);
    setEditingEndpoint(null);
  };

  const handleScoreClick = (endpointId: string) => {
    navigate('/reporting', { state: { endpointId, autoGenerate: true } });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEndpoint(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Security Gateway</h1>
        <button 
          onClick={handleAddClick}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Endpoint
        </button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registered Endpoints</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 sm:pl-6">Endpoint</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Health Score</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">API Key</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Rate Limit</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900/50">
              {endpoints.map((endpoint) => (
                <tr key={endpoint.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        <KeyRound className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">{endpoint.name}</div>
                        <div className="text-gray-500 dark:text-gray-400">{endpoint.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {endpoint.status === 'active' ? (
                      <Badge color="green">Active</Badge>
                    ) : (
                      <Badge color="gray">Inactive</Badge>
                    )}
                  </td>
                   <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <button
                      onClick={() => handleScoreClick(endpoint.id)}
                      className="rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                      title="View detailed security report"
                    >
                      <SecurityScoreBadge score={getSecurityScoreForEndpoint(endpoint.id)} />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <span className="font-mono">{endpoint.apiKey}</span>
                      <button onClick={() => copyToClipboard(endpoint.apiKey)} className="ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{endpoint.rateLimit} req/min</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setOpenActionMenu(openActionMenu === endpoint.id ? null : endpoint.id)}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                      >
                        <span className="sr-only">Open options</span>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openActionMenu === endpoint.id && (
                        <div
                          className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="menu-button"
                        >
                          <div className="py-1" role="none">
                            <button
                              onClick={() => handleEditClick(endpoint)}
                              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
                              role="menuitem"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                toggleEndpointStatus(endpoint.id);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
                              role="menuitem"
                            >
                              {endpoint.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                onClick={() => handleOpenDeleteModal(endpoint)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-red-400 dark:hover:text-red-300"
                                role="menuitem"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {isModalOpen && (
        <EndpointModal 
          onClose={handleCloseModal}
          onSave={handleSaveEndpoint}
          endpointToEdit={editingEndpoint}
        />
      )}
      {endpointToDelete && (
        <DeleteEndpointConfirmModal
          endpoint={endpointToDelete}
          onClose={() => setEndpointToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ApiGateway;

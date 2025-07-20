
import React, { useState, useEffect } from 'react';
import { Endpoint } from '../../types';
import Card from '../ui/Card';
import { X } from 'lucide-react';

interface EndpointModalProps {
  onClose: () => void;
  onSave: (endpointData: Omit<Endpoint, 'id' | 'apiKey' | 'createdAt'>, id?: string) => void;
  endpointToEdit?: Endpoint | null;
}

const EndpointModal: React.FC<EndpointModalProps> = ({ onClose, onSave, endpointToEdit }) => {
  const isEditing = !!endpointToEdit;
  
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  useEffect(() => {
    if (endpointToEdit) {
      setName(endpointToEdit.name);
      setUrl(endpointToEdit.url);
      setRateLimit(endpointToEdit.rateLimit);
      setIpWhitelist(endpointToEdit.ipWhitelist.join(', '));
      setStatus(endpointToEdit.status);
    }
  }, [endpointToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) {
      alert('Endpoint Name and URL are required.');
      return;
    }

    onSave({
      name,
      url,
      rateLimit,
      ipWhitelist: ipWhitelist.split(',').map(ip => ip.trim()).filter(ip => ip),
      status,
    }, endpointToEdit?.id);
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card className="relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isEditing ? 'Edit Endpoint' : 'Add New Endpoint'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint Name</label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g., Production Chatbot API" 
                required
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL</label>
              <input 
                type="url" 
                id="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                placeholder="https://api.example.com/v1/chat"
                required
              />
            </div>
            <div>
              <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate Limit (req/min)</label>
              <input 
                type="number" 
                id="rateLimit" 
                value={rateLimit} 
                onChange={(e) => setRateLimit(parseInt(e.target.value, 10))} 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="ipWhitelist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Whitelist (comma-separated)</label>
              <textarea 
                id="ipWhitelist" 
                value={ipWhitelist} 
                onChange={(e) => setIpWhitelist(e.target.value)} 
                rows={2} 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white font-mono focus:ring-blue-500 focus:border-blue-500"
                placeholder="203.0.113.1, 198.51.100.5"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                      <input type="radio" name="status" value="active" checked={status === 'active'} onChange={() => setStatus('active')} className="form-radio h-4 w-4 text-blue-600 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500" />
                      <span className="ml-2 text-gray-900 dark:text-white">Active</span>
                  </label>
                  <label className="flex items-center">
                      <input type="radio" name="status" value="inactive" checked={status === 'inactive'} onChange={() => setStatus('inactive')} className="form-radio h-4 w-4 text-blue-600 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500" />
                      <span className="ml-2 text-gray-900 dark:text-white">Inactive</span>
                  </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                {isEditing ? 'Save Changes' : 'Add Endpoint'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EndpointModal;
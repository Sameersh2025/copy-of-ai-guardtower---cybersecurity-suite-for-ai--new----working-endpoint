
import React from 'react';
import { Endpoint } from '../../types';
import Card from '../ui/Card';
import { X, AlertTriangle, Trash2, Archive } from 'lucide-react';

interface DeleteEndpointConfirmModalProps {
  onClose: () => void;
  onConfirm: (keepLogs: boolean) => void;
  endpoint: Endpoint;
}

const DeleteEndpointConfirmModal: React.FC<DeleteEndpointConfirmModalProps> = ({ onClose, onConfirm, endpoint }) => {
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
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                      Delete Endpoint "{endpoint.name}"
                  </h3>
                  <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                          This is a destructive action. Please choose how you want to proceed.
                      </p>
                  </div>
              </div>
          </div>

          <div className="mt-5 space-y-4">
            <button
              onClick={() => onConfirm(false)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 sm:text-sm transition-colors"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Endpoint and All Associated Logs
            </button>
            <button
              onClick={() => onConfirm(true)}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm transition-colors"
            >
              <Archive className="w-5 h-5 mr-2" />
              Delete Endpoint Only (Keep Logs)
            </button>
          </div>
           <div className="mt-4">
              <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={onClose}
              >
                  Cancel
              </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeleteEndpointConfirmModal;

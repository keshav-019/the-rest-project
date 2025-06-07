import React, { useState } from "react";

export default function NewCollectionModal({ isOpen, onClose, onCreate }: {isOpen: boolean, onClose: () => void, onCreate: (name: string) => void}) {
    const [name, setName] = useState("");
    
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">New Collection</h3>
          <input
            type="text"
            placeholder="Collection Name"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onCreate(name);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    );
  };
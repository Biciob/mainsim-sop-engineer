import React, { useState, useMemo } from 'react';
import { Search, Plus, Box, X, Briefcase } from 'lucide-react';
import { Asset } from '../types';

interface SidebarProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onAddAsset: () => void;
  isOpen: boolean;
  onClose: () => void;
  selectedAssetId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  assets,
  onSelectAsset,
  onAddAsset,
  isOpen,
  onClose,
  selectedAssetId
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  return (
    <>
      {/* Mobile backdrop - z-40 is below Header (z-50) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#3f4142]/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 
        Sidebar Positioning:
        - Mobile: fixed, starts below header (top-16), z-40
        - Desktop: relative, z-0, flows naturally 
      */}
      <div className={`
        fixed left-0 w-80 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col no-print
        top-16 bottom-0 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:top-0 md:h-full md:z-0
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#3f4142] uppercase tracking-wider flex items-center">
              <Briefcase size={16} className="mr-2" />
              Asset & Attrezzature
            </h2>
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-[#3f4142]">
              <X size={20} />
            </button>
          </div>
          
          <button
            onClick={() => {
              onAddAsset();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#3f4142] hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Nuovo Asset
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100 bg-[#f7f7f7]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3f4142] focus:border-[#3f4142] sm:text-sm text-[#3f4142]"
              placeholder="Cerca per nome, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-y-auto">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 px-4 text-gray-400 text-sm">
              Nessun asset trovato.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`
                    group p-3 cursor-pointer transition-colors hover:bg-[#f7f7f7]
                    ${selectedAssetId === asset.id ? 'bg-[#f7f7f7] border-l-4 border-[#3f4142]' : 'border-l-4 border-transparent'}
                  `}
                  onClick={() => {
                    onSelectAsset(asset);
                    if (window.innerWidth < 768) onClose();
                  }}
                >
                  <div className="flex items-start">
                    <Box size={16} className="mt-1 mr-3 text-gray-400 group-hover:text-[#3f4142]" />
                    <div>
                      <h3 className={`text-sm font-medium ${selectedAssetId === asset.id ? 'text-[#3f4142]' : 'text-gray-700'}`}>
                        {asset.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {asset.brand} • {asset.model}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-400 text-center uppercase tracking-wider">
          Total Assets: {assets.length}
        </div>
      </div>
    </>
  );
};
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/HistorySidebar';
import { SopDisplay } from './components/SopDisplay';
import { Button } from './components/Button';
import { generateSopContent } from './services/geminiService';
import { SopRecord, Asset } from './types';
import { INITIAL_ASSETS } from './data/assets';
import { Wand2, AlertCircle, Settings, FileText, ChevronRight, Briefcase } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Generation State
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // View State
  const [currentSop, setCurrentSop] = useState<SopRecord | null>(null);
  const [docType, setDocType] = useState<'standard' | 'technical_sheet' | 'instruction'>('standard');
  
  // Load SOP history from local storage
  const [history, setHistory] = useState<SopRecord[]>(() => {
    const saved = localStorage.getItem('sop_history_v2');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sop_history_v2', JSON.stringify(history));
  }, [history]);

  // Reset form when asset changes
  useEffect(() => {
    if (selectedAsset) {
      setDescription('');
      setSpecs('');
      setCurrentSop(null); // Go to dashboard view
      setError(null);
    }
  }, [selectedAsset]);

  const handleGenerate = async () => {
    if (!description.trim() || !selectedAsset) return;

    setIsGenerating(true);
    setError(null);

    try {
      const content = await generateSopContent({
        description,
        brand: selectedAsset.brand,
        model: selectedAsset.model,
        specs,
        docType 
      });
      
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : `SOP: ${description.slice(0, 30)}...`;

      const newSop: SopRecord = {
        id: crypto.randomUUID(),
        assetId: selectedAsset.id,
        title: title.replace(/\*\*/g, '').trim(),
        content: content,
        createdAt: Date.now(),
        description,
        brand: selectedAsset.brand,
        model: selectedAsset.model,
        specs,
        type: docType
      };

      setHistory(prev => [newSop, ...prev]);
      setCurrentSop(newSop);
      
      // Clear description after generation
      setDescription('');

    } catch (err: any) {
        setError(err.message || "Si è verificato un errore durante la generazione.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAsset = () => {
    const name = prompt("Nome Attrezzatura:");
    if (!name) return;
    const brand = prompt("Marca:");
    const model = prompt("Modello:");
    
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name,
      brand: brand || '',
      model: model || ''
    };
    
    setAssets(prev => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
  };

  // Filter SOPs for current asset
  const assetSops = history.filter(sop => sop.assetId === selectedAsset?.id);

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col font-sans text-[#3f4142]">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Asset Registry. Only show if we are NOT viewing a document */}
        {!currentSop && (
          <Sidebar
            assets={assets}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onSelectAsset={setSelectedAsset}
            onAddAsset={handleAddAsset}
            selectedAssetId={selectedAsset?.id}
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto scroll-smooth ${!currentSop ? 'p-4 md:p-8' : 'p-0'}`}>
          <div className={`${!currentSop ? 'max-w-6xl mx-auto' : 'w-full'} h-full flex flex-col`}>
            
            {!selectedAsset ? (
              // Empty State
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
                 <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 max-w-lg">
                    <div className="bg-[#f7f7f7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="h-10 w-10 text-[#3f4142]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3f4142] mb-3">Benvenuto in SOP Engineer</h2>
                    <p className="text-gray-500">
                      Utilizza il menu a sinistra per selezionare un asset e iniziare a gestire le procedure.
                    </p>
                 </div>
              </div>
            ) : currentSop ? (
              // Document View
              <SopDisplay sop={currentSop} onBack={() => setCurrentSop(null)} />
            ) : (
              // Asset Dashboard View
              <div className="flex flex-col gap-8 animate-fade-in">
                
                {/* Asset Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-[#f7f7f7] text-gray-500 text-xs rounded uppercase tracking-wider font-semibold">Asset ID: {selectedAsset.id.substring(0,6)}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#3f4142]">{selectedAsset.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><span className="font-semibold text-[#3f4142]">Marca:</span> {selectedAsset.brand}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1"><span className="font-semibold text-[#3f4142]">Modello:</span> {selectedAsset.model}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Generator Form */}
                  <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                           <div className="bg-[#3f4142] p-2 rounded-lg">
                              <Wand2 className="h-5 w-5 text-white" />
                           </div>
                           <h2 className="text-lg font-bold text-[#3f4142]">Generatore Documentale AI</h2>
                        </div>

                        {/* Doc Type Selector */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                           <button 
                              onClick={() => setDocType('standard')}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${docType === 'standard' ? 'bg-[#3f4142] text-white border-[#3f4142]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                           >
                              Procedura Standard
                           </button>
                           <button 
                              onClick={() => setDocType('technical_sheet')}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${docType === 'technical_sheet' ? 'bg-[#3f4142] text-white border-[#3f4142]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                           >
                              Scheda Tecnica
                           </button>
                           <button 
                              onClick={() => setDocType('instruction')}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${docType === 'instruction' ? 'bg-[#3f4142] text-white border-[#3f4142]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                           >
                              Istruzione Operativa
                           </button>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Attività / Task</label>
                              <textarea
                                 rows={3}
                                 className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-[#3f4142] outline-none transition-shadow text-[#3f4142] placeholder-gray-400"
                                 placeholder={docType === 'technical_sheet' ? "Genera scheda tecnica completa..." : "Es: Manutenzione preventiva semestrale..."}
                                 value={description}
                                 onChange={(e) => setDescription(e.target.value)}
                                 disabled={isGenerating}
                              />
                           </div>
                           
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                 <Settings size={14} /> Dati Tecnici Aggiuntivi
                              </label>
                              <textarea
                                 rows={2}
                                 className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-[#3f4142] outline-none text-[#3f4142] text-sm placeholder-gray-400"
                                 placeholder="Coppie di serraggio, tolleranze, codici ricambi..."
                                 value={specs}
                                 onChange={(e) => setSpecs(e.target.value)}
                                 disabled={isGenerating}
                              />
                           </div>

                           {error && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start text-red-700 text-sm">
                                 <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                 <span>{error}</span>
                              </div>
                           )}

                           <div className="pt-2">
                              <Button 
                                 variant="primary" 
                                 className="w-full"
                                 onClick={handleGenerate}
                                 isLoading={isGenerating}
                                 disabled={!description.trim()}
                              >
                                 Genera Documento
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Existing Docs */}
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Archivio Documentale</h3>
                        
                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px]">
                           {assetSops.length === 0 ? (
                              <div className="text-center py-8 px-4 bg-[#f7f7f7] rounded-lg border border-dashed border-gray-300">
                                 <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                 <p className="text-sm text-gray-500">Nessun documento.</p>
                              </div>
                           ) : (
                              assetSops.map(sop => (
                                 <div 
                                    key={sop.id}
                                    onClick={() => setCurrentSop(sop)}
                                    className="p-3 bg-[#f7f7f7] hover:bg-gray-200 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-gray-300"
                                 >
                                    <div className="flex justify-between items-start mb-1">
                                       <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                          sop.type === 'technical_sheet' ? 'bg-blue-100 text-blue-700' :
                                          sop.type === 'instruction' ? 'bg-orange-100 text-orange-700' :
                                          'bg-green-100 text-green-700'
                                       }`}>
                                          {sop.type === 'technical_sheet' ? 'Scheda' : sop.type === 'instruction' ? 'Istr.' : 'SOP'}
                                       </span>
                                       <span className="text-[10px] text-gray-400">{new Date(sop.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-[#3f4142] line-clamp-2 group-hover:text-blue-900">{sop.title}</h4>
                                    <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <ChevronRight size={14} className="text-gray-400" />
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
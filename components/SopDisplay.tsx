import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Printer, Download, Copy, Check, ArrowLeft, Home } from 'lucide-react';
import { Button } from './Button';
import { SopRecord } from '../types';

interface SopDisplayProps {
  sop: SopRecord;
  onBack?: () => void;
}

export const SopDisplay: React.FC<SopDisplayProps> = ({ sop, onBack }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sop.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([sop.content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${sop.title.replace(/\s+/g, '_')}_SOP.md`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white sticky top-0 z-20 no-print shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
            {onBack && (
                <button 
                  onClick={onBack} 
                  className="flex items-center gap-2 px-4 py-2 text-[#3f4142] bg-[#f7f7f7] hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm border border-gray-300" 
                  title="Torna alla Dashboard"
                >
                    <ArrowLeft size={16} />
                    <span>Torna all'Asset</span>
                </button>
            )}
            <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
            <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-[#3f4142]">Anteprima Documento</h2>
                <p className="text-xs text-gray-500">Generato il {new Date(sop.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="secondary" size="sm" onClick={handleCopy} icon={copied ? <Check size={16} /> : <Copy size={16} />}>
            {copied ? 'Copiato' : 'Copia'}
          </Button>
           <Button variant="secondary" size="sm" onClick={handleDownload} icon={<Download size={16} />}>
            Markdown
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer size={16} />}>
            Stampa / PDF
          </Button>
        </div>
      </div>

      {/* Document View */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-[#525659]">
        <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[15mm] md:p-[20mm]" id="sop-document">
            
            {/* Structured Document Header */}
            <div className="border border-[#3f4142] mb-12">
              {/* Header Title Row */}
              <div className="flex flex-col md:flex-row border-b border-[#3f4142] bg-[#f7f7f7] print:bg-[#f7f7f7]">
                <div className="p-4 border-b md:border-b-0 md:border-r border-[#3f4142] w-full md:w-32 flex items-center justify-center">
                  <span className="font-bold text-gray-400 text-xl tracking-widest">SOP</span>
                </div>
                <div className="p-4 flex-1 flex items-center">
                  <h1 className="text-xl md:text-2xl font-bold text-[#3f4142] uppercase leading-tight">
                    {sop.title.replace(/^#\s*/, '').replace(/\*\*/g, '')}
                  </h1>
                </div>
                <div className="p-4 border-t md:border-t-0 md:border-l border-[#3f4142] w-full md:w-48 text-sm text-gray-600 flex flex-col justify-center bg-white">
                  <div className="flex justify-between border-b border-gray-100 pb-1 mb-1">
                    <span>ID:</span> <span className="font-mono font-bold text-[#3f4142]">{sop.id.substring(0,6).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rev:</span> <span className="font-mono font-bold text-[#3f4142]">1.0</span>
                  </div>
                </div>
              </div>

              {/* Technical Metadata Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 text-sm divide-x divide-[#3f4142] bg-white">
                <div className="p-3">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Data</span>
                  <span className="text-[#3f4142] font-semibold">{new Date(sop.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Marca</span>
                  <span className="text-[#3f4142] font-semibold">{sop.brand || 'N/A'}</span>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Modello</span>
                  <span className="text-[#3f4142] font-semibold">{sop.model || 'N/A'}</span>
                </div>
                 <div className="p-3">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Tipo Doc.</span>
                  <span className="text-[#3f4142] font-semibold capitalize">{sop.type ? sop.type.replace('_', ' ') : 'Standard'}</span>
                </div>
              </div>
            </div>

            {/* If specs exist, show them separately before body */}
            {sop.specs && (
               <div className="mb-10 p-5 bg-gray-50 border-l-4 border-[#3f4142] text-sm">
                  <h3 className="font-bold text-[#3f4142] mb-3 uppercase text-xs tracking-wider flex items-center">
                    Specifiche Tecniche di Riferimento
                  </h3>
                  <p className="text-gray-800 whitespace-pre-wrap font-mono text-xs leading-relaxed">{sop.specs}</p>
               </div>
            )}

            {/* Main Content */}
            <article className="prose prose-slate max-w-none print:text-sm text-[#3f4142]">
                <ReactMarkdown
                  components={{
                    // Override H1 (Usually title, but if used in body)
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-[#3f4142] mb-6 mt-10 uppercase tracking-tight border-b-2 border-[#3f4142] pb-2" {...props} />,
                    // Override H2 (Major Sections)
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-[#3f4142] mb-6 mt-10 uppercase tracking-wide border-b border-gray-300 pb-2 flex items-center" {...props} />,
                    // Override H3 (Subsections)
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-[#3f4142] mb-4 mt-8" {...props} />,
                    // Override Paragraphs (Spacing)
                    p: ({node, ...props}) => <p className="mb-6 leading-7 text-gray-800 text-justify" {...props} />,
                    // Override Lists
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-800" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-800" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1 leading-7" {...props} />,
                    // Override Strong/Bold to be very visible
                    strong: ({node, ...props}) => <strong className="font-bold text-[#3f4142]" {...props} />,
                    blockquote: ({node, ...props}) => <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 my-6 text-gray-800 italic" {...props} />
                  }}
                >
                  {sop.content.replace(/^#\s+.+\n/, '')} 
                </ReactMarkdown>
            </article>

            {/* Footer for print */}
            <div className="mt-20 pt-4 border-t border-gray-300 text-[10px] text-gray-400 flex justify-between hidden print:flex">
                <span className="uppercase tracking-wider">Mainsim SOP Generator</span>
                <span>Documento generato automaticamente • {new Date().toLocaleDateString()}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
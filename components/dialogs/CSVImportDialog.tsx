import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileUp, Search, X, Check, Eye, HelpCircle, Sliders, Layers } from 'lucide-react';
import { cn, importXlsx } from '../../utils';

interface CSVImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activeCell: string | null;
    onImport: (rows: string[][], startCellId: string, overwriteSheet: boolean) => void;
}

export const parseCSVData = (text: string, delimiter: ',' | '\t' | ';' | 'auto'): { rows: string[][], detectedDelimiter: string } => {
    let activeDel: ',' | '\t' | ';' = ',';
    
    if (delimiter === 'auto') {
        const lines = text.split(/\r?\n/).slice(0, 10);
        let commaCount = 0;
        let tabCount = 0;
        let semiCount = 0;
        
        lines.forEach(line => {
            commaCount += (line.match(/,/g) || []).length;
            tabCount += (line.match(/\t/g) || []).length;
            semiCount += (line.match(/;/g) || []).length;
        });
        
        if (tabCount > commaCount && tabCount > semiCount) {
            activeDel = '\t';
        } else if (semiCount > commaCount && semiCount > tabCount) {
            activeDel = ';';
        } else {
            activeDel = ',';
        }
    } else {
        activeDel = delimiter;
    }

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentField += '"';
                i++; // skip next quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === activeDel && !insideQuotes) {
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++; // skip LF
            }
            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    const parsedRows = rows.filter((row, idx) => {
        if (idx === rows.length - 1 && row.length === 1 && row[0] === '') return false;
        return true;
    });

    const displayDel = activeDel === '\t' ? 'Tab' : activeDel === ';' ? 'Semicolon' : 'Comma';
    return { rows: parsedRows, detectedDelimiter: displayDel };
};

const CSVImportDialog: React.FC<CSVImportDialogProps> = ({
    isOpen,
    onClose,
    activeCell,
    onImport
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [file, setFile] = useState<File | null>(null);
    const [fileText, setFileText] = useState<string>('');
    const [isXlsx, setIsXlsx] = useState<boolean>(false);
    const [xlsxWorkbook, setXlsxWorkbook] = useState<Record<string, string[][]> | null>(null);
    const [selectedXlsxSheet, setSelectedXlsxSheet] = useState<string>('');
    const [isParsing, setIsParsing] = useState<boolean>(false);
    
    const [delimiter, setDelimiter] = useState<',' | '\t' | ';' | 'auto'>('auto');
    const [insertPosition, setInsertPosition] = useState<'active' | 'A1'>('active');
    const [isDragging, setIsDragging] = useState(false);

    // Reset when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setFileText('');
            setIsXlsx(false);
            setXlsxWorkbook(null);
            setSelectedXlsxSheet('');
            setDelimiter('auto');
            setInsertPosition('active');
            setIsParsing(false);
        }
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleFileLoad = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsParsing(true);
        const name = selectedFile.name.toLowerCase();
        
        if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
            setIsXlsx(true);
            try {
                const sheetsMap = await importXlsx(selectedFile);
                setXlsxWorkbook(sheetsMap);
                const sheetNames = Object.keys(sheetsMap);
                if (sheetNames.length > 0) {
                    setSelectedXlsxSheet(sheetNames[0]);
                }
            } catch (err) {
                console.error("XLSX parsing failed:", err);
                alert("Failed to parse Excel workbook. It might be corrupted or in an unsupported format.");
                setFile(null);
            } finally {
                setIsParsing(false);
            }
        } else {
            setIsXlsx(false);
            setXlsxWorkbook(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setFileText(e.target.result as string);
                }
                setIsParsing(false);
            };
            reader.onerror = () => {
                setIsParsing(false);
                alert("Failed to read text file.");
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileLoad(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileLoad(e.dataTransfer.files[0]);
        }
    };

    const parsedData = useMemo(() => {
        if (isXlsx) {
            if (!xlsxWorkbook || !selectedXlsxSheet) return { rows: [], detectedDelimiter: 'Excel' };
            return { rows: xlsxWorkbook[selectedXlsxSheet] || [], detectedDelimiter: 'Excel' };
        } else {
            if (!fileText) return { rows: [], detectedDelimiter: '' };
            return parseCSVData(fileText, delimiter);
        }
    }, [isXlsx, fileText, delimiter, xlsxWorkbook, selectedXlsxSheet]);

    const handleImportSubmit = () => {
        if (!parsedData.rows.length) return;
        const targetAnchor = insertPosition === 'active' ? (activeCell || 'A1') : 'A1';
        const overwrite = insertPosition === 'A1';
        onImport(parsedData.rows, targetAnchor, overwrite);
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                            <FileUp size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                Import Spreadsheet File
                            </h2>
                            <p className="text-xs text-slate-500">
                                Import CSV, Delimited Text, or Microsoft Excel files cleanly
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                    
                    {/* File Upload / Drop Area */}
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                                isDragging 
                                    ? "border-blue-500 bg-blue-50/30 scale-[1.01]" 
                                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
                            )}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".csv,.txt,.tsv,.xlsx,.xls" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shadow-2xs">
                                <FileUp size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-slate-700">
                                    Drag and drop your file here, or <span className="text-blue-600 hover:underline">browse</span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Supports Excel (.xlsx, .xls) and text-delimited files (.csv, .txt, .tsv)
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* File Loaded Header Badge */
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                    "w-11 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs text-white",
                                    isXlsx ? "bg-emerald-600" : "bg-blue-600"
                                )}>
                                    {isXlsx ? 'xlsx' : 'csv'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        {(file.size / 1024).toFixed(1)} KB &bull; {parsedData.rows.length} rows detected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setFile(null); setFileText(''); setXlsxWorkbook(null); }}
                                className="text-xs text-rose-600 font-semibold hover:underline bg-transparent hover:bg-rose-50 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                            >
                                Change File
                            </button>
                        </div>
                    )}

                    {isParsing && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
                            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                            <p className="text-xs font-medium">Parsing workbook data...</p>
                        </div>
                    )}

                    {file && !isParsing && (
                        <>
                            {/* Delimiter / Sheet selection & Insertion configuration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isXlsx ? (
                                    /* Excel Worksheet Selector */
                                    <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Layers size={12} />
                                            Select Worksheet
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedXlsxSheet}
                                                onChange={(e) => setSelectedXlsxSheet(e.target.value)}
                                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs outline-none cursor-pointer"
                                            >
                                                {xlsxWorkbook && Object.keys(xlsxWorkbook).map(name => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-[9px] text-slate-400">
                                            This file has {xlsxWorkbook ? Object.keys(xlsxWorkbook).length : 0} sheet(s)
                                        </p>
                                    </div>
                                ) : (
                                    /* Delimiter Picker */
                                    <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Sliders size={12} />
                                            Delimiter Character
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                onClick={() => setDelimiter('auto')}
                                                className={cn(
                                                    "px-2.5 py-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer",
                                                    delimiter === 'auto'
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                Auto-Detect ({parsedData.detectedDelimiter})
                                            </button>
                                            <button
                                                onClick={() => setDelimiter(',')}
                                                className={cn(
                                                    "px-2.5 py-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer",
                                                    delimiter === ','
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                Comma (,)
                                            </button>
                                            <button
                                                onClick={() => setDelimiter('\t')}
                                                className={cn(
                                                    "px-2.5 py-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer",
                                                    delimiter === '\t'
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                Tab (\t)
                                            </button>
                                            <button
                                                onClick={() => setDelimiter(';')}
                                                className={cn(
                                                    "px-2.5 py-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer",
                                                    delimiter === ';'
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                Semicolon (;)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Destination Selector */}
                                <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Check size={12} />
                                        Destination Target
                                    </label>
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            onClick={() => setInsertPosition('active')}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-xs font-medium text-left border flex items-center justify-between transition-all cursor-pointer",
                                                insertPosition === 'active'
                                                    ? "bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-2xs"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <span>Insert at Active Cell ({activeCell || 'A1'})</span>
                                            {insertPosition === 'active' && <Check size={14} className="text-blue-600" />}
                                        </button>
                                        <button
                                            onClick={() => setInsertPosition('A1')}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-xs font-medium text-left border flex items-center justify-between transition-all cursor-pointer",
                                                insertPosition === 'A1'
                                                    ? "bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-2xs"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <span>Overwrite Sheet (Start at A1)</span>
                                            {insertPosition === 'A1' && <Check size={14} className="text-blue-600" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data Preview Table (First 5 Rows) */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
                                    <Eye size={12} />
                                    Live Preview (First 5 Rows)
                                </label>
                                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[160px] bg-slate-50/30">
                                    <table className="w-full text-left text-[11px] font-mono border-collapse divide-y divide-slate-100">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-500 uppercase tracking-tight text-[10px]">
                                                <th className="px-3 py-2 border-r border-slate-100 text-center w-8">#</th>
                                                {Array.from({ length: Math.max(...parsedData.rows.slice(0, 5).map(r => r.length), 0) }).map((_, colIdx) => (
                                                    <th key={colIdx} className="px-3 py-2 border-r border-slate-100">
                                                        Col {colIdx + 1}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {parsedData.rows.slice(0, 5).map((row, rIdx) => (
                                                <tr key={rIdx} className="hover:bg-slate-50/50">
                                                    <td className="px-3 py-1.5 border-r border-slate-100 bg-slate-50 text-slate-400 text-center font-bold">
                                                        {rIdx + 1}
                                                    </td>
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className="px-3 py-1.5 border-r border-slate-100 text-slate-700 truncate max-w-[120px]" title={cell}>
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <HelpCircle size={13} /> ESC to cancel
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors cursor-pointer text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImportSubmit}
                            disabled={!file || !parsedData.rows.length || isParsing}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-xs"
                        >
                            Import Data
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CSVImportDialog;

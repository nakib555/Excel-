
import React, { useState } from 'react';
import { Lock, EyeOff, Shield, FileKey } from 'lucide-react';
import { CellStyle } from '../../../types';
import { cn } from '../../../utils';
import GroupBox from './GroupBox';

interface ProtectionTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const ProtectionTab: React.FC<ProtectionTabProps> = ({ style, onChange, isMobile }) => {
    // Local state for sheet/workbook toggles since they typically reside in global sheet state
    // For this dialog UI, we simulate the controls as requested.
    const [sheetProtected, setSheetProtected] = useState(false);
    const [workbookProtected, setWorkbookProtected] = useState(false);

    const protection = style.protection || {};

    const handleProtectionChange = (key: 'locked' | 'hidden', checked: boolean) => {
        onChange('protection', { ...protection, [key]: checked });
    };

    return (
        <div className={cn("grid h-full gap-6", isMobile ? "grid-cols-1 pb-20" : "grid-cols-2")}>
            <div className="flex flex-col gap-6">
                <GroupBox label="Cell Protection">
                    <div className="flex flex-col gap-4">
                        <p className="text-[11px] text-slate-500 leading-relaxed italic mb-2">
                            Locking cells or hiding formulas has no effect until you protect the worksheet.
                        </p>
                        
                        <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-white hover:shadow-md transition-all">
                            <div className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors",
                                protection.locked !== false ? "bg-primary-600 border-primary-600" : "bg-white border-slate-300 group-hover:border-primary-400"
                            )}>
                                {protection.locked !== false && <Lock size={12} className="text-white" />}
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={protection.locked !== false} 
                                    onChange={(e) => handleProtectionChange('locked', e.target.checked)} 
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-slate-700">Locked</span>
                                <span className="text-[11px] text-slate-400 font-medium">Prevent editing contents</span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-white hover:shadow-md transition-all">
                            <div className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors",
                                protection.hidden ? "bg-primary-600 border-primary-600" : "bg-white border-slate-300 group-hover:border-primary-400"
                            )}>
                                {protection.hidden && <EyeOff size={12} className="text-white" />}
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={!!protection.hidden} 
                                    onChange={(e) => handleProtectionChange('hidden', e.target.checked)} 
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-slate-700">Hidden</span>
                                <span className="text-[11px] text-slate-400 font-medium">Hide formulas from formula bar</span>
                            </div>
                        </label>
                    </div>
                </GroupBox>
            </div>

            <div className="flex flex-col gap-6">
                <GroupBox label="Sheet & Workbook">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Shield size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-slate-800">Protect Sheet</span>
                                    <span className="text-[10px] text-slate-400">Prevent unwanted changes</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSheetProtected(!sheetProtected)}
                                className={cn(
                                    "relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out",
                                    sheetProtected ? "bg-emerald-500" : "bg-slate-200"
                                )}
                            >
                                <span className={cn(
                                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200",
                                    sheetProtected ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FileKey size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-slate-800">Protect Workbook</span>
                                    <span className="text-[10px] text-slate-400">Lock structure & windows</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setWorkbookProtected(!workbookProtected)}
                                className={cn(
                                    "relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out",
                                    workbookProtected ? "bg-blue-500" : "bg-slate-200"
                                )}
                            >
                                <span className={cn(
                                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200",
                                    workbookProtected ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                        
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <p className="text-[10px] text-amber-800 leading-tight">
                                <strong>Note:</strong> Without a password, anyone can unprotect this sheet.
                            </p>
                        </div>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

export default ProtectionTab;

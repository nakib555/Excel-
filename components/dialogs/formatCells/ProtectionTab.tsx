
import React from 'react';
import { Lock } from 'lucide-react';
import { CellStyle } from '../../../types';

interface ProtectionTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const ProtectionTab: React.FC<ProtectionTabProps> = ({ style, onChange }) => (
    <div className="flex flex-col gap-6 h-full py-4">
        <div className="grid gap-6">
            <label className="flex items-start gap-4 p-5 rounded-[24px] bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-white hover:shadow-xl transition-all">
                <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-white mt-1 group-hover:border-primary-500">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-primary-600"
                        checked={style.protection?.locked !== false} 
                        onChange={(e) => onChange('protection', { ...(style.protection || {}), locked: e.target.checked })} 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Lock size={18} className="text-primary-600" />
                        Locked
                    </span>
                    <span className="text-[13px] text-slate-500 mt-1 font-medium">Prevents cells from being edited when sheet protection is active.</span>
                </div>
            </label>
        </div>
    </div>
);

export default ProtectionTab;

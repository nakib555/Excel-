
import React from 'react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import GroupBox from './GroupBox';
import { COLORS } from './constants';

interface FillTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const FillTab: React.FC<FillTabProps> = ({ style, onChange, isMobile }) => (
    <div className="flex flex-col gap-6 h-full">
        <GroupBox label="Background Color">
            <div className={cn("grid gap-2 p-2", isMobile ? "grid-cols-5" : "grid-cols-10")}>
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={cn(
                            "w-8 h-8 rounded-lg border border-slate-200 transition-all hover:scale-110",
                            style.bg === c && "ring-2 ring-primary-500 ring-offset-2 scale-110"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => onChange('bg', c)}
                        title={c}
                    />
                ))}
            </div>
        </GroupBox>
    </div>
);

export default FillTab;

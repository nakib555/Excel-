import React from 'react';
import { Layout, Palette, Type, Sparkles } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ThemesGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Themes">
        <div className="flex items-center gap-2 h-full">
            <RibbonButton variant="large" icon={<Layout size={20} className="text-indigo-600" />} label="Themes" hasDropdown onClick={() => {}} />
            <div className="flex flex-col gap-0 justify-center">
                <RibbonButton variant="small" icon={<Palette size={14} className="text-purple-500" />} label="Colors" hasDropdown onClick={() => {}} />
                <RibbonButton variant="small" icon={<Type size={14} className="text-slate-600" />} label="Fonts" hasDropdown onClick={() => {}} />
                <RibbonButton variant="small" icon={<Sparkles size={14} className="text-orange-500" />} label="Effects" hasDropdown onClick={() => {}} />
            </div>
        </div>
    </RibbonGroup>
  );
};

export default ThemesGroup;
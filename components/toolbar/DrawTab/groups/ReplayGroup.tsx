import React from 'react';
import { PlayCircle } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ReplayGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Replay">
        <RibbonButton variant="large" icon={<PlayCircle size={20} className="text-emerald-600" />} label="Ink" subLabel="Replay" onClick={() => {}} />
    </RibbonGroup>
  );
};

export default ReplayGroup;
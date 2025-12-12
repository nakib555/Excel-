import React from 'react';
import { PlayCircle } from 'lucide-react';
import { RibbonButton } from '../../shared';

const InkReplay = () => (
    <RibbonButton variant="large" icon={<PlayCircle size={20} className="text-emerald-600" />} label="Ink" subLabel="Replay" onClick={() => {}} />
);

export default InkReplay;
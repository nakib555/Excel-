import React from 'react';
import { Scissors } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface CutProps {
  onCut?: () => void;
}

const Cut: React.FC<CutProps> = ({ onCut }) => (
  <RibbonButton variant="small" icon={<Scissors size={14} className="text-slate-500" />} label="Cut" onClick={onCut || (() => {})} />
);

export default Cut;
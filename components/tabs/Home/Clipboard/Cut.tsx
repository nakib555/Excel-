import React from 'react';
import { Scissors } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Cut = () => (
  <RibbonButton variant="small" icon={<Scissors size={14} className="text-slate-500" />} label="Cut" onClick={() => {}} />
);

export default Cut;

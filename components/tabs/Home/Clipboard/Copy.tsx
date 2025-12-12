import React from 'react';
import { Copy as CopyIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface CopyProps {
  onCopy?: () => void;
}

const Copy: React.FC<CopyProps> = ({ onCopy }) => (
  <RibbonButton variant="small" icon={<CopyIcon size={14} className="text-slate-500" />} label="Copy" onClick={onCopy || (() => {})} />
);

export default Copy;
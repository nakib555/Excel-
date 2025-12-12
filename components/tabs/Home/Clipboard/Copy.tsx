import React from 'react';
import { Copy as CopyIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Copy = () => (
  <RibbonButton variant="small" icon={<CopyIcon size={14} className="text-slate-500" />} label="Copy" onClick={() => {}} />
);

export default Copy;

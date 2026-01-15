
import React from 'react';
import { Paintbrush } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Format = () => (
  <RibbonButton variant="small" icon={<Paintbrush size={14} className="text-orange-500" />} label="Format" onClick={() => {}} title="Format Painter" />
);

export default Format;

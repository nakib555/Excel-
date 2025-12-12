import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Paste from './Paste';
import Cut from './Cut';
import Copy from './Copy';
import Format from './Format';

const ClipboardGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Clipboard">
        <Paste />
        <div className="flex flex-col gap-0 justify-center">
            <Cut />
            <Copy />
            <Format />
        </div>
    </RibbonGroup>
  );
};

export default ClipboardGroup;

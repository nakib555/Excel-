import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Paste from './Paste';
import Cut from './Cut';
import Copy from './Copy';
import Format from './Format';

const ClipboardGroup: React.FC<TabProps> = ({ onCopy, onCut, onPaste }) => {
  return (
    <RibbonGroup label="Clipboard">
        <Paste onPaste={onPaste} />
        <div className="flex flex-col gap-0 justify-center">
            <Cut onCut={onCut} />
            <Copy onCopy={onCopy} />
            <Format />
        </div>
    </RibbonGroup>
  );
};

export default ClipboardGroup;
import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import TextBox from './TextBox';
import Symbols from './Symbols';

const TextSymbolsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Text & Symbols" className="border-r-0">
        <div className="flex gap-1 h-full items-center">
            <TextBox />
            <Symbols />
        </div>
    </RibbonGroup>
  );
};

export default TextSymbolsGroup;

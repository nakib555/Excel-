import React from 'react';
import { RibbonGroup } from '../../../shared';
import NameManager from './NameManager';
import DefineName from './DefineName';
import UseInFormula from './UseInFormula';
import CreateFromSelection from './CreateFromSelection';

const DefinedNamesGroup = () => (
    <RibbonGroup label="Defined Names">
        <div className="flex items-center gap-1 h-full">
            <NameManager />
            <div className="flex flex-col gap-0 justify-center">
                <DefineName />
                <UseInFormula />
                <CreateFromSelection />
            </div>
        </div>
    </RibbonGroup>
);

export default DefinedNamesGroup;
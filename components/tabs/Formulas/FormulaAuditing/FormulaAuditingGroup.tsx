import React from 'react';
import { RibbonGroup } from '../../../shared';
import TracePrecedents from './TracePrecedents';
import TraceDependents from './TraceDependents';
import RemoveArrows from './RemoveArrows';
import ShowFormulas from './ShowFormulas';
import ErrorChecking from './ErrorChecking';
import EvaluateFormula from './EvaluateFormula';
import WatchWindow from './WatchWindow';

const FormulaAuditingGroup = () => (
    <RibbonGroup label="Formula Auditing">
        <div className="flex items-center gap-1 h-full">
            <div className="flex flex-col gap-0 justify-center">
                <TracePrecedents />
                <TraceDependents />
                <RemoveArrows />
            </div>
            <div className="flex flex-col gap-0 justify-center">
                <ShowFormulas />
                <ErrorChecking />
                <EvaluateFormula />
            </div>
            <WatchWindow />
        </div>
    </RibbonGroup>
);

export default FormulaAuditingGroup;
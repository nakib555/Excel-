import React from 'react';
import { RibbonGroup } from '../../../shared';
import RefreshAll from './RefreshAll';
import QueriesConnections from './QueriesConnections';
import Properties from './Properties';
import EditLinks from './EditLinks';

const QueriesConnectionsGroup = () => (
    <RibbonGroup label="Queries & Connections">
        <div className="flex items-center gap-1 h-full">
            <RefreshAll />
            <div className="flex flex-col gap-0 justify-center">
                <QueriesConnections />
                <Properties />
                <EditLinks />
            </div>
        </div>
    </RibbonGroup>
);

export default QueriesConnectionsGroup;
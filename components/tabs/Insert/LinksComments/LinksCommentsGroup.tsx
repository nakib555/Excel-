import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Link from './Link';
import Comment from './Comment';

const LinksCommentsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Links & Comments">
        <div className="flex gap-1 h-full items-center">
            <Link />
            <Comment />
        </div>
    </RibbonGroup>
  );
};

export default LinksCommentsGroup;

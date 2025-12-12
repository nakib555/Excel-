import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { RibbonGroup, TabProps } from '../shared';

import Spelling from './Proofing/Spelling';
import Thesaurus from './Proofing/Thesaurus';
import WorkbookStatistics from './Proofing/WorkbookStatistics';

import CheckPerformance from './Performance/CheckPerformance';
import CheckAccessibility from './Accessibility/CheckAccessibility';
import Translate from './Language/Translate';

import NewComment from './Comments/NewComment';
import DeleteComment from './Comments/DeleteComment';
import PrevComment from './Comments/PrevComment';
import NextComment from './Comments/NextComment';
import ShowComments from './Comments/ShowComments';

import ProtectSheet from './Protect/ProtectSheet';
import ProtectWorkbook from './Protect/ProtectWorkbook';
import AllowEditRanges from './Protect/AllowEditRanges';
import UnshareWorkbook from './Protect/UnshareWorkbook';

import HideInk from './Ink/HideInk';

const ReviewTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Proofing">
             <div className="flex items-center gap-1 h-full">
                 <Spelling />
                 <Thesaurus />
                 <WorkbookStatistics />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Performance">
             <CheckPerformance />
        </RibbonGroup>

        <RibbonGroup label="Accessibility">
             <CheckAccessibility />
        </RibbonGroup>

        <RibbonGroup label="Language">
             <Translate />
        </RibbonGroup>
        
         <RibbonGroup label="Comments">
             <div className="flex items-center gap-1 h-full">
                 <NewComment />
                 <div className="flex flex-col gap-0 justify-center">
                     <DeleteComment />
                     <PrevComment />
                     <NextComment />
                 </div>
                 <ShowComments />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Protect">
            <div className="flex items-center gap-1 h-full">
                <ProtectSheet />
                <ProtectWorkbook />
                <AllowEditRanges />
                <UnshareWorkbook />
            </div>
        </RibbonGroup>
        
         <RibbonGroup label="Ink">
             <HideInk />
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(ReviewTab);
import React from 'react';
import { BookOpen } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const RecentlyUsed = () => (
    <RibbonButton variant="large" icon={<BookOpen size={18} className="text-amber-500" />} label="Recently" subLabel="Used" hasDropdown onClick={() => {}} />
);

export default RecentlyUsed;
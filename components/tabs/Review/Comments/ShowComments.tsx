import React from 'react';
import { MessageSquare } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const ShowComments = () => (
    <RibbonButton variant="large" icon={<MessageSquare size={20} className="text-yellow-500" />} label="Show" subLabel="Comments" onClick={() => {}} />
);

export default ShowComments;
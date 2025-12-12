import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const NewComment = () => (
    <RibbonButton variant="large" icon={<MessageSquarePlus size={20} className="text-green-600" />} label="New" subLabel="Comment" onClick={() => {}} />
);

export default NewComment;
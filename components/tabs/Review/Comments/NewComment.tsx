
import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { RibbonButton } from '../../../shared';

interface NewCommentProps {
    onInsertComment?: () => void;
}

const NewComment: React.FC<NewCommentProps> = ({ onInsertComment }) => (
    <RibbonButton 
        variant="large" 
        icon={<MessageSquarePlus size={20} className="text-green-600" />} 
        label="New" 
        subLabel="Comment" 
        onClick={onInsertComment || (() => {})} 
    />
);

export default NewComment;

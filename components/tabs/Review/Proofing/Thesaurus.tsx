import React from 'react';
import { Book } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Thesaurus = () => (
    <RibbonButton variant="large" icon={<Book size={20} className="text-orange-600" />} label="Thesaurus" onClick={() => {}} />
);

export default Thesaurus;
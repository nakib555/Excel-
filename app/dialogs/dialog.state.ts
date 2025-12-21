
import { useState } from 'react';
import { ValidationRule } from '../../types';

export const useDialogState = () => {
  const [showMobileResize, setShowMobileResize] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showFormatCells, setShowFormatCells] = useState(false);
  const [showMergeStyles, setShowMergeStyles] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [createTableState, setCreateTableState] = useState<{ isOpen: boolean, preset: any | null, range: string }>({ isOpen: false, preset: null, range: '' });
  const [formatDialogTab, setFormatDialogTab] = useState('Number');
  const [findReplaceState, setFindReplaceState] = useState<{ open: boolean, mode: 'find' | 'replace' | 'goto' }>({ open: false, mode: 'find' });
  const [dataValidationState, setDataValidationState] = useState<{ isOpen: boolean, rule: ValidationRule | null, cellId: string | null }>({ isOpen: false, rule: null, cellId: null });
  const [commentDialogState, setCommentDialogState] = useState<{ isOpen: boolean, cellId: string | null, initialText: string }>({ isOpen: false, cellId: null, initialText: '' });

  const handleOpenFormatDialog = (tab?: string) => { 
      setFormatDialogTab(tab || 'Number'); 
      setShowFormatCells(true); 
  };

  return {
    showMobileResize, setShowMobileResize,
    showAI, setShowAI,
    showFormatCells, setShowFormatCells,
    showMergeStyles, setShowMergeStyles,
    showHistory, setShowHistory,
    createTableState, setCreateTableState,
    formatDialogTab, setFormatDialogTab,
    findReplaceState, setFindReplaceState,
    dataValidationState, setDataValidationState,
    commentDialogState, setCommentDialogState,
    handleOpenFormatDialog
  };
};
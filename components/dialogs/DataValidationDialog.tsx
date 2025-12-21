
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ValidationRule, ValidationType, ValidationOperator } from '../../types';
import ModernSelect from './formatCells/ModernSelect';
import { cn } from '../../utils';

interface DataValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialRule: ValidationRule | null;
  onSave: (rule: ValidationRule | null) => void;
}

const VALIDATION_TYPES: { value: ValidationType; label: string }[] = [
    { value: 'list', label: 'List' },
    { value: 'whole', label: 'Whole number' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'textLength', label: 'Text length' },
    { value: 'custom', label: 'Custom' },
];

const OPERATORS: { value: ValidationOperator; label: string }[] = [
    { value: 'between', label: 'between' },
    { value: 'notBetween', label: 'not between' },
    { value: 'equal', label: 'equal to' },
    { value: 'notEqual', label: 'not equal to' },
    { value: 'greaterThan', label: 'greater than' },
    { value: 'lessThan', label: 'less than' },
    { value: 'greaterThanOrEqual', label: 'greater than or equal to' },
    { value: 'lessThanOrEqual', label: 'less than or equal to' },
];

const DataValidationDialog: React.FC<DataValidationDialogProps> = ({ isOpen, onClose, initialRule, onSave }) => {
    const [activeTab, setActiveTab] = useState<'settings' | 'error'>('settings');
    const [type, setType] = useState<ValidationType>('list');
    const [operator, setOperator] = useState<ValidationOperator>('between');
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [allowBlank, setAllowBlank] = useState(true);
    const [showError, setShowError] = useState(true);
    const [errorTitle, setErrorTitle] = useState('Invalid Data');
    const [errorMessage, setErrorMessage] = useState('The value you entered is not valid.');

    useEffect(() => {
        if (isOpen) {
            if (initialRule) {
                setType(initialRule.type);
                setOperator(initialRule.operator || 'between');
                setValue1(initialRule.value1 || '');
                setValue2(initialRule.value2 || '');
                setAllowBlank(initialRule.allowBlank !== false);
                setShowError(initialRule.showErrorMessage !== false);
                setErrorTitle(initialRule.errorTitle || 'Invalid Data');
                setErrorMessage(initialRule.errorMessage || 'The value you entered is not valid.');
            } else {
                // Reset defaults
                setType('list');
                setOperator('between');
                setValue1('');
                setValue2('');
                setAllowBlank(true);
                setShowError(true);
                setErrorTitle('Invalid Data');
                setErrorMessage('The value you entered is not valid.');
            }
            setActiveTab('settings');
        }
    }, [isOpen, initialRule]);

    const handleSave = () => {
        // If type is 'any value' (we treat empty type or 'any' as null rule in this simplified UI logic),
        // but here we just have validation types. If user wants to clear, they can click "Clear All".
        
        const rule: ValidationRule = {
            type,
            operator: type === 'list' || type === 'custom' ? undefined : operator,
            value1,
            value2: (operator === 'between' || operator === 'notBetween') ? value2 : undefined,
            allowBlank,
            showErrorMessage: showError,
            errorTitle,
            errorMessage
        };
        onSave(rule);
        onClose();
    };

    const handleClear = () => {
        onSave(null);
        onClose();
    };

    if (!isOpen) return null;

    const showOperator = type !== 'list' && type !== 'custom';
    const showValue2 = showOperator && (operator === 'between' || operator === 'notBetween');

    return (
        <div className="fixed inset-0 z-[2002] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-[420px] shadow-2xl rounded-2xl flex flex-col overflow-hidden ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                                    <ShieldCheck size={16} strokeWidth={2.5} />
                                </div>
                                <span className="text-[15px] font-bold text-slate-800 tracking-tight">Data Validation</span>
                            </div>
                            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-5 pt-4 gap-4 border-b border-slate-100">
                            <button 
                                onClick={() => setActiveTab('settings')}
                                className={cn(
                                    "pb-3 text-sm font-semibold transition-all relative",
                                    activeTab === 'settings' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Settings
                                {activeTab === 'settings' && <motion.div layoutId="dv-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
                            </button>
                            <button 
                                onClick={() => setActiveTab('error')}
                                className={cn(
                                    "pb-3 text-sm font-semibold transition-all relative",
                                    activeTab === 'error' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Error Alert
                                {activeTab === 'error' && <motion.div layoutId="dv-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 h-[320px] overflow-y-auto">
                            {activeTab === 'settings' ? (
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Allow</label>
                                        <ModernSelect 
                                            value={type} 
                                            onChange={(val) => setType(val)} 
                                            options={VALIDATION_TYPES} 
                                        />
                                    </div>

                                    {showOperator && (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Data</label>
                                            <ModernSelect 
                                                value={operator} 
                                                onChange={(val) => setOperator(val)} 
                                                options={OPERATORS} 
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                                            {type === 'list' ? 'Source (comma-separated)' : 
                                             type === 'custom' ? 'Formula' : 
                                             (operator === 'between' ? 'Minimum' : 'Value')}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={value1}
                                            onChange={(e) => setValue1(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-slate-800"
                                            placeholder={type === 'list' ? 'Yes,No,Maybe' : ''}
                                        />
                                    </div>

                                    {showValue2 && (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Maximum</label>
                                            <input 
                                                type="text" 
                                                value={value2}
                                                onChange={(e) => setValue2(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-slate-800"
                                            />
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={allowBlank} 
                                                onChange={(e) => setAllowBlank(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-slate-700">Ignore blank</span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    <label className="flex items-center gap-3 cursor-pointer select-none border-b border-slate-100 pb-4">
                                        <input 
                                            type="checkbox" 
                                            checked={showError} 
                                            onChange={(e) => setShowError(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-slate-700 font-medium">Show error alert after invalid data is entered</span>
                                    </label>

                                    <div className={cn("flex flex-col gap-5 transition-opacity", !showError && "opacity-50 pointer-events-none")}>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                <AlertTriangle size={32} className="text-amber-500" />
                                            </div>
                                            <div className="flex-1 flex flex-col gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
                                                    <input 
                                                        type="text" 
                                                        value={errorTitle}
                                                        onChange={(e) => setErrorTitle(e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Error Message</label>
                                                    <textarea 
                                                        value={errorMessage}
                                                        onChange={(e) => setErrorMessage(e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800 resize-none h-20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-t border-slate-100">
                            <button 
                                onClick={handleClear}
                                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Clear All
                            </button>
                            <div className="flex gap-3">
                                <button 
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DataValidationDialog;

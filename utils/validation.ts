
import { ValidationRule } from '../types';

// Helper to parse "HH:MM:SS AM/PM" or "HH:MM" into minutes from midnight
const parseTime = (timeStr: string): number | null => {
    if (!timeStr) return null;
    
    // Normalize input
    const normalized = timeStr.trim().toLowerCase();
    
    // Check for AM/PM
    const isPM = normalized.includes('pm');
    const isAM = normalized.includes('am');
    const is12Hour = isPM || isAM;
    
    // Remove AM/PM for parsing digits
    const cleanTime = normalized.replace(/[a-z\s]/g, '');
    
    // Try matching HH:MM:SS or HH:MM
    const parts = cleanTime.split(':');
    
    if (parts.length < 2 || parts.length > 3) return null;
    
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    let s = parts[2] ? parseInt(parts[2], 10) : 0;
    
    if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
    
    // Validate ranges
    if (m < 0 || m > 59 || s < 0 || s > 59) return null;
    if (is12Hour) {
        if (h < 1 || h > 12) return null;
        if (isPM && h !== 12) h += 12;
        if (isAM && h === 12) h = 0;
    } else {
        if (h < 0 || h > 23) return null;
    }
    
    return h * 60 + m + (s / 60);
};

export const validateCellValue = (value: string, rule: ValidationRule): boolean => {
    // If empty and blank is allowed, return true immediately
    if (value === '' || value === null || value === undefined) {
        return rule.allowBlank !== false; 
    }

    const num = parseFloat(value);
    const isNum = !isNaN(num) && isFinite(num);

    switch (rule.type) {
        case 'list':
            const options = rule.value1.split(',').map(s => s.trim());
            // Case-insensitive match for list options usually better for UX
            return options.some(opt => opt.toLowerCase() === value.toLowerCase());
        
        case 'whole':
            if (!isNum) return false;
            if (!Number.isInteger(num)) return false;
            return checkNumber(num, rule.operator, parseFloat(rule.value1), rule.value2 ? parseFloat(rule.value2) : undefined);
        
        case 'decimal':
            if (!isNum) return false;
            return checkNumber(num, rule.operator, parseFloat(rule.value1), rule.value2 ? parseFloat(rule.value2) : undefined);
        
        case 'textLength':
            return checkNumber(value.length, rule.operator, parseFloat(rule.value1), rule.value2 ? parseFloat(rule.value2) : undefined);
        
        case 'date':
             const date = Date.parse(value);
             if (isNaN(date)) return false;
             
             // Try to parse rule values as dates
             const d1 = Date.parse(rule.value1);
             if (isNaN(d1)) return true; // Configuration error, allow input
             
             const d2 = rule.value2 ? Date.parse(rule.value2) : undefined;
             
             return checkNumber(date, rule.operator, d1, d2);
             
        case 'time':
            const timeVal = parseTime(value);
            if (timeVal === null) return false;
            
            const t1 = parseTime(rule.value1);
            if (t1 === null) return true; // Config error
            
            const t2 = rule.value2 ? parseTime(rule.value2) : undefined;
            
            return checkNumber(timeVal, rule.operator, t1, t2);
            
        case 'custom':
            // Custom formula validation requires evaluator context (cells), 
            // which we might not have here easily. 
            // For now, custom validation is permissive in this pure utility.
            // Real implementation would happen in App.tsx using the evaluator.
            return true; 
            
        default:
            return true;
    }
};

const checkNumber = (val: number, op: string | undefined, v1: number, v2?: number): boolean => {
    switch (op) {
        case 'between': return val >= v1 && (v2 !== undefined ? val <= v2 : true);
        case 'notBetween': return val < v1 || (v2 !== undefined ? val > v2 : false);
        case 'equal': return val === v1;
        case 'notEqual': return val !== v1;
        case 'greaterThan': return val > v1;
        case 'lessThan': return val < v1;
        case 'greaterThanOrEqual': return val >= v1;
        case 'lessThanOrEqual': return val <= v1;
        default: return true; // No operator means ignore
    }
};

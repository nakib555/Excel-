
import { ValidationRule } from '../types';

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
            // Simple time validation could be complex (parsing "13:30"), for now treat as text/date check or simple existence
            // Ideally, we'd convert HH:MM to minutes from midnight for comparison
            return true; // Placeholder for robust time logic
            
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

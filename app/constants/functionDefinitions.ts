export interface FunctionDefinition {
  name: string;
  category: 'Math' | 'Statistical' | 'Text' | 'Logical' | 'Date' | 'Lookup';
  syntax: string;
  description: string;
  params: string[];
  minArgs: number;
}

export const FUNCTION_DEFINITIONS: Record<string, FunctionDefinition> = {
  // Math & Trig
  SUM: {
    name: 'SUM',
    category: 'Math',
    syntax: 'SUM(number1, [number2], ...)',
    description: 'Adds all the numbers in a range of cells.',
    params: ['number1', '[number2]', '...'],
    minArgs: 1
  },
  SUMIF: {
    name: 'SUMIF',
    category: 'Math',
    syntax: 'SUMIF(range, criteria, [sum_range])',
    description: 'Adds the cells specified by a given condition or criteria.',
    params: ['range', 'criteria', '[sum_range]'],
    minArgs: 2
  },
  SUMIFS: {
    name: 'SUMIFS',
    category: 'Math',
    syntax: 'SUMIFS(sum_range, criteria_range1, criteria1, ...)',
    description: 'Adds the cells in a range that meet multiple criteria.',
    params: ['sum_range', 'criteria_range1', 'criteria1', '...'],
    minArgs: 3
  },
  ROUND: {
    name: 'ROUND',
    category: 'Math',
    syntax: 'ROUND(number, num_digits)',
    description: 'Rounds a number to a specified number of digits.',
    params: ['number', 'num_digits'],
    minArgs: 2
  },
  ROUNDUP: {
    name: 'ROUNDUP',
    category: 'Math',
    syntax: 'ROUNDUP(number, num_digits)',
    description: 'Rounds a number up, away from 0 (zero).',
    params: ['number', 'num_digits'],
    minArgs: 2
  },
  ROUNDDOWN: {
    name: 'ROUNDDOWN',
    category: 'Math',
    syntax: 'ROUNDDOWN(number, num_digits)',
    description: 'Rounds a number down, toward 0 (zero).',
    params: ['number', 'num_digits'],
    minArgs: 2
  },
  ABS: {
    name: 'ABS',
    category: 'Math',
    syntax: 'ABS(number)',
    description: 'Returns the absolute value of a number (without its sign).',
    params: ['number'],
    minArgs: 1
  },
  SQRT: {
    name: 'SQRT',
    category: 'Math',
    syntax: 'SQRT(number)',
    description: 'Returns the positive square root of a number.',
    params: ['number'],
    minArgs: 1
  },
  POWER: {
    name: 'POWER',
    category: 'Math',
    syntax: 'POWER(number, power)',
    description: 'Returns the result of a number raised to a given power.',
    params: ['number', 'power'],
    minArgs: 2
  },
  MOD: {
    name: 'MOD',
    category: 'Math',
    syntax: 'MOD(number, divisor)',
    description: 'Returns the remainder after a number is divided by a divisor.',
    params: ['number', 'divisor'],
    minArgs: 2
  },
  RAND: {
    name: 'RAND',
    category: 'Math',
    syntax: 'RAND()',
    description: 'Returns an evenly distributed random real number greater than or equal to 0 and less than 1.',
    params: [],
    minArgs: 0
  },
  RANDBETWEEN: {
    name: 'RANDBETWEEN',
    category: 'Math',
    syntax: 'RANDBETWEEN(bottom, top)',
    description: 'Returns a random integer number between the numbers you specify.',
    params: ['bottom', 'top'],
    minArgs: 2
  },

  // Statistical
  AVERAGE: {
    name: 'AVERAGE',
    category: 'Statistical',
    syntax: 'AVERAGE(number1, [number2], ...)',
    description: 'Returns the average (arithmetic mean) of the arguments.',
    params: ['number1', '[number2]', '...'],
    minArgs: 1
  },
  AVERAGEIF: {
    name: 'AVERAGEIF',
    category: 'Statistical',
    syntax: 'AVERAGEIF(range, criteria, [average_range])',
    description: 'Returns the average (arithmetic mean) of all the cells in a range that meet a given condition.',
    params: ['range', 'criteria', '[average_range]'],
    minArgs: 2
  },
  COUNT: {
    name: 'COUNT',
    category: 'Statistical',
    syntax: 'COUNT(value1, [value2], ...)',
    description: 'Counts how many numbers are in the list of arguments.',
    params: ['value1', '[value2]', '...'],
    minArgs: 1
  },
  COUNTA: {
    name: 'COUNTA',
    category: 'Statistical',
    syntax: 'COUNTA(value1, [value2], ...)',
    description: 'Counts the number of cells that are not empty in a range.',
    params: ['value1', '[value2]', '...'],
    minArgs: 1
  },
  COUNTIF: {
    name: 'COUNTIF',
    category: 'Statistical',
    syntax: 'COUNTIF(range, criteria)',
    description: 'Counts the number of cells within a range that meet the given condition.',
    params: ['range', 'criteria'],
    minArgs: 2
  },
  COUNTIFS: {
    name: 'COUNTIFS',
    category: 'Statistical',
    syntax: 'COUNTIFS(criteria_range1, criteria1, ...)',
    description: 'Counts the number of cells specified by a given set of conditions or criteria.',
    params: ['criteria_range1', 'criteria1', '...'],
    minArgs: 2
  },
  MAX: {
    name: 'MAX',
    category: 'Statistical',
    syntax: 'MAX(number1, [number2], ...)',
    description: 'Returns the largest value in a set of values.',
    params: ['number1', '[number2]', '...'],
    minArgs: 1
  },
  MIN: {
    name: 'MIN',
    category: 'Statistical',
    syntax: 'MIN(number1, [number2], ...)',
    description: 'Returns the smallest number in a set of values.',
    params: ['number1', '[number2]', '...'],
    minArgs: 1
  },

  // Logical
  IF: {
    name: 'IF',
    category: 'Logical',
    syntax: 'IF(logical_test, value_if_true, [value_if_false])',
    description: 'Specifies a logical test to perform and returns one value for TRUE and another for FALSE.',
    params: ['logical_test', 'value_if_true', '[value_if_false]'],
    minArgs: 2
  },
  IFS: {
    name: 'IFS',
    category: 'Logical',
    syntax: 'IFS(logical_test1, value_if_true1, ...)',
    description: 'Checks whether one or more conditions are met and returns a value that corresponds to the first TRUE condition.',
    params: ['logical_test1', 'value_if_true1', '...'],
    minArgs: 2
  },
  IFERROR: {
    name: 'IFERROR',
    category: 'Logical',
    syntax: 'IFERROR(value, value_if_error)',
    description: 'Returns a value you specify if a formula evaluates to an error; otherwise, returns the result of the formula.',
    params: ['value', 'value_if_error'],
    minArgs: 2
  },
  AND: {
    name: 'AND',
    category: 'Logical',
    syntax: 'AND(logical1, [logical2], ...)',
    description: 'Checks whether all arguments are TRUE, and returns TRUE if all arguments are TRUE.',
    params: ['logical1', '[logical2]', '...'],
    minArgs: 1
  },
  OR: {
    name: 'OR',
    category: 'Logical',
    syntax: 'OR(logical1, [logical2], ...)',
    description: 'Checks whether any of the arguments are TRUE, and returns TRUE or FALSE. Returns FALSE only if all arguments are FALSE.',
    params: ['logical1', '[logical2]', '...'],
    minArgs: 1
  },
  NOT: {
    name: 'NOT',
    category: 'Logical',
    syntax: 'NOT(logical)',
    description: 'Reverses the value of its argument. Changes FALSE to TRUE, or TRUE to FALSE.',
    params: ['logical'],
    minArgs: 1
  },
  TRUE: {
    name: 'TRUE',
    category: 'Logical',
    syntax: 'TRUE()',
    description: 'Returns the logical value TRUE.',
    params: [],
    minArgs: 0
  },
  FALSE: {
    name: 'FALSE',
    category: 'Logical',
    syntax: 'FALSE()',
    description: 'Returns the logical value FALSE.',
    params: [],
    minArgs: 0
  },

  // Lookup & Reference
  VLOOKUP: {
    name: 'VLOOKUP',
    category: 'Lookup',
    syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    description: 'Looks for a value in the leftmost column of a table, and returns a value in the same row from a specified column.',
    params: ['lookup_value', 'table_array', 'col_index_num', '[range_lookup]'],
    minArgs: 3
  },
  HLOOKUP: {
    name: 'HLOOKUP',
    category: 'Lookup',
    syntax: 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])',
    description: 'Looks for a value in the top row of a table or array of values and returns the value in the same column for a specified row.',
    params: ['lookup_value', 'table_array', 'row_index_num', '[range_lookup]'],
    minArgs: 3
  },
  XLOOKUP: {
    name: 'XLOOKUP',
    category: 'Lookup',
    syntax: 'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    description: 'Searches a range or an array for a match and returns the corresponding item from a second range or array.',
    params: ['lookup_value', 'lookup_array', 'return_array', '[if_not_found]', '[match_mode]', '[search_mode]'],
    minArgs: 3
  },
  INDEX: {
    name: 'INDEX',
    category: 'Lookup',
    syntax: 'INDEX(array, row_num, [column_num])',
    description: 'Returns the value of a cell in a table based on the row and column numbers you specify.',
    params: ['array', 'row_num', '[column_num]'],
    minArgs: 2
  },
  MATCH: {
    name: 'MATCH',
    category: 'Lookup',
    syntax: 'MATCH(lookup_value, lookup_array, [match_type])',
    description: 'Returns the relative position of an item in an array that matches a specified value in a specified order.',
    params: ['lookup_value', 'lookup_array', '[match_type]'],
    minArgs: 2
  },

  // Text
  CONCATENATE: {
    name: 'CONCATENATE',
    category: 'Text',
    syntax: 'CONCATENATE(text1, [text2], ...)',
    description: 'Joins several text strings into one text string.',
    params: ['text1', '[text2]', '...'],
    minArgs: 1
  },
  LEFT: {
    name: 'LEFT',
    category: 'Text',
    syntax: 'LEFT(text, [num_chars])',
    description: 'Returns the specified number of characters from the start of a text string.',
    params: ['text', '[num_chars]'],
    minArgs: 1
  },
  RIGHT: {
    name: 'RIGHT',
    category: 'Text',
    syntax: 'RIGHT(text, [num_chars])',
    description: 'Returns the specified number of characters from the end of a text string.',
    params: ['text', '[num_chars]'],
    minArgs: 1
  },
  MID: {
    name: 'MID',
    category: 'Text',
    syntax: 'MID(text, start_num, num_chars)',
    description: 'Returns a specific number of characters from a text string, starting at the position you specify.',
    params: ['text', 'start_num', 'num_chars'],
    minArgs: 3
  },
  LEN: {
    name: 'LEN',
    category: 'Text',
    syntax: 'LEN(text)',
    description: 'Returns the number of characters in a text string.',
    params: ['text'],
    minArgs: 1
  },
  TRIM: {
    name: 'TRIM',
    category: 'Text',
    syntax: 'TRIM(text)',
    description: 'Removes all spaces from text except for single spaces between words.',
    params: ['text'],
    minArgs: 1
  },
  UPPER: {
    name: 'UPPER',
    category: 'Text',
    syntax: 'UPPER(text)',
    description: 'Converts all letters in a text string to uppercase.',
    params: ['text'],
    minArgs: 1
  },
  LOWER: {
    name: 'LOWER',
    category: 'Text',
    syntax: 'LOWER(text)',
    description: 'Converts all letters in a text string to lowercase.',
    params: ['text'],
    minArgs: 1
  },
  PROPER: {
    name: 'PROPER',
    category: 'Text',
    syntax: 'PROPER(text)',
    description: 'Capitalizes the first letter in each word of a text value.',
    params: ['text'],
    minArgs: 1
  },
  TEXT: {
    name: 'TEXT',
    category: 'Text',
    syntax: 'TEXT(value, format_text)',
    description: 'Converts a value to text in a specific number format.',
    params: ['value', 'format_text'],
    minArgs: 2
  },

  // Date & Time
  TODAY: {
    name: 'TODAY',
    category: 'Date',
    syntax: 'TODAY()',
    description: 'Returns the serial number of the current date.',
    params: [],
    minArgs: 0
  },
  NOW: {
    name: 'NOW',
    category: 'Date',
    syntax: 'NOW()',
    description: 'Returns the current date and time formatted as a date and time.',
    params: [],
    minArgs: 0
  },
  DATE: {
    name: 'DATE',
    category: 'Date',
    syntax: 'DATE(year, month, day)',
    description: 'Returns the sequential serial number that represents a particular date.',
    params: ['year', 'month', 'day'],
    minArgs: 3
  },
  YEAR: {
    name: 'YEAR',
    category: 'Date',
    syntax: 'YEAR(serial_number)',
    description: 'Returns the year corresponding to a date. The year is given as an integer in the range 1900-9999.',
    params: ['serial_number'],
    minArgs: 1
  },
  MONTH: {
    name: 'MONTH',
    category: 'Date',
    syntax: 'MONTH(serial_number)',
    description: 'Returns the month of a date represented by a serial number. The month is given as an integer from 1 to 12.',
    params: ['serial_number'],
    minArgs: 1
  },
  DAY: {
    name: 'DAY',
    category: 'Date',
    syntax: 'DAY(serial_number)',
    description: 'Returns the day of the month, a number from 1 to 31.',
    params: ['serial_number'],
    minArgs: 1
  },

  // Dynamic Array
  UNIQUE: {
    name: 'UNIQUE',
    category: 'Lookup',
    syntax: 'UNIQUE(array, [by_col], [exactly_once])',
    description: 'Returns a list of unique values in a list or range.',
    params: ['array', '[by_col]', '[exactly_once]'],
    minArgs: 1
  },
  SORT: {
    name: 'SORT',
    category: 'Lookup',
    syntax: 'SORT(array, [sort_index], [sort_order], [by_col])',
    description: 'Sorts the contents of a range or array.',
    params: ['array', '[sort_index]', '[sort_order]', '[by_col]'],
    minArgs: 1
  },
  FILTER: {
    name: 'FILTER',
    category: 'Lookup',
    syntax: 'FILTER(array, include, [if_empty])',
    description: 'Filters a range of data based on criteria you define.',
    params: ['array', 'include', '[if_empty]'],
    minArgs: 2
  }
};

export const FUNCTION_NAMES = Object.keys(FUNCTION_DEFINITIONS).sort();

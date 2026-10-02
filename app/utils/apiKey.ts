
export const getApiKey = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
      }
      if (import.meta.env.VITE_API_KEY) {
        return import.meta.env.VITE_API_KEY;
      }
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    }
  } catch (e) {
    return '';
  }
  return '';
};

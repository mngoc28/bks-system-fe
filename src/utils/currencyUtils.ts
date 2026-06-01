/**
 * Utility for formatting and parsing currency inputs.
 * Specifically designed for real-time input formatting in forms.
 */

/**
 * Formats a raw input value into a thousands-separated string using dots.
 * This is suitable for display in an input field.
 * 
 * Example: 
 * formatCurrencyInput("1000000") -> "1.000.000"
 * formatCurrencyInput(5000) -> "5.000"
 * 
 * @param value The value to format (string or number)
 * @returns A formatted string with dots
 */
export const formatCurrencyInput = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '';

  let intValue: number;
  if (typeof value === 'number') {
    intValue = Math.round(value);
  } else {
    const trimmed = value.trim();
    if (/^\d+\.\d+$/.test(trimmed)) {
      intValue = Math.round(parseFloat(trimmed));
    } else {
      intValue = parseCurrencyValue(trimmed);
    }
  }

  if (!Number.isFinite(intValue)) return '';

  return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parses a formatted currency string (with dots) back into a raw numeric value.
 * Use this before saving the value to your state or submitting to the database.
 * 
 * Example:
 * parseCurrencyValue("1.000.000") -> 1000000
 * 
 * @param formattedValue The string with separators
 * @returns The raw integer value
 */
export const parseCurrencyValue = (formattedValue: string | undefined | null): number => {
  if (!formattedValue) return 0;
  
  // Remove all non-digits (like dots, spaces, or currency symbols)
  const cleanedValue = formattedValue.toString().replace(/\D/g, '');
  
  // Convert to integer
  return cleanedValue ? parseInt(cleanedValue, 10) : 0;
};

/**
 * A combined helper for handling mask input in standard React onChange handlers.
 * Useful when you want to update state with the raw numeric value while displaying formatted text.
 */
export const handleCurrencyInputChange = (
  e: React.ChangeEvent<HTMLInputElement>, 
  callback: (rawValue: number) => void
) => {
  const formattedValue = formatCurrencyInput(e.target.value);
  const rawValue = parseCurrencyValue(formattedValue);
  
  // Update the input field display value directly or through state
  e.target.value = formattedValue;
  
  // Execute callback with raw numeric value for your state/API
  callback(rawValue);
};

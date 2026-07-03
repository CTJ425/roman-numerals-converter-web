/**
 * Roman Numeral <=> Arabic Numeral conversion utilities
 */

const ROMAN_MAP = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I']
];

const CHAR_MAP = {
  'M': 1000,
  'D': 500,
  'C': 100,
  'L': 50,
  'X': 10,
  'V': 5,
  'I': 1
};

// Regex to validate standard Roman numerals between 1 and 3999
// Note: This regex matches empty string, so we must validate non-emptiness separately.
const ROMAN_REGEX = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

/**
 * Converts an Arabic numeral to a Roman numeral.
 * @param {number|string} num - The Arabic numeral (integer between 1 and 3999).
 * @returns {string|null} The Roman numeral string, or null if input is invalid.
 */
export function arabicToRoman(num) {
  const parsed = Number(num);
  
  // Guard clause for non-integers, NaN, and range [1, 3999]
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 3999) {
    return null;
  }

  let temp = parsed;
  let result = '';

  for (const [value, roman] of ROMAN_MAP) {
    while (temp >= value) {
      result += roman;
      temp -= value;
    }
  }

  return result;
}

/**
 * Converts a Roman numeral string to an Arabic numeral.
 * @param {string} str - The Roman numeral string.
 * @returns {number|null} The Arabic numeral, or null if input is invalid.
 */
export function romanToArabic(str) {
  if (typeof str !== 'string') {
    return null;
  }

  const s = str.trim().toUpperCase();

  // Validate non-empty and standard Roman numeral structure
  if (!s || !ROMAN_REGEX.test(s)) {
    return null;
  }

  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const current = CHAR_MAP[s[i]];
    const next = CHAR_MAP[s[i + 1]];

    // If current value is less than the next, it's a subtractive case (e.g. IV, IX)
    if (next && next > current) {
      total -= current;
    } else {
      total += current;
    }
  }

  // Double check that the computed value is in range 1-3999
  if (total < 1 || total > 3999) {
    return null;
  }

  return total;
}

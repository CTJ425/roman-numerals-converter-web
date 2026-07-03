import { describe, it, expect } from 'vitest';
import { arabicToRoman, romanToArabic } from './romanNumeral';

describe('arabicToRoman', () => {
  it('should convert standard values correctly', () => {
    expect(arabicToRoman(1)).toBe('I');
    expect(arabicToRoman(5)).toBe('V');
    expect(arabicToRoman(10)).toBe('X');
    expect(arabicToRoman(50)).toBe('L');
    expect(arabicToRoman(100)).toBe('C');
    expect(arabicToRoman(500)).toBe('D');
    expect(arabicToRoman(1000)).toBe('M');
  });

  it('should convert subtractive cases correctly', () => {
    expect(arabicToRoman(4)).toBe('IV');
    expect(arabicToRoman(9)).toBe('IX');
    expect(arabicToRoman(40)).toBe('XL');
    expect(arabicToRoman(90)).toBe('XC');
    expect(arabicToRoman(400)).toBe('CD');
    expect(arabicToRoman(900)).toBe('CM');
    expect(arabicToRoman(1994)).toBe('MCMXCIV');
  });

  it('should convert boundary values correctly', () => {
    expect(arabicToRoman(1)).toBe('I');
    expect(arabicToRoman(3999)).toBe('MMMCMXCIX');
  });

  it('should return null for invalid inputs', () => {
    expect(arabicToRoman(0)).toBeNull();
    expect(arabicToRoman(4000)).toBeNull();
    expect(arabicToRoman(-1)).toBeNull();
    expect(arabicToRoman(3.5)).toBeNull();
    expect(arabicToRoman('abc')).toBeNull();
    expect(arabicToRoman(NaN)).toBeNull();
    expect(arabicToRoman(null)).toBeNull();
    expect(arabicToRoman(undefined)).toBeNull();
  });
});

describe('romanToArabic', () => {
  it('should convert standard Roman numerals correctly', () => {
    expect(romanToArabic('I')).toBe(1);
    expect(romanToArabic('V')).toBe(5);
    expect(romanToArabic('X')).toBe(10);
    expect(romanToArabic('L')).toBe(50);
    expect(romanToArabic('C')).toBe(100);
    expect(romanToArabic('D')).toBe(500);
    expect(romanToArabic('M')).toBe(1000);
  });

  it('should convert subtractive cases correctly', () => {
    expect(romanToArabic('IV')).toBe(4);
    expect(romanToArabic('IX')).toBe(9);
    expect(romanToArabic('XL')).toBe(40);
    expect(romanToArabic('XC')).toBe(90);
    expect(romanToArabic('CD')).toBe(400);
    expect(romanToArabic('CM')).toBe(900);
    expect(romanToArabic('MCMXCIV')).toBe(1994);
  });

  it('should handle lowercase and whitespace gracefully', () => {
    expect(romanToArabic('  mcmxciv  ')).toBe(1994);
    expect(romanToArabic('ix')).toBe(9);
  });

  it('should convert boundary values correctly', () => {
    expect(romanToArabic('I')).toBe(1);
    expect(romanToArabic('MMMCMXCIX')).toBe(3999);
  });

  it('should return null for invalid Roman numerals', () => {
    expect(romanToArabic('IIII')).toBeNull();
    expect(romanToArabic('VV')).toBeNull();
    expect(romanToArabic('ABC')).toBeNull();
    expect(romanToArabic('')).toBeNull();
    expect(romanToArabic('   ')).toBeNull();
    expect(romanToArabic('MMMM')).toBeNull(); // 4000
    expect(romanToArabic(10)).toBeNull();
    expect(romanToArabic(null)).toBeNull();
    expect(romanToArabic(undefined)).toBeNull();
  });
});

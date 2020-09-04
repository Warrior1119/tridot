/**
 * Constant File to maintain date and time related static values.
 */
export const DATE_PATTERN_MM_DD_YYYY = /^(0[1-9]|1[012])\/(0[1-9]|1[0-9]|2[0-9]|3[01])\/(1|2)[0-9]{3}$/;
export const DATE_PATTERN_DD_MM_YYYY = /^(0[1-9]|1[0-9]|2[0-9]|3[01])\/(0[1-9]|1[012])\/(1|2)[0-9]{3}$/;
export const PLACEHOLDER_MM_DD_YYYY = 'MM/DD/YYYY';
export const PLACEHOLDER_DD_MM_YYYY = 'DD/MM/YYYY';
export const MASK_MM_DD_YYYY = 'm0/d0/0000';
export const MASK_DD_MM_YYYY = 'd0/m0/0000';
export const DEFAULT_PREF_DATE_PATTERN = PLACEHOLDER_MM_DD_YYYY;

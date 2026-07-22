import { describe, it, expect } from '@jest/globals';
import { formatCurrency, timeAgo, countdown, slugify, getInitials, truncate } from '../lib/utils';

describe('formatCurrency', () => {
  it('formats INR correctly', () => {
    expect(formatCurrency(1234)).toContain('1,234');
  });
  it('formats large numbers', () => {
    expect(formatCurrency(1000000)).toContain('10,00,000');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for recent dates', () => {
    expect(timeAgo(new Date())).toBe('just now');
  });
  it('returns hours ago', () => {
    const date = new Date(Date.now() - 2 * 3600 * 1000);
    expect(timeAgo(date)).toBe('2 hours ago');
  });
});

describe('countdown', () => {
  it('returns "Ended" for past dates', () => {
    expect(countdown(new Date(Date.now() - 1000))).toBe('Ended');
  });
  it('returns seconds remaining', () => {
    const result = countdown(new Date(Date.now() + 30000));
    expect(result).toMatch(/^\d+s$/);
  });
});

describe('slugify', () => {
  it('converts to lowercase slug', () => {
    expect(slugify('Red Onions 500kg')).toBe('red-onions-500kg');
  });
  it('removes special chars', () => {
    expect(slugify('Fresh! Tomatoes @₹20')).toBe('fresh-tomatoes-20');
  });
});

describe('getInitials', () => {
  it('returns initials from full name', () => {
    expect(getInitials('Rajesh Kumar')).toBe('RK');
  });
  it('returns single initial', () => {
    expect(getInitials('Priya')).toBe('P');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hell…');
  });
  it('keeps short strings', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });
});

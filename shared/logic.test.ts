import { describe, it, expect } from 'vitest';
import { calculatePredictionScore } from './logic';

describe('calculatePredictionScore', () => {
  it('should return 10 points for an exact score match', () => {
    expect(calculatePredictionScore(2, 1, 2, 1)).toBe(10);
    expect(calculatePredictionScore(0, 0, 0, 0)).toBe(10);
    expect(calculatePredictionScore(1, 1, 1, 1)).toBe(10);
  });

  it('should return 5 points for matching the winner but not the exact score', () => {
    // Real: Home win (2-1)
    expect(calculatePredictionScore(1, 0, 2, 1)).toBe(5);
    expect(calculatePredictionScore(3, 0, 2, 1)).toBe(5);
    
    // Real: Away win (1-2)
    expect(calculatePredictionScore(0, 1, 1, 2)).toBe(5);
    expect(calculatePredictionScore(0, 3, 1, 2)).toBe(5);
  });

  it('should return 5 points for matching a draw but not the exact score', () => {
    // Real: Draw (1-1)
    expect(calculatePredictionScore(0, 0, 1, 1)).toBe(5);
    expect(calculatePredictionScore(2, 2, 1, 1)).toBe(5);
  });

  it('should return 0 points for an incorrect result', () => {
    // Real: Home win (2-0), Pred: Draw or Away win
    expect(calculatePredictionScore(1, 1, 2, 0)).toBe(0);
    expect(calculatePredictionScore(0, 1, 2, 0)).toBe(0);
    
    // Real: Draw (1-1), Pred: Home or Away win
    expect(calculatePredictionScore(1, 0, 1, 1)).toBe(0);
    expect(calculatePredictionScore(0, 1, 1, 1)).toBe(0);
    
    // Real: Away win (0-2), Pred: Home win or Draw
    expect(calculatePredictionScore(1, 0, 0, 2)).toBe(0);
    expect(calculatePredictionScore(1, 1, 0, 2)).toBe(0);
  });

  it('should handle large scores correctly', () => {
    expect(calculatePredictionScore(10, 0, 10, 0)).toBe(10);
    expect(calculatePredictionScore(5, 5, 4, 4)).toBe(5);
  });
});

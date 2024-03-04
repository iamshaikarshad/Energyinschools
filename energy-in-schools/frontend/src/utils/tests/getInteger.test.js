import getInteger from '../getInteger';

describe('getInteger utility tests set', () => {
  test('integer from 10 in strict mode equals 10', () => {
    expect(getInteger(10)).toBe(10);
  });

  test('integer from null is null', () => {
    expect(getInteger(null)).toBeNull();
  });

  test('integer from undefined is null', () => {
    expect(getInteger(undefined)).toBeNull();
  });

  test('integer from "10px" in strict mode is null', () => {
    expect(getInteger('10px')).toBeNull();
  });

  test('integer from "10px" in non-strict mode is 10', () => {
    expect(getInteger('10px', false)).toBe(10);
  });

  test('integer from 10.322 in strict mode is null', () => {
    expect(getInteger(10.322)).toBeNull();
  });

  test('integer from 10.25 in non-strict mode is null', () => {
    expect(getInteger(10.25, false)).toBeNull();
  });

  test('integer from "-5.3" in strict mode is null', () => {
    expect(getInteger('-5.3')).toBeNull();
  });

  test('integer from "-5.3" in non-strict mode is null', () => {
    expect(getInteger('-5.3', false)).toBeNull();
  });

  test('integer from "-5abcd7" in non-strict mode is -5', () => {
    expect(getInteger('-5abcd7', false)).toBe(-5);
  });

  test('integer from "-5.76abcd7" in non-strict mode is null', () => {
    expect(getInteger('-5.76abcd7', false)).toBeNull();
  });

  test('integer from "" in non-strict mode is null', () => {
    expect(getInteger('', false)).toBeNull();
  });
});

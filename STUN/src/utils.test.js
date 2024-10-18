import assert from 'node:assert';
import { it, describe } from 'node:test';

import {
  compose,
  splitDots,
  joinDots,
  padZeroIfOddSize,
  intToHexString,
  hexStringToBuffer,
  intToBuffer
} from './utils.js';

describe('utils', () => {
  describe('compose', () => {
    it('should apply functions in the correct order', () => {
      const input = 512 ** 2;
      const composition = [Math.sqrt, Math.log2, Math.sqrt];
      const expected = 3; // sqrt(input) = 512 -> log2(512) = 9 -> sqrt(9) = 3
      const result = compose(...composition)(input);

      assert.equal(result, expected);
    });

    it('should handle functions with different input types', () => {
      const input = '1234';
      const composition = [Number, Boolean, Array];
      const expected = [true];
      const result = compose(...composition)(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return the input unchanged when no functions are provided', () => {
      const input = { unchanged: true };
      const expected = input;
      const result = compose()(input);

      assert.equal(result, expected);
    });
  });

  describe('splitDots', () => {
    it("should return ['192', '168', '0', '1'] for input '192.168.0.1'", () => {
      const input = '192.168.0.1';
      const expected = ['192', '168', '0', '1'];
      const result = splitDots(input);

      assert.deepStrictEqual(result, expected);
    });

    it("should return ['abc', 'def'] for input 'abc.def'", () => {
      const input = 'abc.def';
      const expected = ['abc', 'def'];
      const result = splitDots(input);

      assert.deepStrictEqual(result, expected);
    });

    it("should return ['no_dots'] for input 'no_dots'", () => {
      const input = 'no_dots';
      const expected = ['no_dots'];
      const result = splitDots(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('joinDots', () => {
    it("should return '192.168.0.1' for input ['192', '168', '0', '1']", () => {
      const input = ['192', '168', '0', '1'];
      const expected = '192.168.0.1';
      const result = joinDots(input);

      assert.strictEqual(result, expected);
    });

    it("should return 'abc.def' for input ['abc', 'def']", () => {
      const input = ['abc', 'def'];
      const expected = 'abc.def';
      const result = joinDots(input);

      assert.strictEqual(result, expected);
    });

    it("should return 'single_one' for input ['single_one']", () => {
      const input = ['single_one'];
      const expected = 'single_one';
      const result = joinDots(input);

      assert.strictEqual(result, expected);
    });

    it("should return '192.168.0.1' for input [192, 168, 0, 1]", () => {
      const input = [192, 168, 0, 1];
      const expected = '192.168.0.1';
      const result = joinDots(input);

      assert.strictEqual(result, expected);
    });

    it("should return '3.17.11' for input [0b11, 0x11, 11]", () => {
      const input = [0b11, 0x11, 11];
      const expected = '3.17.11';
      const result = joinDots(input);

      assert.strictEqual(result, expected);
    });
  });

  describe('padZeroIfOddSize', () => {
    it("should return '07ca' for input '7ca'", () => {
      const input = '7ca';
      const expected = '07ca';
      const result = padZeroIfOddSize(input);

      assert.strictEqual(result, expected);
    });

    it("should return '0b11' for input 'b11'", () => {
      const input = 'b11';
      const expected = '0b11';
      const result = padZeroIfOddSize(input);

      assert.strictEqual(result, expected);
    });

    it("should return '0x1d' for input 'x1d'", () => {
      const input = 'x1d';
      const expected = '0x1d';
      const result = padZeroIfOddSize(input);

      assert.strictEqual(result, expected);
    });

    it("should return '01' for input '01'", () => {
      const input = '01';
      const expected = '01';
      const result = padZeroIfOddSize(input);

      assert.strictEqual(result, expected);
    });

    it("should return '00' for input '0'", () => {
      const input = '0';
      const expected = '00';
      const result = padZeroIfOddSize(input);

      assert.strictEqual(result, expected);
    });

    it("should return '00' for input 0", () => {
      const input = 0;
      const expected = '00';
      const result = padZeroIfOddSize(input);

      assert.strictEqual(result, expected);
    });

    it("should return '1914' for input 1914", () => {
      const input = 1914;
      const expected = '1914';
      const result = padZeroIfOddSize(input);

      assert.strictEqual(result, expected);
    });
  });

  describe('intToHexString', () => {
    it("should return '1' for input 1", () => {
      const input = 1;
      const expected = '1';
      const result = intToHexString(input);

      assert.strictEqual(result, expected);
    });

    it("should return 'abc' for input 2748", () => {
      const input = 2748;
      const expected = 'abc';
      const result = intToHexString(input);

      assert.strictEqual(result, expected);
    });

    it("should return 'ffff' for input 65535", () => {
      const input = 65535;
      const expected = 'ffff';
      const result = intToHexString(input);

      assert.strictEqual(result, expected);
    });
  });

  describe('hexStringToBuffer', () => {
    it("should return a buffer containing 0x01 for input '01'", () => {
      const input = '01';
      const expected = Buffer.from([0x01]);
      const result = hexStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it("should return a buffer containing 0xff for input 'ff'", () => {
      const input = 'ff';
      const expected = Buffer.from([0xff]);
      const result = hexStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it("should return a buffer containing 0x7e 0x1c for input '7e1c'", () => {
      const input = '7e1c';
      const expected = Buffer.from([0x7e, 0x1c]);
      const result = hexStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it("should return an empty buffer for input ''", () => {
      const input = '';
      const expected = Buffer.from([]);
      const result = hexStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return an empty buffer for invalid hex input', () => {
      const input = 'xyz';
      const expected = Buffer.from([]);
      const result = hexStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('intToBuffer', () => {
    it('should return a buffer containing 0x00 for input 0', () => {
      const input = 0;
      const expected = Buffer.from([0x00]);
      const result = intToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return a buffer containing 0x0a for input 10', () => {
      const input = 10;
      const expected = Buffer.from([0x0a]);
      const result = intToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return a buffer containing 0xff for input 255', () => {
      const input = 255;
      const expected = Buffer.from([0xff]);
      const result = intToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return a buffer containing [0xab, 0xcd] for input 43981', () => {
      const input = 43981;
      const expected = Buffer.from([0xab, 0xcd]);
      const result = intToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return a buffer containing [0x10, 0x20, 0x30] for input 1056816', () => {
      const input = 1056816;
      const expected = Buffer.from([0x10, 0x20, 0x30]);
      const result = intToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it("should return a buffer containing 0x0a for input 10 as string '10'", () => {
      const input = '10';
      const expected = Buffer.from([0x0a]);
      const result = intToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });
  });

});
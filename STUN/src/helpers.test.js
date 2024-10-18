import assert from 'node:assert';
import { it, describe } from 'node:test';

import {
  xorPortWithCookie,
  xorIpOctetsWithCookie,
  xorIpStringToBuffer,
  xorPortToBuffer,
  xorIpOctetsToIpString,
  decodeHeader,
  decodeAttributes,
  decodeRequest,
  decodeResponse,
  createResponseHeader,
  createXorMappedAddress,
  createBindingResponse
} from './helpers.js';

const hexToBuffer = hex => Buffer.from(hex, 'hex');

const COOKIE = hexToBuffer('2112A442');
const RESPONSE_CODE = hexToBuffer('0101');
const RESPONSE_LENGTH = hexToBuffer('000c');
const XMA_TYPE = hexToBuffer('0020');
const XMA_LENGTH = hexToBuffer('0008');
const XMA_IPV4_FAMILY = hexToBuffer('0001');

// OFFICIAL RFC https://datatracker.ietf.org/doc/html/rfc5389

describe('helpers', () => {
  describe('xorPortWithCookie', () => {
    it('should return {0x2112} (first 2 bytes of Magic Cookie) when input is {0}', () => {
      const input = 0;
      const expected = 0x2112;
      const result = xorPortWithCookie(input);

      assert.equal(result, expected);
    });

    it('should return {57069} when input is {0xffff} (all bits on)', () => {
      const input = 0xffff;
      const expected = 57069;
      const result = xorPortWithCookie(input);

      assert.equal(result, expected);
    });

    it('should return {12291} when input is {0x1111}', () => {
      const input = 0x1111;
      const expected = 12291;
      const result = xorPortWithCookie(input);

      assert.equal(result, expected);
    });

    it('should return {9541} when input is {1111}', () => {
      const input = 1111;
      const expected = 9541;
      const result = xorPortWithCookie(input);

      assert.equal(result, expected);
    });

    it('should return {16002} when input is {8080}', () => {
      const input = 8080;
      const expected = 16002;
      const result = xorPortWithCookie(input);

      assert.equal(result, expected);
    });

    it('should return {4395} when input is {12345}', () => {
      const input = 12345;
      const expected = 4395;
      const result = xorPortWithCookie(input);

      assert.equal(result, expected);
    });

    it('should return {62755} when input is {54321}', () => {
      const input = 54321;
      const expected = 62755;
      const result = xorPortWithCookie(input);

      assert.equal(result, expected);
    });

    it('should not throw when input is greater then 2 bytes (max port size)', () => {
      const input = 0xffff + 1;
      try {
        xorPortWithCookie(input);
      } catch (error) {
        assert.fail(new Error(`Should NOT throw on input ${input}`));
      }
    });
  });

  describe('xorIpOctetsWithCookie', () => {
    it('should return [225, 186, 164, 67] for input [192, 168, 0, 1]', () => {
      const input = [192, 168, 0, 1];
      const expected = [225, 186, 164, 67];
      const result = xorIpOctetsWithCookie(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return [94, 18, 164, 67] for input [127, 0, 0, 1]', () => {
      const input = [127, 0, 0, 1];
      const expected = [94, 18, 164, 67];
      const result = xorIpOctetsWithCookie(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return [1, 6, 91, 66] for input [32, 20, 255, 0]', () => {
      const input = [32, 20, 255, 0];
      const expected = [1, 6, 91, 66];
      const result = xorIpOctetsWithCookie(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('xorIpStringToBuffer', () => {
    it('should return buffer of [225, 186, 164, 67] from ip 192.168.0.1', () => {
      const input = '192.168.0.1';
      const expected = Buffer.from([225, 186, 164, 67]);
      const result = xorIpStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return buffer of [94, 18, 164, 67] from ip 127.0.0.1', () => {
      const input = '127.0.0.1';
      const expected = Buffer.from([94, 18, 164, 67]);
      const result = xorIpStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return buffer of [1, 6, 91, 66] from ip 32.20.255.0', () => {
      const input = '32.20.255.0';
      const expected = Buffer.from([1, 6, 91, 66]);
      const result = xorIpStringToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('xorPortToBuffer', () => {
    it('should return a buffer of 0x2112 (first 2 bytes of Magic Cookie) for port 0', () => {
      const input = 0;
      const expected = hexToBuffer('2112');
      const result = xorPortToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return a buffer of 0x3e82 for port 8080', () => {
      const input = 8080;
      const expected = hexToBuffer('3e82');
      const result = xorPortToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });

    it('should return a buffer of 0xdeed for port 0xffff', () => {
      const input = 0xffff;
      const expected = hexToBuffer('deed');
      const result = xorPortToBuffer(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('xorIpOctetsToIpString', () => {
    it('should return 225.186.164.67 for input [192, 168, 0, 1]', () => {
      const input = [192, 168, 0, 1];
      const expected = '225.186.164.67';
      const result = xorIpOctetsToIpString(input);

      assert.equal(result, expected);
    });

    it('should return 94.18.164.67 for input [127, 0, 0, 1]', () => {
      const input = [127, 0, 0, 1];
      const expected = '94.18.164.67';
      const result = xorIpOctetsToIpString(input);

      assert.equal(result, expected);
    });

    it('should return 1.6.91.66 for input [32, 20, 255, 0]', () => {
      const input = [32, 20, 255, 0];
      const expected = '1.6.91.66';
      const result = xorIpOctetsToIpString(input);

      assert.equal(result, expected);
    });
  });

  describe('decodeHeader', () => {
    it('should decode proper "Message Type"', () => {
      const type = hexToBuffer('1234');
      const input = Buffer.concat([
        type,
        hexToBuffer('0000'),
        COOKIE,
        hexToBuffer('9a8b7c6d5e4f312213049586')
      ]);
      const expected = type;
      const result = decodeHeader(input).type;

      assert.deepStrictEqual(result, expected);
    });

    it('should decode proper "Message Length"', () => {
      const length = hexToBuffer('70dc');
      const input = Buffer.concat([
        RESPONSE_CODE,
        length,
        COOKIE,
        hexToBuffer('99aa88bb77cc66dd55ee44ff')
      ]);
      const expected = length;
      const result = decodeHeader(input).length;

      assert.deepStrictEqual(result, expected);
    });

    it('should decode proper "Magic Cookie"', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        hexToBuffer('0000'),
        COOKIE,
        hexToBuffer('0102030405060708090a0b0c')
      ]);
      const expected = COOKIE;
      const result = decodeHeader(input).magicCookie;

      assert.deepStrictEqual(result, expected);
    });

    it('should decode proper "Transaction ID"', () => {
      const transactionId = hexToBuffer('607bc1bc1ad1914ad1919ad0');
      const input = Buffer.concat([
        RESPONSE_CODE,
        hexToBuffer('0000'),
        COOKIE,
        transactionId
      ]);
      const expected = transactionId;
      const result = decodeHeader(input).transactionId;

      assert.deepStrictEqual(result, expected);
    });

    it('should return decoded header', () => {
      const type = RESPONSE_CODE
      const length = hexToBuffer('0000');
      const magicCookie = COOKIE
      const transactionId = hexToBuffer('1a2b3c4d5e6f718293041526');
      const input = Buffer.concat([type, length, magicCookie, transactionId]);
      const expected = { type, length, magicCookie, transactionId };
      const result = decodeHeader(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('decodeAttributes', () => {
    it('should decode proper "Attribute Type"', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('00112233445566778899aabb'),
        XMA_TYPE,
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('1234'),
        hexToBuffer('12345678')
      ]);
      const expected = XMA_TYPE;
      const result = decodeAttributes(input).xorMappedAddress.type;

      assert.deepStrictEqual(result, expected);
    });

    it('should decode proper "Attribute Length"', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('ff00112233445566778899aa'),
        XMA_TYPE,
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('1234'),
        hexToBuffer('12345678')
      ]);
      const expected = XMA_LENGTH;
      const result = decodeAttributes(input).xorMappedAddress.length;

      assert.deepStrictEqual(result, expected);
    });

    it('should decode proper "Address Family"', () => {
      const family = hexToBuffer('abcd');
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('eeff00112233445566778899'),
        XMA_TYPE,
        XMA_LENGTH,
        family,
        hexToBuffer('1234'),
        hexToBuffer('12345678')
      ]);
      const expected = family;
      const result = decodeAttributes(input).xorMappedAddress.family;

      assert.deepStrictEqual(result, expected);
    });

    it('should decode proper "X-Port"', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('ddeeff001122334455667788'),
        XMA_TYPE,
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('1111'), // xor port
        hexToBuffer('12345678')
      ]);
      const expected = 12291; // un-xor port
      const result = decodeAttributes(input).xorMappedAddress.port;

      assert.equal(result, expected);
    });

    it('should decode proper "X-Address"', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('ccddeeff0011223344556677'),
        XMA_TYPE,
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('1234'),
        hexToBuffer('12344321') // xor ip
      ]);
      const expected = '51.38.231.99'; // un-xor ip
      const result = decodeAttributes(input).xorMappedAddress.ip;

      assert.equal(result, expected);
    });

    it('should return "Attribute not supported" for unsupported attribute type', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('bbccddeeff00112233445566'),
        hexToBuffer('abcd'),
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('1234'),
        hexToBuffer('12345678')
      ]);
      const expected = 'Attribute not supported';
      const result = decodeAttributes(input).ERROR;

      assert.equal(result, expected);
    });

    it('should return "Invalid attribute length" for invalid attribute length', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('aabbccddeeff001122334455'),
        XMA_TYPE,
        hexToBuffer('ffff1'),
        XMA_IPV4_FAMILY,
        hexToBuffer('1234'),
        hexToBuffer('12345678')
      ]);
      const expected = 'Invalid attribute length';
      const result = decodeAttributes(input).ERROR;

      assert.equal(result, expected);
    });

    it('should return decoded attributes', () => {
      const type = XMA_TYPE;
      const length = XMA_LENGTH;
      const family = XMA_IPV4_FAMILY;
      const port = 13056;
      const ip = '51.0.182.80';
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        hexToBuffer('99aabbccddeeff0011223344'),
        type,
        length,
        family,
        hexToBuffer('1212'), // xor port
        hexToBuffer('12121212') // xor ip
      ]);
      const expected = { xorMappedAddress: { type, length, family, port, ip } };
      const result = decodeAttributes(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  // currently it's just an alias for decodeHeader
  describe('decodeRequest', () => {
    it('should return the same as decodeHeader', () => {
      const input = Buffer.concat([
        RESPONSE_CODE,
        hexToBuffer('0000'),
        COOKIE,
        hexToBuffer('100000000000000000000000')
      ]);
      const expected = decodeHeader(input);
      const result = decodeRequest(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('decodeResponse', () => {
    it('should decode response header and attributes', () => {
      const transactionId = hexToBuffer('123456123456123456123456');
      const input = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        transactionId,
        XMA_TYPE,
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('1234'), // xor port
        hexToBuffer('12345678') // xor ip
      ]);
      const expected = {
        type: RESPONSE_CODE,
        length: RESPONSE_LENGTH,
        magicCookie: COOKIE,
        transactionId,
        xorMappedAddress: {
          type: XMA_TYPE,
          length: XMA_LENGTH,
          family: XMA_IPV4_FAMILY,
          port: 13094, // un-xor port
          ip: '51.38.242.58' // un-xor ip
        }
      };
      const result = decodeResponse(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('createResponseHeader', () => {
    it('should have 20 bytes in header', () => {
      const input = hexToBuffer('aabbcc112233445566778899');
      const expected = 20;
      const result = createResponseHeader(input).length;

      assert.equal(result, expected);
    });

    it('should have 0x0101 for "Message Type"', () => {
      const input = hexToBuffer('012345678901234567abcdef');
      const expected = RESPONSE_CODE;
      const result = createResponseHeader(input).subarray(0, 2);

      assert.deepStrictEqual(result, expected);
    });

    it('should have 0x0000 for "Message Length"', () => {
      const input = hexToBuffer('abcdef012345678901234567');
      const expected = hexToBuffer('0000');
      const result = createResponseHeader(input).subarray(2, 4);

      assert.deepStrictEqual(result, expected);
    });

    it('should have 0x2112A442 for "Magic Cookie"', () => {
      const input = hexToBuffer('abcdef012345678901234567');
      const expected = COOKIE;
      const result = createResponseHeader(input).subarray(4, 8);

      assert.deepStrictEqual(result, expected);
    });

    it('should return proper "Transaction ID"', () => {
      const input = hexToBuffer('0123456789abcdef01234567');
      const expected = input;
      const result = createResponseHeader(input).subarray(8);

      assert.deepStrictEqual(result, expected);
    });

    it('should return proper response header', () => {
      const transactionId = hexToBuffer('11aa223344bb55667788cc99');
      const expected = Buffer.concat([
        RESPONSE_CODE,
        hexToBuffer('0000'),
        COOKIE,
        transactionId
      ]);
      const result = createResponseHeader(transactionId);

      assert.deepStrictEqual(result, expected);
    });
  });

  // X-PORT: port XOR magic cookie's most significant 2 bytes
  // X-ADDRESS: ip (each byte) XOR magic cookie (each byte)
  describe('createXorMappedAddress', () => {
    it('should have 12 bytes in XOR-MAPPED-ADDRESS', () => {
      const input = { port: 54321, ip: '192.168.0.1' };
      const expected = 12;
      const result = createXorMappedAddress(input).length;

      assert.equal(result, expected);
    });

    it('should have 0x0020 for "Attribute Type"', () => {
      const input = { port: 55441, ip: '192.168.0.1' };
      const expected = XMA_TYPE;
      const result = createXorMappedAddress(input).subarray(0, 2);

      assert.deepStrictEqual(result, expected);
    });

    it('should have 0x0008 for "Attribute Length"', () => {
      const input = { port: 55441, ip: '192.168.0.1' };
      const expected = XMA_LENGTH;
      const result = createXorMappedAddress(input).subarray(2, 4);

      assert.deepStrictEqual(result, expected);
    });

    it('should have 0x0001 for "Attribute IPV4 Family"', () => {
      const input = { port: 55441, ip: '192.168.0.1' };
      const expected = XMA_IPV4_FAMILY;
      const result = createXorMappedAddress(input).subarray(4, 6);

      assert.deepStrictEqual(result, expected);
    });

    it('should have proper X-PORT', () => {
      const input = { port: 12336, ip: '127.0.0.1' };
      const expected = hexToBuffer('1122'); // xor port
      const result = createXorMappedAddress(input).subarray(6, 8);

      assert.deepStrictEqual(result, expected);
    });

    it('should have proper X-ADDRESS', () => {
      const ip = '51.38.15.143';
      const input = { port: 9092, ip };
      const expected = hexToBuffer('1234abcd'); // xor ip
      const result = createXorMappedAddress(input).subarray(8, 12);

      assert.deepStrictEqual(result, expected);
    });

    it('should return proper XOR-MAPPED-ADDRESS', () => {
      const input = { port: 25139, ip: '166.119.231.99' };
      const expected = Buffer.concat([
        XMA_TYPE,
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('4321'), // xor port
        hexToBuffer('87654321') // xor ip
      ]);
      const result = createXorMappedAddress(input);

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('createBindingResponse', () => {
    it('should have 32 bytes in response', () => {
      const input = {
        transactionId: hexToBuffer('112233445566778899aabbcc'),
        port: 9091,
        ip: '127.0.0.1'
      };
      const expected = 32;
      const result = createBindingResponse(input).length;

      assert.equal(result, expected);
    });

    it('should return proper binding response', () => {
      const transactionId = hexToBuffer('010203040506070809101112');
      const input = { transactionId, port: 13094, ip: '51.38.242.58' };
      const expected = Buffer.concat([
        RESPONSE_CODE,
        RESPONSE_LENGTH,
        COOKIE,
        transactionId,
        XMA_TYPE,
        XMA_LENGTH,
        XMA_IPV4_FAMILY,
        hexToBuffer('1234'), // xor port
        hexToBuffer('12345678') // xor ip
      ]);
      const result = createBindingResponse(input);

      assert.deepStrictEqual(result, expected);
    });
  });
});
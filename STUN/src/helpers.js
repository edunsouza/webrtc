import {
  MAGIC_COOKIE,
  BINDING_RESPONSE_CODE,
  HEADER_LENGTH,
  HEADER_LENGTH_OFFSET,
  XOR_MAPPED_ADDRESS_TYPE,
  XOR_MAPPED_ADDRESS_LENGTH,
  XOR_MAPPED_ADDRESS_IPV4_FAMILY
} from './constants.js';
import { compose, splitDots, joinDots, intToBuffer } from './utils.js';

export const xorPortWithCookie = port => {
  // compute X-Port: XOR the port with the most significant 16 bits of the magic cookie
  // MORE DETAILS: https://datatracker.ietf.org/doc/html/rfc5389#section-15.2
  return port ^ MAGIC_COOKIE.readUInt16BE(0);
};

export const xorIpOctetsWithCookie = octets => {
  // compute X-Address: XOR the IP address with the magic cookie
  // MORE DETAILS: https://datatracker.ietf.org/doc/html/rfc5389#section-15.2
  return octets.map((octet, index) => octet ^ MAGIC_COOKIE[index]);
};

export const xorIpStringToBuffer = compose(splitDots, xorIpOctetsWithCookie, Buffer.from);

export const xorPortToBuffer = compose(xorPortWithCookie, intToBuffer);

export const xorIpOctetsToIpString = compose(xorIpOctetsWithCookie, joinDots);

export const decodeHeader = message => ({
  type: message.slice(0, 2),
  length: message.slice(2, 4),
  magicCookie: message.slice(4, 8),
  transactionId: message.slice(8, 20)
});

// for example purposes it only supports XOR_MAPPED_ADDRESS
export const decodeAttributes = message => {
  const body = message.slice(HEADER_LENGTH);
  const type = body.slice(0, 2);
  const length = body.slice(2, 4);
  const family = body.slice(4, 6);
  const port = xorPortWithCookie(body.readUInt16BE(6));
  const ip = xorIpOctetsToIpString(body.slice(8));

  if (type.readUInt16BE(0) !== XOR_MAPPED_ADDRESS_TYPE.readUInt16BE(0)) {
    return { ERROR: 'Attribute not supported' };
  }

  if (length.readUInt16BE(0) !== XOR_MAPPED_ADDRESS_LENGTH.readUInt16BE(0)) {
    return { ERROR: 'Invalid attribute length' };
  }

  return {
    xorMappedAddress: { type, length, family, port, ip }
  };
};

export const decodeRequest = decodeHeader;

export const decodeResponse = message => ({
  ...decodeHeader(message),
  ...decodeAttributes(message)
});

export const createResponseHeader = transactionId => Buffer.concat([
  BINDING_RESPONSE_CODE,
  Buffer.from([0x00, 0x00]), // message length (initially 0)
  MAGIC_COOKIE,
  transactionId
]);

export const createXorMappedAddress = ({ port, ip }) => Buffer.concat([
  XOR_MAPPED_ADDRESS_TYPE,
  XOR_MAPPED_ADDRESS_LENGTH,
  XOR_MAPPED_ADDRESS_IPV4_FAMILY,
  xorPortToBuffer(port),
  xorIpStringToBuffer(ip),
]);

export const createBindingResponse = ({ transactionId, port, ip }) => {
  const header = createResponseHeader(transactionId);
  const attributes = createXorMappedAddress({ port, ip });

  // update the message length in the header
  header.writeUInt16BE(attributes.length, HEADER_LENGTH_OFFSET);

  return Buffer.concat([header, attributes]);
};
export const MAGIC_COOKIE = Buffer.from([0x21, 0x12, 0xA4, 0x42]);
export const BINDING_RESPONSE_CODE = Buffer.from([0x01, 0x01]);
export const HEADER_LENGTH_OFFSET = 2;
export const HEADER_LENGTH = 20;
export const XOR_MAPPED_ADDRESS_TYPE = Buffer.from([0x00, 0x20]);
export const XOR_MAPPED_ADDRESS_LENGTH = Buffer.from([0x00, 0x08]); // family 2 bytes, port 2 bytes, ip 4 bytes
export const XOR_MAPPED_ADDRESS_IPV4_FAMILY = Buffer.from([0x00, 0x01]);
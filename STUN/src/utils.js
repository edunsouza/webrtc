export const compose = (...fns) => input => fns.reduce((prev, current) => current?.(prev), input);

export const splitDots = value => value.split('.');

export const joinDots = values => values.join('.');

export const padZeroIfOddSize = compose(String, txt => '0'.repeat(txt.length % 2) + txt);

export const intToHexString = value => Number(value).toString(16);

export const hexStringToBuffer = hex => Buffer.from(hex, 'hex');

export const intToBuffer = compose(intToHexString, padZeroIfOddSize, hexStringToBuffer);

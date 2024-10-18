/**
 * This code is for learning purposes.
 * It does NOT include any security validations.
 * It only supports XOR-MAPPED-ADDRESS response attribute
*/
import dgram from 'node:dgram';

import { createBindingResponse, decodeRequest, decodeResponse } from './helpers.js';

const SERVER_PORT = 3478;

const server = dgram.createSocket('udp4');

server.on('message', (message, rinfo) => {
  const request = decodeRequest(message);

  const response = createBindingResponse({
    transactionId: request.transactionId,
    port: rinfo.port,
    ip: rinfo.address
  });

  console.log('[REQUEST]', { ...request, ...rinfo });
  console.log('[RESPONSE]', decodeResponse(response));

  server.send(response, rinfo.port, rinfo.address);
});

server.bind(SERVER_PORT, () => {
  console.log(`STUN server listening to port ${SERVER_PORT}`);
});
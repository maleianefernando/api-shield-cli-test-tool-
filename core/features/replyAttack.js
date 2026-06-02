import { fetchData, generateNonce, getTimestamp } from "../../utils/utils.js";
import { RequestService } from "../service/RequestService.js";

export async function invalidNonce() {}

export async function invalidTimestamp() {
  const nonce = generateNonce();
  const timestamp = RequestService.rawRequest.headers['X-Timestamp'];

  console.log(`Passaram-se ${getTimestamp() - timestamp} segundos da requisicao original`);

  const options = {
    method: RequestService.rawRequest.method,
    headers: { ...RequestService.rawRequest.headers, "X-Timestamp": timestamp, "X-Nonce": nonce },
    body: RequestService.rawRequest.body,
  };

  const request = new Request(RequestService.rawRequest.url, options);

  return await fetchData(request);
}

export async function pureReply() {
  const options = {
    method: RequestService.rawRequest.method,
    headers: RequestService.rawRequest.headers,
    body: RequestService.rawRequest.body,
  };

  const request = new Request(RequestService.rawRequest.url, options);
  return await fetchData(request);
}

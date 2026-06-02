import { file as FilePrompt, randomStudentId } from "../../prompts/incoming-document.js";
import { fetchData, generateNonce, getFileStream } from "../../utils/utils.js";
import { RequestService } from "../service/RequestService.js";

export async function invalidFileHash (){
  const body = RequestService.rawRequest.body;
  const nonce = generateNonce();

  const file = await FilePrompt("Selecione um ficheiro diferente:");
  const buffer = getFileStream(file);
  const blobFile = new Blob([buffer]);
  body.set("file", blobFile, `SGA-${body.get("document_id")}.pdf`);

  // console.log("Um novo nonce foi gerado...");
  // console.log(`Nonce Antigo: ${RequestService.rawRequest.headers["X-Nonce"]}`);
  // console.log(`Nonce Novo: ${nonce}`);

  const options = {
    method: RequestService.rawRequest.method,
    headers: { ...RequestService.rawRequest.headers, "X-Nonce": nonce },
    body: body,
  };

  const request = new Request(RequestService.rawRequest.url, options);

  return await fetchData(request);
}

export async function dataManipulation() {
  const oldStudentId = RequestService.rawRequest.body.get(
    "applicant[0][student_id]",
  );
  const newStudentId = randomStudentId();
  const body = RequestService.rawRequest.body;
  const nonce = generateNonce();

  body.set("applicant[0][student_id]", newStudentId);

  console.log("Um novo nonce foi gerado...");
  console.log(`Nonce Antigo: ${RequestService.rawRequest.headers["X-Nonce"]}`);
  console.log(`Nonce Novo: ${nonce}`);

  const options = {
    method: RequestService.rawRequest.method,
    headers: { ...RequestService.rawRequest.headers, "X-Nonce": nonce },
    body: body,
  };

  const request = new Request(RequestService.rawRequest.url, options);

  return await fetchData(request);
}



import { operationPrompt } from "../../prompts/operation.js";
import { requestPrompt } from "../../prompts/incoming-document.js";
import {
  formDataToObject,
  generateFileHash,
  generateHmac,
  generateNonce,
  getBaseUrl,
  getFileStream,
  getTimestamp,
  sortObject,
} from "../../utils/utils.js";
import { authMiddleware, getToken } from "../../utils/authentication.js";
import { RequestService } from "../service/RequestService.js";

const url = `${getBaseUrl()}/integrations/incoming-documents`;

export async function createIncomingDocument() {
  return await authMiddleware(async () => {
    const promtBasedBody = await requestPrompt();

    const buffer = getFileStream(promtBasedBody.file);
    const formData = new FormData();
    const blobFile = new Blob([buffer]);

    formData.append("document_id", promtBasedBody.document_id);
    formData.append("subject", promtBasedBody.subject);
    formData.append("file", blobFile, `SGA-${promtBasedBody.document_id}.pdf`);
    formData.append(
      "applicant[0][first_name]",
      promtBasedBody.applicant[0].first_name,
    );
    formData.append(
      "applicant[0][last_name]",
      promtBasedBody.applicant[0].last_name,
    );
    formData.append(
      "applicant[0][student_id]",
      promtBasedBody.applicant[0].student_id,
    );
    const rawRequestBody = formDataToObject(formData);

    const body = sortObject(rawRequestBody);
    const fileHash = await generateFileHash(blobFile);
    const timestamp = getTimestamp();
    const nonce = generateNonce();
    const clientId = "";
    const clientName = "";

    const hmac = generateHmac(
      "POST",
      "/api/v1/integrations/incoming-documents",
      JSON.stringify(body),
      timestamp,
      nonce,
      fileHash,
      clientId,
      clientName,
    );
// console.log(hmac)
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken().accessToken}`,
        "X-Nonce": nonce,
        "X-Timestamp": timestamp,
        "X-Signature": hmac,
        "X-File-Hash": fileHash,
        "X-Client-Id": clientId,
        "X-Client-Name": clientName,
      },
      body: formData,
    };

    const request = new Request(`${url}`, options);
    const a = RequestService.capture(url, options.method, options.body, options.headers);
    console.log(request);

    return fetch(request)
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();

          return {
            status: "Error",
            message: error.message,
          };
          // throw new Error(`Status code ${response.status}, ${error.message}`);
        }

        return response.json();
      })
      .then((data) => {
        console.debug("request enviada com sucesso");
        return data;
      })
      .catch((error) => {
        console.debug("request falhou: " + error);
        return error;
      });
  });
}

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { parse } from "qs";
import { createHash, createHmac, randomBytes } from "crypto";

const secret = process.env.API_SHIELD_SECRET;
/*
 ** Read the pdf file and get the file stream that will be sent to the external API as a blob
 */
export function getFileStream(file) {
  if (!existsSync(file)) {
    throw new Error("There is no file for this job");
  }

  try {
    return readFileSync(resolve(file));
  } catch (e) {
    return file;
  }
}

export function formDataToObject(formData) {
  const entries = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue; // ignora ficheiro

    entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  // console.log(`Parsed: ${JSON.stringify(parse(entries.join("&")))}`)
  return parse(entries.join("&"));
}

export function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

export function clientCredentials(data) {
  const { id, name } = data;
  let hasId = false;
  let hasName = false;

  if (id && String(id).trim() !== "") hasId = true;

  if (name && String(name).trim() !== "") hasName = true;

  if (hasId && hasName) return `${id}:${name}`;
  else if (hasId) return `${id}`;
  else if (hasName) return `${name}`;
  else return null;
}

export function generateHmac(
  method,
  uri,
  body,
  timestamp,
  nonce,
  fileHash = null,
  clientId = null,
  clientName = null,
) {
  const bodyHash = createHash("sha256")
    .update(String(method).toUpperCase() === "GET" ? "" : body)
    .digest("hex");

  const cCredentials = clientCredentials({
    id: clientId,
    name: clientName,
  });
  const fHash = fileHash !== null ? fileHash : "";

  const pattern =
    cCredentials === null
      ? `${String(method).toUpperCase()}:${uri}:${bodyHash}:${timestamp}:${nonce}:${fHash}`
      : `${String(method).toUpperCase()}:${uri}:${bodyHash}:${timestamp}:${nonce}:${fHash}:${cCredentials}`;
  // console.log(`client rawbody: ${body}`);
  // console.debug(`Client Pattern: '${pattern}'`);
  return createHmac("sha256", secret).update(pattern).digest("hex");
}

export async function generateFileHash(blobFile) {
  const buffer = Buffer.from(await blobFile.arrayBuffer());

  return createHash("sha256").update(buffer).digest("hex");
}

export function generateNonce() {
  const nonce = randomBytes(32).toString("base64");
  // console.debug(`Nonce: ${nonce}`);
  return nonce;
}

export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function getBaseUrl() {
  return process.env.SYSDOC_API_URL ?? null;
}

export async function fetchData(request, responseType = 'json') {
  return fetch(request)
    .then(async (response) => {
      if (!response.ok) {
        const error =
          responseType === "text"
            ? await response.text()
            : await response.json();

        return {
          status: "Error",
          message: error.message,
        };
        // throw new Error(`Status code ${response.status}, ${error.message}`);
      }

      return responseType === "text" ? response.text() : response.json();
    })
    .then((data) => {
      // console.debug("request enviada com sucesso");
      return data;
    })
    .catch((error) => {
      // console.debug("request falhou: " + error);
      return error;
    });
}

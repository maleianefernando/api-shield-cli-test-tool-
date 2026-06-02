import { faker } from "@faker-js/faker";
import { homedir } from "os";
import { join } from "path";
import { readdirSync } from "fs";
import { randomInt } from "crypto";
import {
  randomDocumentId,
  randomDocumentSubject,
  randomStudentId,
} from "../../prompts/incoming-document.js";
import { fetchData } from "../../utils/utils.js";
import { number } from "@inquirer/prompts";
import { authMiddleware, getToken } from "../../utils/authentication.js";

export function floodWithValidRequest() {
  const home = homedir();
  const documentsDir = join(home, "Documents");
  let selectdFile = null;

  try {
    const files = readdirSync(documentsDir);

    selectdFile = files[randomInt(0, files.length)];
  } catch (err) {
    if (err.errno == -2) {
      console.log(
        'Directorio "Documents" nao encontrado no seu sistema operativo.',
      );
    } else {
    }
    console.log(err.errno);
  }

  const incomingDocument = {
    document_id: randomDocumentId(),
    subject: randomDocumentSubject(),
    applicant: [
      {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        student_id: randomStudentId(),
      },
    ],
    file: selectdFile,
  };
}

export async function floodWithInvalidRequest() {
  const requestCount = await number({
    message: "Total de requisicoes",
    min: 1,
    required: true,
    default: 500,
  });

  const result = [];
  authMiddleware(async () => {
    for (let i = 0; i < requestCount; i++) {
      const request = new Request(
        "http://127.0.0.1:8000/api/v1/integrations/incoming-documents",
        {
          method: "POST",
          body: {},
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${getToken().accessToken}`
          },
        },
      );

      console.log(await fetchData(request));
    }
  });

  return "done";
}

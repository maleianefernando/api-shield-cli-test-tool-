import { input, number, rawlist, select } from "@inquirer/prompts";
import { randomInt } from "crypto";
import { homedir } from "os";
import { join } from "path";
import { readdirSync } from "fs";
import { faker } from "@faker-js/faker";

export async function requestPrompt() {
  return {
    document_id: await reference(),
    subject: await subject(),
    applicant: await applicant(),
    file: await file(),
  };
}

export function randomDocumentId () {
  const randomYear = randomInt(2001, 2026);
  const randomNumber = Math.random() * 100;
  
  return `REF-APISHIELD-TEST-${randomYear}-${Math.round(randomNumber)}`
}

export function randomDocumentSubject() {
  const subjects = [
    "Pedido de reingresso",
    "Pedido de certificado",
    "Declaracao",
  ];

  return subjects[randomInt(0, subjects.length)];
}

export function randomStudentId() {
  return `01.${randomInt(1001, 9999)}.${randomInt(2015, 2027)}`;
}


async function reference() {
  return await input({
    message: "Referencia do documento:",
    default: randomDocumentId(),
    required: true,
  });
}

async function subject() {
  return await input({
    message: "Assunto:",
    default: randomDocumentSubject(),
    required: true,
  });
}

export async function file(message = "Carregue um ficheiro pdf:") {
  const home = homedir();
  const documentsDir = join(home, "Documents");

  try {
    const files = readdirSync(documentsDir);
    // console.log(files);

    return await rawlist({
      message: message,
      choices: files.map((filename) => ({
        value: join(documentsDir, filename),
        name: filename,
      })),
    });
  } catch (err) {
    if (err.errno == -2) {
      console.log(
        "Directorio \"Documents\" nao encontrado no seu sistema operativo.",
      );
    } else {
    }
    console.log(err.errno);
  }
}

async function applicant() {
  const applicantCount = await number({
    message: "Numero de requerentes:",
    default: 1,
    required: true,
    min: 0,
    max: 4,
  });

  const applicants = [];

  for (let i = 0; i < applicantCount; i++) {
    const firstName = await input({
      message: "Primeiro nome:",
      default: faker.person.firstName(),
    });

    const lastName = await input({
      message: "Apelido:",
      default: faker.person.lastName(),
    });

    const studentId = await input({
      message: "Codigo de estudante:",
      default: randomStudentId(),
    });

    applicants.push({
      first_name: firstName ?? "",
      last_name: lastName ?? "",
      student_id: studentId,
    });
  }

  return applicants;
}

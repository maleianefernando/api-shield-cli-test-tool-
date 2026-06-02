import { select } from "@inquirer/prompts";
import { invalidTimestamp, pureReply } from "../core/features/replyAttack.js";
import { RequestService } from "../core/service/RequestService.js";
import { createIncomingDocument } from "../core/features/createIncomingDocument.js";
import { floodWithInvalidRequest } from "../core/features/floodAttack.js";
import { dataManipulation, invalidFileHash } from "../core/features/dataManipulationAttack.js";

export const operationPrompt = async () => {
  return await select({
    message: "Que tipo de requisicao quer eviar?",
    choices: [
      {
        name: "Enviar uma requisição autêntica e válida.",
        value: "validRequest",
        description:
          "Para enviar uma requisicao autentica e que sera devidamente processada pelo servidor.",
      },
      {
        name: "Simular um replay attack.",
        value: "replayAttack",
      },
      {
        name: "Simular um timestamp expirado/invalido.",
        value: "invalidTimestamp",
      },
      // {
      //   name: "Simular um HMAC invalido.",
      //   value: "invalidHmac",
      // },
      {
        name: "Simular flood atack (Ataque de inundacao) com dados validos.",
        value: "floodWithValidData",
      },
      {
        name: "Simular flood atack (Ataque de inundacao) com dado invalidos.",
        value: "floodWithInvalidData",
      },
      {
        name: "Simular ataque de manipulacao de dados.",
        value: "dataManipulation",
      },
      {
        name: "Simular violacao da integridade do ficheiro.",
        value: "invalidFileHash",
      },
    ],
  }).then(async (value) => {
    switch (value) {
      case "validRequest":
        const ic = await createIncomingDocument();
        console.log(ic.status)
        if(ic.status == "Ok") {
          console.log("Sucesso");
        }
        break;
        
      case "replayAttack":
        const pr = await pureReply();
        console.log(pr);
        break;
      
      case "invalidTimestamp":
        const it = await invalidTimestamp();
        console.log(it);
        break;

      case "floodWithInvalidData":
        const fi = await floodWithInvalidRequest();
        console.log(fi);
        break;
        
      case "dataManipulation":
        const dm = await dataManipulation();
        console.log(dm);
        break;
      
        case "invalidFileHash":
          const ifh = await invalidFileHash();
          console.log(ifh);
          break;

      default:
        break;
    }
  });
};

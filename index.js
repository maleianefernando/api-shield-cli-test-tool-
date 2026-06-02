import "dotenv/config";
import { select, Separator } from "@inquirer/prompts";
import { createIncomingDocument } from "./core/features/createIncomingDocument.js";
import { operationPrompt } from "./prompts/operation.js";
import { RequestService } from "./core/service/RequestService.js";
import { getBaseUrl } from "./utils/utils.js";

try {
  while (true) {
    await operationPrompt();
    await select({
      message: "",
      choices: [
        {
          name: "Sair",
          value: "quit",
        },
        {
          name: "Limpar tela e continuar as simulacoes",
          value: "runTests",
        },
      ],
    }).then(async (value) => {
      switch (value) {
        case "runTests":
          console.clear();
          await operationPrompt();
          break;

        case "quit":
          process.exit(0);
          break;

        default:
          break;
      }
    });
  }
} catch (e) {
  //    console.log(e);
}

import { auth } from "./auth";
import { chat } from "./chat";
import { common } from "./common";
import { detail } from "./detail";
import { documents } from "./documents";
import { expenses } from "./expenses";
import { landing } from "./landing";
import { upload } from "./upload";
import { workspace } from "./workspace";

export const am = {
  ...common,
  ...landing,
  ...auth,
  ...workspace,
  ...upload,
  ...chat,
  ...documents,
  ...expenses,
  ...detail,
} as const;

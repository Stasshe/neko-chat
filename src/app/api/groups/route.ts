import { authenticate } from "@/server/auth";
import { failure, success } from "@/server/http";
import { createGroup, getGroups, startSoloGroup } from "@/server/repository";
import { readGroupName } from "@/server/validation";
import { AppError } from "@/types/app";

type GroupInput = {
  mode?: string;
  name?: string;
};

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    return success({ groups: await getGroups(user) });
  } catch (error) {
    return failure(error as object);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    const input = (await request.json()) as GroupInput;
    if (input.mode === "solo") {
      return success({ group: await startSoloGroup(user) }, 201);
    }
    if (input.mode === "create") {
      const name = readGroupName(input.name ?? "");
      return success(await createGroup(user, name), 201);
    }
    throw new AppError("VALIDATION_ERROR", "グループ作成モードが正しくありません。");
  } catch (error) {
    return failure(error as object);
  }
}

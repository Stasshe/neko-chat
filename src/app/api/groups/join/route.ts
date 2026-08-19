import { authenticate } from "@/server/auth";
import { failure, success } from "@/server/http";
import { joinGroup } from "@/server/repository";
import { readInviteCode } from "@/server/validation";

type JoinInput = {
  code?: string;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    const input = (await request.json()) as JoinInput;
    const code = readInviteCode(input.code ?? "");
    return success({ group: await joinGroup(user, code) }, 201);
  } catch (error) {
    return failure(error as object);
  }
}

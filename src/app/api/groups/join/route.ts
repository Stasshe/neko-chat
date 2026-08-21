import { authenticate } from "@/server/auth";
import { failure, readJson, success } from "@/server/http";
import { joinGroup } from "@/server/repository";
import { joinInputSchema } from "@/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    const input = await readJson(request, joinInputSchema);
    return success({ group: await joinGroup(user, input.code) }, 201);
  } catch (error) {
    return failure(error);
  }
}

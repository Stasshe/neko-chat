import { authenticate } from "@/server/auth";
import { failure, parseValue, readJson, success } from "@/server/http";
import { createGroup, getGroups, startSoloGroup } from "@/server/repository";
import { groupInputSchema, groupNameSchema } from "@/server/validation";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    return success({ groups: await getGroups(user) });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    const input = await readJson(request, groupInputSchema);
    if (input.mode === "solo") {
      return success({ group: await startSoloGroup(user) }, 201);
    }
    const name = parseValue(groupNameSchema, input.name);
    return success(await createGroup(user, name), 201);
  } catch (error) {
    return failure(error);
  }
}

import { authenticate } from "@/server/auth";
import { failure, parseValue, success } from "@/server/http";
import { getGroupInviteCode } from "@/server/repository";
import { idSchema } from "@/server/validation";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await authenticate(request);
    const params = await context.params;
    const groupId = parseValue(idSchema, params.groupId);
    return success({ inviteCode: await getGroupInviteCode(user, groupId) });
  } catch (error) {
    return failure(error);
  }
}

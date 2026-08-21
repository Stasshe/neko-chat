import { authenticate } from "@/server/auth";
import { failure, parseValue, readJson, success } from "@/server/http";
import { addPost, getPosts } from "@/server/repository";
import { idSchema, postInputSchema } from "@/server/validation";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await authenticate(request);
    const params = await context.params;
    const groupId = parseValue(idSchema, params.groupId);
    return success(await getPosts(user, groupId));
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await authenticate(request);
    const params = await context.params;
    const groupId = parseValue(idSchema, params.groupId);
    const input = await readJson(request, postInputSchema);
    return success({ post: await addPost(user, groupId, input.body, input.emotion) }, 201);
  } catch (error) {
    return failure(error);
  }
}

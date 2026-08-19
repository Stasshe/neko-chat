import { authenticate } from "@/server/auth";
import { failure, readJson, success } from "@/server/http";
import { addPost, getPosts } from "@/server/repository";
import { readEmotion, readId, readPostBody } from "@/server/validation";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

type PostInput = {
  body?: string;
  emotion?: string;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await authenticate(request);
    const params = await context.params;
    const groupId = readId(params.groupId);
    return success(await getPosts(user, groupId));
  } catch (error) {
    return failure(error as object);
  }
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await authenticate(request);
    const params = await context.params;
    const groupId = readId(params.groupId);
    const input = await readJson<PostInput>(request);
    const body = readPostBody(input.body ?? "");
    const emotion = readEmotion(input.emotion ?? "");
    return success({ post: await addPost(user, groupId, body, emotion) }, 201);
  } catch (error) {
    return failure(error as object);
  }
}

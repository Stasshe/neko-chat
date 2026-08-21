import { authenticate } from "@/server/auth";
import { failure, readJson, success } from "@/server/http";
import { getProfile, updateProfile } from "@/server/repository";
import { profileInputSchema } from "@/server/validation";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    return success({ profile: await getProfile(user) });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    const input = await readJson(request, profileInputSchema);
    return success({ profile: await updateProfile(user, input.username, input.catType) });
  } catch (error) {
    return failure(error);
  }
}

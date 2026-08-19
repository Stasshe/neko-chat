import { authenticate } from "@/server/auth";
import { failure, success } from "@/server/http";
import { getProfile, updateProfile } from "@/server/repository";
import { readCatType, readUsername } from "@/server/validation";

type ProfileInput = {
  username?: string;
  catType?: string;
};

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    return success({ profile: await getProfile(user) });
  } catch (error) {
    return failure(error as object);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const user = await authenticate(request);
    const input = (await request.json()) as ProfileInput;
    const username = readUsername(input.username ?? "");
    const catType = readCatType(input.catType ?? "");
    return success({ profile: await updateProfile(user, username, catType) });
  } catch (error) {
    return failure(error as object);
  }
}

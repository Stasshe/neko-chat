import { updateMyProfile } from "@/lib/api";
import type { CatType, Profile } from "@/types/app";

import { getErrorMessage, normalizeError } from "./app-provider-shared";

type Params = {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  setError: (error: string | null) => void;
  handleAuthError: (error: Error) => Promise<boolean>;
};

export function createProfileActions({ profile, setProfile, setError, handleAuthError }: Params) {
  async function saveProfile(username: string, catType: CatType) {
    setError(null);
    const previousProfile = profile;
    if (previousProfile) {
      setProfile({ ...previousProfile, username, catType });
    }
    try {
      const nextProfile = await updateMyProfile(username, catType);
      setProfile(nextProfile);
    } catch (requestError) {
      if (previousProfile) {
        setProfile(previousProfile);
      }
      const normalized = normalizeError(requestError);
      if (!(await handleAuthError(normalized))) {
        setError(getErrorMessage(normalized));
      }
      throw normalized;
    }
  }

  return { saveProfile };
}

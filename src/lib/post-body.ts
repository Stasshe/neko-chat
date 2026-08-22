export const CAT_POST_SUFFIX = "ニャー";

export function formatPostBody(body: string) {
  return `${body}${CAT_POST_SUFFIX}`;
}

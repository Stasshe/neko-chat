import { InviteCreatedContent } from "./content";

type InviteCreatedPageProps = {
  searchParams: Promise<{ code?: string | string[] }>;
};

export default async function InviteCreatedPage({ searchParams }: InviteCreatedPageProps) {
  const { code } = await searchParams;

  return <InviteCreatedContent code={typeof code === "string" ? code : ""} />;
}

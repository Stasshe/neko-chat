import { CatDisplay } from "@/components/cat-display";
import type { PostUser } from "@/types/app";

export function MemberAvatars({ members }: { members: PostUser[] }) {
  return (
    <ul className="member-avatars" aria-label={`${members.length}人のメンバー`}>
      {members.slice(0, 5).map((member) => (
        <li className="member-avatar" key={member.id} title={member.username}>
          <CatDisplay type={member.catType} className="member-avatar__cat" />
        </li>
      ))}
    </ul>
  );
}

import Link from "next/link";

import { CatDisplay } from "@/components/cat-display";
import { MobileShell } from "@/components/mobile-shell";

export default function NotFound() {
  return (
    <MobileShell>
      <main className="not-found">
        <span className="not-found__code">404</span>
        <CatDisplay type="mike" emotion="negative" className="not-found__cat" priority />
        <h1>ページが見つからないにゃ</h1>
        <p>お探しのページは移動したか、なくなったようです。</p>
        <Link className="primary-button not-found__link" href="/home">
          ホームへ戻る
        </Link>
      </main>
    </MobileShell>
  );
}

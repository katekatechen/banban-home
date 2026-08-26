import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "v1 低保真 — AIFIAN 首頁改版 — 伴伴為主入口",
  description: "純文字 / wireframe 風格，用來談流程",
};

export default function V1LofiPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-8 px-8 py-16 font-mono text-sm sm:px-16 sm:py-24">
      <header className="flex w-full max-w-3xl flex-col gap-2 border-b border-dashed border-zinc-400 pb-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          v1 — lo-fi / wireframe
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          [ AIFIAN 首頁改版 — 伴伴為主入口 · 低保真版 ]
        </h1>
        <p className="text-zinc-600">
          這個版本只談流程：用純文字與 ASCII 框架，不處理視覺。
        </p>
      </header>

      <section className="flex w-full max-w-3xl flex-col gap-4">
        <h2 className="text-base font-semibold">畫面清單（待填）</h2>
        <ul className="flex flex-col gap-2 text-zinc-700">
          <li>[ ] 1. 入口畫面</li>
          <li>[ ] 2. 主流程畫面 A</li>
          <li>[ ] 3. 主流程畫面 B</li>
          <li>[ ] 4. 次流程 / 邊界情境</li>
          <li>[ ] 5. 結尾畫面</li>
        </ul>
        <p className="text-xs text-zinc-400">
          （根據 spec/kickoff.md 跟 spec/context.md，把上面五個畫面替換成你這個專案實際要做的。）
        </p>
      </section>

      <footer className="mt-auto text-xs text-zinc-400">
        v1-lofi · 空殼，等待填內容
      </footer>
    </main>
  );
}

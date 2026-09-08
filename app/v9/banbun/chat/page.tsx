import { Suspense } from "react";
import ChatClient from "./ChatClient";

export default function BanbunChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatClient />
    </Suspense>
  );
}

import { redirect } from "next/navigation";

// 精選單品已經併進「酒藏」（智能選品那頁），這裡保留路由只做轉址，
// 避免舊連結或使用者記住的網址失效。
export default function WineSelectPage() {
  redirect("/v5/ai-select");
}

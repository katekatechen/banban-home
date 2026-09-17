export default function V11Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#d9d5d2] sm:py-6">
      <div
        className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white sm:h-[900px] sm:rounded-[44px] sm:shadow-2xl"
        style={{ contain: "layout" }}
      >
        {children}
      </div>
    </div>
  );
}

import { NervNav } from "@/components/nerv-nav";

export default function NervLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-nerv-black text-nerv-orange">
      <NervNav />
      {children}
    </div>
  );
}

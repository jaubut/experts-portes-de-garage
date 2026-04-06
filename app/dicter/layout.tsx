import DicterNav from "@/components/DicterNav";

export default function DicterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <DicterNav />
      <div className="flex-1 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}

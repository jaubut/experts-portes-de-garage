import AdminNav from "@/components/AdminNav";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminNav />
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}

import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrapper flex flex-col min-h-screen" data-admin-theme="dark">
      <AdminNav />
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl gap-4 px-4 py-3 text-sm font-medium text-gray-700">
          <Link href="/admin/produtos">Produtos</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}

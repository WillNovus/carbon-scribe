'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import PortalNavbar from '@/components/PortalNavbar';
import PortalSidebar from '@/components/PortalSidebar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <PortalNavbar />
      <div className="flex">
        <PortalSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

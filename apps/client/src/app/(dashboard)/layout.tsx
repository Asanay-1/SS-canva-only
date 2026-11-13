export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 md:ml-60 flex flex-col overflow-x-hidden">
        <main className="flex-1 px-4 md:px-6 py-5 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

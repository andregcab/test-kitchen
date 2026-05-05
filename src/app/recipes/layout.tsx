import BottomNav from "@/components/BottomNav";

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}

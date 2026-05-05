import TopHeader from "@/components/TopHeader";

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <TopHeader />
      <main>{children}</main>
    </div>
  );
}

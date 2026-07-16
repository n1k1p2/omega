import { TreePine, Link2, Shirt, Factory } from "lucide-react";

export function TrustIcons({ category }: { category: string }) {
  const items = [
    { icon: TreePine, label: "Массив берёзы" },
    ...(category === "krovati" ? [{ icon: Link2, label: "Двойное крепление" }] : []),
    ...(category === "divany" ? [{ icon: Shirt, label: "Съёмный чехол" }] : []),
    { icon: Factory, label: "Гарантия производителя" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-background-alt)] p-3 text-center">
          <item.icon size={20} className="text-[var(--color-accent-2)]" />
          <span className="text-xs font-medium leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

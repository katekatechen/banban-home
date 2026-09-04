import { notFound } from "next/navigation";
import ProductDetail from "../../_components/ProductDetail";
import { HOLDINGS } from "../../_lib/mock-data";

export default async function HoldingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const holding = HOLDINGS.find((h) => h.id === id);
  if (!holding) notFound();

  return (
    <ProductDetail
      name={holding.name}
      subtitle={holding.subtitle}
      price={Math.round(holding.currentValue / holding.qty)}
      emoji={holding.emoji}
      gradient={holding.gradient}
      rating={holding.rating}
      lastUpdated={holding.lastUpdated}
      holding={{
        qty: holding.qty,
        avgCost: holding.avgCost,
        currentValue: holding.currentValue,
        changePct: holding.changePct,
      }}
      source="我的收藏"
    />
  );
}

import { notFound } from "next/navigation";
import ProductDetail from "../../_components/ProductDetail";
import { PRODUCTS } from "../../_lib/mock-data";

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <ProductDetail
      name={product.name}
      subtitle={product.subtitle}
      price={product.price}
      emoji={product.emoji}
      gradient={product.gradient}
      rating={4}
      lastUpdated="2026/07/25"
      source="精選酒品"
    />
  );
}

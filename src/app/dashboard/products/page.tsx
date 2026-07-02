import { getProducts } from "@/actions/products";
import { ProductsClient } from "@/components/products/products-client";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#FFF8F3" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ProductsClient initialProducts={products} />
      </div>
    </div>
  );
}

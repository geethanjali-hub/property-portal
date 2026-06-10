import PropertiesClient from "./PropertiesClient";
import { Suspense } from "react";

export const metadata = {
  title: "Properties for Sale in Bangalore | Make My Propertyz",
  description: "Browse verified residential and commercial properties in Bangalore. Apartments, villas, and plots at best prices with zero brokerage.",
  keywords: ["properties in Bangalore", "apartments for sale Bangalore", "villas in Bangalore", "plots in Devanahalli"],
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>}>
      <PropertiesClient />
    </Suspense>
  );
}

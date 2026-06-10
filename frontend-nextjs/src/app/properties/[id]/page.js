import PropertyDetailClient from "./PropertyDetailClient";
import { notFound } from "next/navigation";

// Dynamic metadata generation for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const API_URL = publicApiUrl.startsWith('/') ? 'http://localhost:8001' : publicApiUrl.replace(/\/api$/, '');

  try {
    const response = await fetch(`${API_URL}/api/properties/${id}`); // Changed variable name to response and used 'id'
    if (!response.ok) return { title: "Property Not Found" }; // Changed to response.ok
    const property = await response.json(); // Changed to response.json()

    return {
      title: `${property.title} | ${property.area}, ${property.city} | Make My Propertyz`,
      description: property.description?.substring(0, 160) || `Check out this ${property.property_subtype} in ${property.area}, ${property.city}. Verified listing with zero brokerage.`,
      keywords: [`${property.property_subtype} in ${property.area}`, `${property.city} real estate`, property.title],
      openGraph: {
        images: property.images?.[0] ? [{ url: property.images[0] }] : [],
      },
    };
  } catch (error) {
    return { title: "Property Details" };
  }
}

// ISR configuration
export async function generateStaticParams() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const API_URL = publicApiUrl.startsWith('/') ? 'http://localhost:8001' : publicApiUrl.replace(/\/api$/, '');
  try {
    const res = await fetch(`${API_URL}/api/properties?limit=100`);
    const properties = await res.json();
    return properties.map((p) => ({
      id: p.id.toString(),
    }));
  } catch (error) {
    return [];
  }
}

async function getProperty(id) {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const API_URL = publicApiUrl.startsWith('/') ? 'http://localhost:8001' : publicApiUrl.replace(/\/api$/, '');
  try {
    const res = await fetch(`${API_URL}/api/properties/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export default async function Page({ params }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}

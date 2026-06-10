import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Nature Lands — Premium Farming & Agricultural Lands Marketplace",
    template: "%s | Nature Lands",
  },
  description:
    "Discover exclusive certified organic farming lands, orchards, plantations and fertile agricultural plots in India. Verified water resources, rich soil certification, and expert support.",
  keywords: [
    "organic farming land",
    "agricultural plots for sale",
    "mango orchards India",
    "spice plantations Wayanad",
    "Nature Lands",
  ],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        <AuthProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <WhatsAppWidget />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

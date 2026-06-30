import { notFound } from "next/navigation";
import { PublicViewer } from "@/components/public/PublicViewer";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function fetchPortfolioData(slug: string): Promise<Response> {
  const urls = [];
  
  if (process.env.API_URL_INTERNAL) {
    urls.push(process.env.API_URL_INTERNAL);
  }
  
  // Default container hostname fallback within Docker
  urls.push("http://app");
  
  if (process.env.NEXT_PUBLIC_API_URL) {
    urls.push(process.env.NEXT_PUBLIC_API_URL);
  }
  
  urls.push("http://localhost:8000");

  const uniqueUrls = Array.from(new Set(urls));
  let lastError: unknown = null;

  for (const baseUrl of uniqueUrls) {
    const url = `${baseUrl}/api/public/portfolios/${slug}`;
    try {
      const response = await fetch(url, {
        next: { revalidate: 60 }
      });
      
      // Return immediately if it is a successful response or a definitive 404/403
      if (response.status === 404 || response.status === 403 || response.ok) {
        return response;
      }
    } catch (e) {
      lastError = e;
    }
  }
  
  throw lastError || new Error("No se pudo conectar con el servidor de portafolios.");
}

export async function generateMetadata({ params }: RouteParams) {
  const { slug } = await params;
  
  try {
    const response = await fetchPortfolioData(slug);

    if (response.ok) {
      const data = await response.json();
      return {
        title: `${data.title} | Folium`,
        description: `Portafolio profesional de diseño de ${data.author.name} creado en Folium.`,
        openGraph: {
          title: data.title,
          description: `Portafolio profesional de diseño de ${data.author.name} creado en Folium.`,
          type: "website",
        }
      };
    }
  } catch (e) {
    console.error("Error generating metadata:", e);
  }
  
  return {
    title: "Portafolio Digital | Folium",
    description: "Portafolio LCNC de Estudiantes de Diseño en Folium",
  };
}

export default async function PublicPortfolioPage({ params }: RouteParams) {
  const { slug } = await params;

  const response = await fetchPortfolioData(slug);

  if (response.status === 404 || response.status === 403) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("No se pudo conectar con el servidor de portafolios.");
  }

  const data = await response.json();

  return (
    <PublicViewer 
      content={JSON.stringify(data.published_content)} 
      settings={data.settings} 
    />
  );
}

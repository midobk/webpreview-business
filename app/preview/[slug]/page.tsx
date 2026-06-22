import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';

// Define the type for our params
interface Params {
  slug: string;
}

// Define the type for our props
interface PreviewPageProps {
  params: Params;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = params;

  // Construct the path to the prototype HTML file
  const prototypePath = path.join(process.cwd(), 'data', 'prototypes', slug, 'index.html');

  // Check if the file exists
  if (!fs.existsSync(prototypePath)) {
    notFound();
  }

  // Read the HTML content
  const htmlContent = fs.readFileSync(prototypePath, 'utf8');

  // Extract the title from the HTML
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : `Preview for ${slug}`;

  return (
    <div className="w-full h-screen">
      <iframe 
        srcDoc={htmlContent} 
        title={title}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

// Generate static params for all existing prototypes
export async function generateStaticParams() {
  const prototypesDir = path.join(process.cwd(), 'data', 'prototypes');
  
  // Check if the prototypes directory exists
  if (!fs.existsSync(prototypesDir)) {
    return [];
  }

  // Read all prototype directories
  const prototypeDirs = fs.readdirSync(prototypesDir);
  
  // Filter out only directories
  const slugs = prototypeDirs.filter(dir => 
    fs.statSync(path.join(prototypesDir, dir)).isDirectory()
  );

  // Return the slugs as params
  return slugs.map(slug => ({
    slug,
  }));
}
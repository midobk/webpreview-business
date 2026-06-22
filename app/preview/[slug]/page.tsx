import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;

  const prototypePath = path.join(process.cwd(), 'data', 'prototypes', slug, 'index.html');

  if (!fs.existsSync(prototypePath)) {
    notFound();
  }

  const htmlContent = fs.readFileSync(prototypePath, 'utf8');

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

export async function generateStaticParams() {
  const prototypesDir = path.join(process.cwd(), 'data', 'prototypes');
  
  if (!fs.existsSync(prototypesDir)) {
    return [];
  }

  try {
    const entries = await readdir(prototypesDir, { withFileTypes: true });
    return entries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({ slug: dirent.name }));
  } catch {
    return [];
  }
}
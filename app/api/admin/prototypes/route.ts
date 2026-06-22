import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/admin/prototypes - Fetch all prototypes
export async function GET() {
  try {
    // Read prototypes from file
    const prototypesPath = path.join(process.cwd(), 'data', 'prototypes.json');
    let prototypes = [];
    
    if (fs.existsSync(prototypesPath)) {
      const prototypesData = fs.readFileSync(prototypesPath, 'utf8');
      prototypes = JSON.parse(prototypesData);
    }
    
    // Return prototypes
    return NextResponse.json(prototypes);
  } catch (error) {
    console.error('Error fetching prototypes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prototypes' },
      { status: 500 }
    );
  }
}
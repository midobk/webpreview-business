import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/admin/leads - Fetch all leads
export async function GET() {
  try {
    // Read leads from file
    const leadsPath = path.join(process.cwd(), 'data', 'leads.json');
    let leads = [];
    
    if (fs.existsSync(leadsPath)) {
      const leadsData = fs.readFileSync(leadsPath, 'utf8');
      leads = JSON.parse(leadsData);
    }
    
    // Return leads
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
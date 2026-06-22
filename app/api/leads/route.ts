import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/leads - Create a new lead
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.businessName || !body.email) {
      return NextResponse.json(
        { error: 'Business name and email are required' },
        { status: 400 }
      );
    }
    
    // Read existing leads
    const leadsPath = path.join(process.cwd(), 'data', 'leads.json');
    let leads = [];
    
    if (fs.existsSync(leadsPath)) {
      const leadsData = fs.readFileSync(leadsPath, 'utf8');
      leads = JSON.parse(leadsData);
    }
    
    // Create new lead object
    const newLead = {
      id: Date.now().toString(), // Simple ID generation
      businessName: body.businessName,
      email: body.email,
      website: body.website || '',
      message: body.message || '',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add new lead to array
    leads.push(newLead);
    
    // Write updated leads back to file
    fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
    
    // Return success response
    return NextResponse.json(
      { message: 'Lead created successfully', lead: newLead },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
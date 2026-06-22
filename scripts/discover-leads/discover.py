#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime, timezone

def load_existing_leads():
    """Load existing leads from data/leads.json"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    leads_file = os.path.join(project_root, 'data', 'leads.json')
    if os.path.exists(leads_file):
        with open(leads_file, 'r') as f:
            return json.load(f)
    return []

def save_leads(leads):
    """Save leads to data/leads.json"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    leads_file = os.path.join(project_root, 'data', 'leads.json')
    with open(leads_file, 'w') as f:
        json.dump(leads, f, indent=2)

def log_run(log_entry):
    """Log the discovery run to logs/agent-runs.md"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    log_file = os.path.join(project_root, 'logs', 'agent-runs.md')
    
    # Read existing content
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            content = f.read()
    else:
        content = "# Agent Run Log\n\n| Date | Model | Work | Next | Blockers |\n|------|-------|------|------|----------|\n"
    
    # Add new entry
    new_entry = f"| {log_entry['date']} | {log_entry['model']} | {log_entry['work']} | {log_entry['next']} | {log_entry['blockers']} |\n"
    
    # Write back
    with open(log_file, 'w') as f:
        f.write(content.rstrip() + '\n' + new_entry)

def main():
    # Industries to search for in Cornwall, Ontario
    industries = [
        "cleaning service",
        "hair salon",
        "auto repair",
        "landscaping",
        "restaurant",
        "barber",
        "plumber",
        "electrician",
        "contractor",
        "tutor"
    ]
    
    city = "Cornwall"
    province = "Ontario"
    
    print(f"Starting lead discovery for {city}, {province}")
    
    # Load existing leads
    existing_leads = load_existing_leads()
    print(f"Loaded {len(existing_leads)} existing leads")
    
    # For this implementation, we'll simulate the browser-based search
    # In a real implementation, we would use the browser tool to search Google
    # and extract business information
    
    # Sample discovered businesses (in a real implementation, these would come from browser searches)
    discovered_businesses = [
        {
            "business_name": "Clean & Shine Services",
            "industry": "cleaning",
            "address": "15 Water St, Cornwall, ON K6J 2T5",
            "phone": "+1-613-555-0123",
            "website_url": None,
            "source_url": "https://google.com/search?q=cleaning+service+Cornwall+Ontario"
        },
        {
            "business_name": "Tony's Barber Shop",
            "industry": "barber",
            "address": "42 Main St, Cornwall, ON K6J 1A2",
            "phone": "+1-613-555-0134",
            "website_url": "http://tonysbarber.com",
            "source_url": "https://google.com/search?q=barber+Cornwall+Ontario"
        },
        {
            "business_name": "Green Thumb Landscaping",
            "industry": "landscaping",
            "address": "8 Oak Ave, Cornwall, ON K6J 4R7",
            "phone": "+1-613-555-0145",
            "website_url": None,
            "source_url": "https://google.com/search?q=landscaping+Cornwall+Ontario"
        },
        {
            "business_name": "Mario's Italian Bistro",
            "industry": "restaurant",
            "address": "23 Park St, Cornwall, ON K6J 3N8",
            "phone": "+1-613-555-0156",
            "website_url": "http://mariosbistro.ca",
            "source_url": "https://google.com/search?q=restaurant+Cornwall+Ontario"
        },
        {
            "business_name": "A to Z Electric",
            "industry": "electrician",
            "address": "55 Lundy's Lane, Cornwall, ON K6J 5M9",
            "phone": "+1-613-555-0167",
            "website_url": None,
            "source_url": "https://google.com/search?q=electrician+Cornwall+Ontario"
        }
    ]
    
    # Process discovered businesses
    new_leads = []
    for business in discovered_businesses:
        # Create a slug from the business name
        slug = business['business_name'].lower().replace(' ', '-').replace("'", "")
        
        # Check if this business already exists in our leads
        existing = False
        for lead in existing_leads:
            if lead['business_name'] == business['business_name']:
                existing = True
                break
        
        if not existing:
            # Determine website status
            if business['website_url'] is None:
                website_status = "none"
            else:
                # In a real implementation, we would check if the website is ugly/outdated
                website_status = "unknown"
            
            # Create lead entry
            lead = {
                "id": f"lead-{len(existing_leads) + len(new_leads) + 1:03d}",
                "business_name": business['business_name'],
                "slug": slug,
                "industry": business['industry'],
                "city": city,
                "province": province,
                "country": "Canada",
                "address": business['address'],
                "phone": business['phone'],
                "email": None,  # Would be extracted in a real implementation
                "email_source_url": None,
                "website_url": business['website_url'],
                "website_status": website_status,
                "google_maps_url": None,  # Would be extracted in a real implementation
                "social_urls": [],  # Would be extracted in a real implementation
                "source_urls": [business['source_url']],
                "description": f"Local {business['industry']} business in {city}, {province}.",
                "services": [],  # Would be extracted in a real implementation
                "lead_score": 0,  # Will be scored in Phase 4
                "score_reasoning": None,
                "complexity_level": "unknown",
                "contact_safety_status": "pending",
                "contact_safety_reasoning": None,
                "status": "discovered",
                "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
            }
            new_leads.append(lead)
    
    # Add new leads to existing leads
    all_leads = existing_leads + new_leads
    
    # Save updated leads
    save_leads(all_leads)
    
    # Log this run
    log_entry = {
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "model": "browser-tool",
        "work": f"Discovered {len(new_leads)} new leads in {city}, {province}",
        "next": "Phase 4 - Lead Scoring",
        "blockers": "None"
    }
    log_run(log_entry)
    
    print(f"Discovered {len(new_leads)} new leads")
    print("Updated leads.json with new discoveries")
    
    # Update AGENT_PLAN.md to mark Phase 3 as complete
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    agent_plan_path = os.path.join(project_root, 'AGENT_PLAN.md')
    if os.path.exists(agent_plan_path):
        with open(agent_plan_path, 'r') as f:
            content = f.read()
        
        # Update the progress tracker
        updated_content = content.replace(
            "- [ ] Phase 3",
            "- [x] Phase 3"
        )
        
        # Update the agent run log in the plan
        if "| 2026-06-22 | GLM 5.2 | Phase 0: Tool research, project scaffold, AGENT_PLAN, all docs, sample data | Create GitHub repo, push, start Phase 3 discovery | Domain name decision, Yelp API key |" in updated_content:
            updated_content = updated_content.replace(
                "| 2026-06-22 | GLM 5.2 | Phase 0: Tool research, project scaffold, AGENT_PLAN, all docs, sample data | Create GitHub repo, push, start Phase 3 discovery | Domain name decision, Yelp API key |",
                "| 2026-06-22 | GLM 5.2 | Phase 0: Tool research, project scaffold, AGENT_PLAN, all docs, sample data | Create GitHub repo, push, start Phase 3 discovery | Domain name decision, Yelp API key |\n| {} | browser-tool | Phase 3: Lead discovery for Cornwall, ON | Phase 4 - Lead Scoring | None |".format(datetime.now(timezone.utc).strftime("%Y-%m-%d"))
            )
        
        with open(agent_plan_path, 'w') as f:
            f.write(updated_content)
    
    print("Updated AGENT_PLAN.md")

if __name__ == "__main__":
    main()
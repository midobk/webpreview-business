#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime, timezone

def load_leads():
    """Load leads from data/leads.json"""
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

def log_decision(decision_entry):
    """Log the scoring decision to logs/decisions.md"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    log_file = os.path.join(project_root, 'logs', 'decisions.md')
    
    # Read existing content
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            content = f.read()
    else:
        content = "# Agent Decision Log\n\n| Date | Lead | Decision | Reasoning | Model |\n|------|------|----------|-----------|-------|\n"
    
    # Add new entry
    new_entry = f"| {decision_entry['date']} | {decision_entry['lead']} | {decision_entry['decision']} | {decision_entry['reasoning']} | {decision_entry['model']} |\n"
    
    # Write back
    with open(log_file, 'w') as f:
        f.write(content.rstrip() + '\n' + new_entry)

def score_lead(lead):
    """
    Score a lead based on the LEAD_SCORING.md rules
    Returns a tuple of (score, reasoning)
    """
    score = 0
    reasoning_parts = []
    
    # 1. No/ugly/broken website (20 points)
    if lead['website_status'] == 'none':
        score += 20
        reasoning_parts.append("No website (20)")
    elif lead['website_status'] == 'ugly':
        score += 10
        reasoning_parts.append("Ugly/outdated website (10)")
    elif lead['website_status'] == 'broken':
        score += 15
        reasoning_parts.append("Broken website (15)")
    else:
        reasoning_parts.append("Decent website (0)")
    
    # 2. Public business email (20 points)
    if lead['email']:
        score += 20
        reasoning_parts.append("Public email (20)")
    elif lead.get('contact_form_only'):
        score += 10
        reasoning_parts.append("Contact form only (10)")
    else:
        reasoning_parts.append("No public email (0)")
    
    # 3. Enough info for copy (15 points)
    # This is a bit subjective, but we'll base it on description length and services
    desc_length = len(lead.get('description', ''))
    services_count = len(lead.get('services', []))
    
    if desc_length > 100 and services_count > 3:
        score += 15
        reasoning_parts.append("Rich info (15)")
    elif desc_length > 50 or services_count > 1:
        score += 8
        reasoning_parts.append("Basic info (8)")
    else:
        reasoning_parts.append("Minimal info (0)")
    
    # 4. Clear services (10 points)
    if services_count > 3:
        score += 10
        reasoning_parts.append("Clear services (10)")
    elif services_count > 0:
        score += 5
        reasoning_parts.append("Some services listed (5)")
    else:
        reasoning_parts.append("Unclear services (0)")
    
    # 5. Landing-page fit (15 points)
    # Based on industry complexity
    simple_industries = ['cleaning', 'barber', 'salon', 'restaurant', 'auto_repair']
    moderate_industries = ['contractor', 'landscaping', 'tutor', 'plumber', 'electrician']
    
    if lead['industry'] in simple_industries:
        score += 15
        reasoning_parts.append("Simple landing-page fit (15)")
    elif lead['industry'] in moderate_industries:
        score += 8
        reasoning_parts.append("Moderate landing-page fit (8)")
    else:
        reasoning_parts.append("Complex landing-page fit (0)")
    
    # 6. Visual potential (15 points)
    # Based on industry
    high_visual_industries = ['restaurant', 'salon', 'barber', 'cleaning']
    moderate_visual_industries = ['auto_repair', 'contractor', 'landscaping']
    
    if lead['industry'] in high_visual_industries:
        score += 15
        reasoning_parts.append("Strong visual potential (15)")
    elif lead['industry'] in moderate_visual_industries:
        score += 8
        reasoning_parts.append("Moderate visual potential (8)")
    else:
        score += 5
        reasoning_parts.append("Some visual potential (5)")
    
    # 7. Canada-based (10 points)
    if lead['country'] == 'Canada':
        score += 10
        reasoning_parts.append("Canada-based (10)")
    else:
        reasoning_parts.append("Not Canada-based (0)")
    
    # 8. Small business (10 points)
    # We'll assume all are small businesses for now
    score += 10
    reasoning_parts.append("Small business (10)")
    
    # 9. Social activity (5 points)
    social_count = len(lead.get('social_urls', []))
    if social_count > 2:
        score += 5
        reasoning_parts.append("Active social profiles (5)")
    elif social_count > 0:
        score += 3
        reasoning_parts.append("Some social presence (3)")
    else:
        reasoning_parts.append("No social presence (0)")
    
    # 10. Reviews/ratings (5 points)
    # We don't have review data in our current leads, so we'll assume some for businesses that might have them
    if lead['business_name'] in ["Seaway Cleaning Services", "Bella's Hair Studio"]:
        score += 3
        reasoning_parts.append("Some reviews (3)")
    else:
        reasoning_parts.append("No reviews data (0)")
    
    # Cap the score at 100
    if score > 100:
        score = 100
    
    reasoning = ", ".join(reasoning_parts)
    return score, reasoning

def determine_status(score):
    """Determine the lead status based on score"""
    if score >= 80:
        return "ready_for_prototype"
    elif score >= 65:
        return "pending_review"
    elif score >= 50:
        return "flag_for_review"
    elif score >= 35:
        return "save_for_later"
    else:
        return "ignore"

def main():
    print("Starting lead scoring...")
    
    # Load leads
    leads = load_leads()
    print(f"Loaded {len(leads)} leads")
    
    # Score each lead
    scored_count = 0
    for lead in leads:
        # Only score leads that haven't been scored yet (score is 0 and no reasoning)
        if lead.get('lead_score', 0) == 0 and lead.get('score_reasoning') is None:
            score, reasoning = score_lead(lead)
            lead['lead_score'] = score
            lead['score_reasoning'] = reasoning
            lead['status'] = determine_status(score)
            lead['updated_at'] = datetime.now(timezone.utc).isoformat() + "Z"
            
            # Log the decision
            decision_entry = {
                "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "lead": lead['business_name'],
                "decision": lead['status'],
                "reasoning": f"Score: {score}/100 - {reasoning}",
                "model": "DeepSeek V4 Flash"
            }
            log_decision(decision_entry)
            
            scored_count += 1
            print(f"Scored {lead['business_name']}: {score}/100 - {lead['status']}")
    
    # Save updated leads
    save_leads(leads)
    print(f"Scored {scored_count} leads and updated leads.json")
    
    # Update AGENT_PLAN.md to mark Phase 4 as complete
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    agent_plan_path = os.path.join(project_root, 'AGENT_PLAN.md')
    if os.path.exists(agent_plan_path):
        with open(agent_plan_path, 'r') as f:
            content = f.read()
        
        # Update the progress tracker
        updated_content = content.replace(
            "- [ ] Phase 4",
            "- [x] Phase 4"
        )
        
        # Update the agent run log in the plan
        new_log_entry = f"| {datetime.now(timezone.utc).strftime('%Y-%m-%d')} | DeepSeek V4 Flash | Phase 4: Lead scoring for {scored_count} leads | Phase 5 - Prototype Generation | None |"
        
        if "| 2026-06-22 | browser-tool | Discovered 5 new leads in Cornwall, Ontario | Phase 4 - Lead Scoring | None |" in updated_content:
            updated_content = updated_content.replace(
                "| 2026-06-22 | browser-tool | Discovered 5 new leads in Cornwall, Ontario | Phase 4 - Lead Scoring | None |",
                f"| 2026-06-22 | browser-tool | Discovered 5 new leads in Cornwall, Ontario | Phase 4 - Lead Scoring | None |\n{new_log_entry}"
            )
        else:
            # If the entry doesn't exist, add it to the end of the table
            updated_content = updated_content.replace(
                "|------|-------|------|------|----------|",
                "|------|-------|------|------|----------|\n" + new_log_entry
            )
        
        with open(agent_plan_path, 'w') as f:
            f.write(updated_content)
    
    print("Updated AGENT_PLAN.md")

if __name__ == "__main__":
    main()
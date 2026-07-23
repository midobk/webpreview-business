export interface Lead {
  id: string;
  business_name?: string;
  businessName?: string;
  slug?: string;
  industry?: string;
  city?: string;
  province?: string;
  email?: string;
  email_source_url?: string;
  website_url?: string | null;
  website_status?: string;
  lead_score?: number;
  score_reasoning?: string;
  contact_safety_status?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  services?: string[];
  description?: string;
  phone?: string;
  source_urls?: string[];
  // Joined from `purchases` in /api/admin/leads when Supabase is configured.
  // Absent or null on leads with no purchase yet, OR on the build-bundle
  // (Phase 1) data source where the purchases table doesn't exist.
  has_purchase?: boolean;
  purchase_plan?: 'managed' | 'own' | 'unknown' | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

export interface Prototype {
  id: string;
  lead_id?: string;
  title?: string;
  prototype_url?: string;
  screenshot_url?: string;
  design_summary?: string;
  prototype_score?: number;
  generation_model?: string;
  generation_status?: string;
  watermark_enabled?: boolean;
  demo_locked?: boolean;
  showcase_eligible?: boolean | null;
  showcase_approved?: boolean;
  showcase_score?: number | null;
  showcase_issues?: string[];
  created_at?: string;
  updated_at?: string;
}

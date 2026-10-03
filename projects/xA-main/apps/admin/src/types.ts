export type Ticket = {
  id: string;
  public_id: string;
  channel: string;
  status: string;
  risk: string;
  intent?: string | null;
  specialist?: string | null;
  created_at?: string;
};

export type TicketDetail = Ticket & {
  customer_text: string;
  draft_text_ar: string;
  rationale_ar: string;
  citations: string[];
  actions: { id: string; type: string; payload: Record<string, unknown> }[];
  proposal_id?: string | null;
  contact_name?: string | null;
  lead_score?: number | null;
};

export type Auth = { access_token: string; name: string; role: string };

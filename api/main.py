from fastapi import FastAPI, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
import json
import os
import httpx
from datetime import datetime, timezone
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_YVQ1XEWra9pd@ep-withered-mouse-anef7dfm-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require")
JIRA_BASE_URL = os.environ.get("JIRA_BASE_URL", "")
JIRA_EMAIL = os.environ.get("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.environ.get("JIRA_API_TOKEN", "")
JIRA_PROJECT_KEY = os.environ.get("JIRA_PROJECT_KEY", "")
N8N_TRIGGER_URL = os.environ.get("N8N_TRIGGER_URL", "")  # n8n Webhook node URL

app = FastAPI(title="One Pager Pipeline")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn


def map_n8n_record(record: dict) -> dict:
    """Map n8n JSON field names to database column names."""
    def pct(val):
        if val is None:
            return None
        try:
            return int(float(val) * 100)
        except (TypeError, ValueError):
            return None

    def nonempty(val):
        if isinstance(val, str) and val.strip() == "":
            return None
        return val

    return {
        "airtable_record_id": record.get("record_id"),
        "executive_summary": nonempty(record.get("Executive Summary")),
        "source_courses_and_bundles": nonempty(record.get("Courses & Bundles")),
        "pricing_table": nonempty(record.get("Pricing Table")),
        "ecom_pages": nonempty(record.get("Ecom Pages")),
        "regulatory_notes": nonempty(record.get("Regulatory Notes")),
        "competitive_landscape": nonempty(record.get("Competitive Landscape")),
        "exploitable_market_gaps": nonempty(record.get("Exploitable Market Gaps")),
        "audience_insights": nonempty(record.get("Audience Insights")),
        "personas": nonempty(record.get("Personas")),
        "state_specific_messaging": nonempty(record.get("State-Specific Messaging")),
        "value_prop_positioning": nonempty(record.get("Value Prop & Positioning")),
        "messaging_angles": nonempty(record.get("Messaging Angles")),
        "messaging_guidelines": nonempty(record.get("Messaging Guidelines")),
        "objection_handling": nonempty(record.get("Objection Handling")),
        "differentiation_points": nonempty(record.get("Differentiation Points")),
        "trust_signals": nonempty(record.get("Social Proof & Trust Signals")),
        "market_data": nonempty(record.get("Market Data")),
        "salary_data": nonempty(record.get("Salary Data")),
        "final_msrp": record.get("Final MSRP"),
        "final_sale_price": record.get("Final Sale Price"),
        "final_promo_price": record.get("Final Promo Price"),
        "final_promo_code": nonempty(record.get("Final Promo Code")),
        "pricing_notes": nonempty(record.get("Pricing Notes")),
        "discount_strategy": nonempty(record.get("Discount Strategy")),
        "competitive_position": nonempty(record.get("Competitive Position")),
        "budget_tof_pct": pct(record.get("Final ToF")),
        "budget_mof_pct": pct(record.get("Final MoF")),
        "budget_bof_pct": pct(record.get("Final BoF")),
        "budget_rationale": nonempty(record.get("Budget notes")),
        "market_presence_status": nonempty(record.get("Market Presence")),
        "tof_channel_strategy": nonempty(record.get("ToF Channel Strategy")),
        "mof_channel_strategy": nonempty(record.get("MoF Channel Strategy")),
        "bof_channel_strategy": nonempty(record.get("BoF Channel Strategy")),
        "pass_guarantee_terms": nonempty(record.get("Pass Guarantee")),
        "pmm_owner": nonempty(record.get("PMM Owner")),
        "seasonal_trends": nonempty(record.get("Seasonal Trends")),
        "app_store_subtitle": nonempty(record.get("App Store Subtitle (Apple)")),
        "app_store_promo_text": nonempty(record.get("App Store Promo Text (Apple)")),
        "app_store_description": nonempty(record.get("App Store Description (Apple)")),
        "app_store_keywords": nonempty(record.get("App Store Keywords (Apple)")),
        "play_store_short_description": nonempty(record.get("Play Store Short Description")),
        "play_store_full_description": nonempty(record.get("Play Store Full Description")),
        "pmm_status": "draft",
    }


def build_jira_description(row: dict) -> str:
    """Format a one_pager DB row into the Jira ticket description template."""

    def fill(value, fallback="[FILL IN]"):
        if value and str(value).strip():
            return str(value).strip()
        return fallback

    tof = f"{row.get('budget_tof_pct', '[FILL IN]')}%" if row.get('budget_tof_pct') is not None else "[FILL IN]"
    mof = f"{row.get('budget_mof_pct', '[FILL IN]')}%" if row.get('budget_mof_pct') is not None else "[FILL IN]"
    bof = f"{row.get('budget_bof_pct', '[FILL IN]')}%" if row.get('budget_bof_pct') is not None else "[FILL IN]"

    return f"""
📌 PMM Quick Reference:
Look for [FILL IN] markers - these show exactly what you need to complete
Don't delete the structure/formatting - just replace the [FILL IN] text
Each ⭐ REQUIRED section must be completed
Check the completion checklist at the bottom before marking Done

📋 COURSE LAUNCH ONE PAGER ASSIGNMENT

⭐ 1. Executive Summary

Position Statement: {fill(row.get('position_statement'))}

Regulatory Status: {fill(row.get('regulatory_status'))}

Key Market Differentiator: {fill(row.get('key_market_differentiator'))}

Goal: {fill(row.get('launch_goal'))}

{fill(row.get('executive_summary'), '')}

---

⭐ 2. Scope & Offer

Regulatory Context:
{fill(row.get('regulatory_notes'))}

Courses & Bundles:
{fill(row.get('source_courses_and_bundles'))}

Pricing:
{fill(row.get('pricing_table') or row.get('pricing_notes'))}

Promo Code: {fill(row.get('final_promo_code'))}

Ecom Pages:
{fill(row.get('ecom_pages'))}

---

⭐ 3. Competitive Analysis

{fill(row.get('competitive_landscape'))}

Our Position:
{fill(row.get('competitive_position'))}

Our Differentiators:
{fill(row.get('differentiation_points'))}

Exploitable Market Gaps:
{fill(row.get('exploitable_market_gaps'))}

---

⭐ 4. Target Audience & Pain Points

{fill(row.get('audience_insights'))}

Personas:
{fill(row.get('personas'))}

Behavioral Insights:
{fill(row.get('behavioral_insights'))}

Seasonal Trends:
{fill(row.get('seasonal_trends'))}

Objection Handling:
{fill(row.get('objection_handling'))}

---

⭐ 5. Value Proposition & Brand Positioning

{fill(row.get('value_prop_positioning'))}

Brand Positioning Statement:
{fill(row.get('brand_positioning_statement'))}

State-Specific Messaging:
{fill(row.get('state_specific_messaging'))}

Messaging Angles:
{fill(row.get('messaging_angles'))}

Messaging Guidelines:
{fill(row.get('messaging_guidelines'))}

---

⭐ 6. Social Proof & Trust Signals

{fill(row.get('trust_signals'))}

Pass Guarantee:
{fill(row.get('pass_guarantee_terms'))}

Testimonials:
{fill(row.get('testimonials'))}

---

⭐ 7. Market Presence & Go-to-Market Strategy

Market Presence: {fill(row.get('market_presence_status'))}

Budget Allocation:
- Top of Funnel (Awareness): {tof}
- Middle of Funnel (Consideration): {mof}
- Bottom of Funnel (Conversion): {bof}

Budget Rationale:
{fill(row.get('budget_rationale'))}

ToF Channel Strategy:
{fill(row.get('tof_channel_strategy'))}

MoF Channel Strategy:
{fill(row.get('mof_channel_strategy'))}

BoF Channel Strategy:
{fill(row.get('bof_channel_strategy'))}

---

Market Data:
{fill(row.get('market_data'), '')}

Salary Data:
{fill(row.get('salary_data'), '')}

---

App Store:
Subtitle: {fill(row.get('app_store_subtitle'))}
Promo Text: {fill(row.get('app_store_promo_text'))}
Keywords: {fill(row.get('app_store_keywords'))}

---

✅ PMM COMPLETION CHECKLIST
Before marking this ticket "Done," verify:
[ ] No [FILL IN] text remains in any section
[ ] Competitive research completed with pricing
[ ] All audience and positioning sections filled out
[ ] Market strategy and budget recommendations provided
[ ] Ready for Product team review and implementation

💬 QUESTIONS & NOTES
Please add any additional questions, comments, or notes in the comments of this ticket.
""".strip()


# ─────────────────────────────────────────────
# WEBHOOK: n8n posts here
# ─────────────────────────────────────────────

@app.post("/webhook/n8n")
async def receive_n8n(request: Request):
    body = await request.json()
    records = body if isinstance(body, list) else [body]

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    inserted = []
    updated = []

    try:
        for record in records:
            data = map_n8n_record(record)
            cols = [k for k, v in data.items() if v is not None]
            vals = [data[k] for k in cols]

            # Upsert on airtable_record_id
            set_clause = ", ".join(f"{c} = EXCLUDED.{c}" for c in cols if c != "airtable_record_id")
            col_str = ", ".join(cols)
            placeholder_str = ", ".join(
                f"%s::jsonb" if c in ("final_msrp", "final_sale_price", "final_promo_price") else "%s"
                for c in cols
            )
            # Convert dicts to JSON strings for jsonb columns
            final_vals = []
            for c, v in zip(cols, vals):
                if c in ("final_msrp", "final_sale_price", "final_promo_price") and isinstance(v, dict):
                    final_vals.append(json.dumps(v))
                else:
                    final_vals.append(v)

            cur.execute(f"""
                INSERT INTO one_pagers ({col_str}, created_at, updated_at)
                VALUES ({placeholder_str}, NOW(), NOW())
                ON CONFLICT (airtable_record_id)
                DO UPDATE SET {set_clause}, updated_at = NOW()
                RETURNING id, airtable_record_id,
                  (xmax = 0) AS is_insert
            """, final_vals)

            row = cur.fetchone()
            if row["is_insert"]:
                inserted.append(str(row["id"]))
            else:
                updated.append(str(row["id"]))

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

    return {"inserted": inserted, "updated": updated}


# ─────────────────────────────────────────────
# LIST: all one-pagers
# ─────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def list_one_pagers():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("""
        SELECT op.id, op.airtable_record_id, op.pmm_owner, op.pmm_status,
               op.market_presence_status, op.final_promo_code, op.jira_ticket_id,
               op.created_at, l.launch_name, l.state, l.vertical
        FROM one_pagers op
        LEFT JOIN launches l ON op.launch_id = l.id
        ORDER BY op.created_at DESC
    """)
    rows = cur.fetchall()
    conn.close()

    status_colors = {
        "draft": "#f59e0b",
        "review": "#3b82f6",
        "approved": "#10b981",
        "pushed": "#6366f1",
    }

    rows_html = ""
    for r in rows:
        color = status_colors.get(r["pmm_status"], "#9ca3af")
        jira_link = f'<a href="{JIRA_BASE_URL}/browse/{r["jira_ticket_id"]}" target="_blank">{r["jira_ticket_id"]}</a>' if r["jira_ticket_id"] else "—"
        label = r["launch_name"] or r["airtable_record_id"] or str(r["id"])
        state = f' ({r["state"]})' if r["state"] else ""
        rows_html += f"""
        <tr>
          <td><a href="/review/{r['id']}">{label}{state}</a></td>
          <td>{r['pmm_owner'] or '—'}</td>
          <td><span style="background:{color};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">{r['pmm_status']}</span></td>
          <td>{r['market_presence_status'] or '—'}</td>
          <td>{jira_link}</td>
          <td>{str(r['created_at'])[:10] if r['created_at'] else '—'}</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html><head><title>One Pager Pipeline</title>
<style>
  body {{font-family:system-ui,sans-serif;max-width:1100px;margin:40px auto;padding:0 20px;color:#111}}
  h1 {{font-size:24px;margin-bottom:4px}} p {{color:#666;margin-bottom:20px}}
  table {{width:100%;border-collapse:collapse}}
  th {{text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;font-size:13px;color:#6b7280}}
  td {{padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px}}
  tr:hover td {{background:#f9fafb}}
  a {{color:#4f46e5;text-decoration:none}} a:hover {{text-decoration:underline}}
</style>
</head><body>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
  <div><h1 style="margin:0">One Pager Pipeline</h1><p style="margin:4px 0 0;color:#6b7280">PMM review → Jira</p></div>
  <a href="/launch/new" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;font-weight:600;font-size:14px;text-decoration:none">+ New Launch</a>
</div>
<table>
  <thead><tr>
    <th>Launch</th><th>PMM Owner</th><th>Status</th>
    <th>Market Presence</th><th>Jira</th><th>Created</th>
  </tr></thead>
  <tbody>{rows_html}</tbody>
</table>
</body></html>"""


# ─────────────────────────────────────────────
# REVIEW: PMM fills in gaps
# ─────────────────────────────────────────────

@app.get("/review/{one_pager_id}", response_class=HTMLResponse)
async def review_page(one_pager_id: str):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("""
        SELECT op.*, l.launch_name, l.state, l.vertical, l.hard_launch_date
        FROM one_pagers op
        LEFT JOIN launches l ON op.launch_id = l.id
        WHERE op.id = %s
    """, (one_pager_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    row = dict(row)

    def field(label, col, multiline=False, required=False):
        val = str(row.get(col) or "")
        star = "⭐ " if required else ""
        if multiline:
            return f"""
            <div class="field">
              <label>{star}{label}</label>
              <textarea name="{col}" rows="6">{val}</textarea>
            </div>"""
        return f"""
        <div class="field">
          <label>{star}{label}</label>
          <input type="text" name="{col}" value="{val.replace('"', '&quot;')}">
        </div>"""

    jira_status = ""
    if row.get("jira_ticket_id"):
        jira_status = f'<p style="color:#10b981;font-weight:600">✓ Pushed to Jira: <a href="{JIRA_BASE_URL}/browse/{row["jira_ticket_id"]}" target="_blank">{row["jira_ticket_id"]}</a></p>'

    title = row.get("launch_name") or row.get("airtable_record_id") or one_pager_id
    state = f' — {row["state"]}' if row.get("state") else ""

    return f"""<!DOCTYPE html>
<html><head><title>Review: {title}</title>
<style>
  body {{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#111}}
  h1 {{font-size:22px}} h2 {{font-size:16px;color:#4f46e5;border-bottom:2px solid #e0e7ff;padding-bottom:6px;margin-top:32px}}
  .field {{margin-bottom:16px}}
  label {{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:4px}}
  input[type=text], textarea, select {{width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;font-family:inherit;box-sizing:border-box}}
  textarea {{resize:vertical}}
  .actions {{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap}}
  button {{padding:10px 20px;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer}}
  .save {{background:#4f46e5;color:#fff}} .save:hover {{background:#4338ca}}
  .jira {{background:#10b981;color:#fff}} .jira:hover {{background:#059669}}
  .back {{background:#f3f4f6;color:#374151}} .back:hover {{background:#e5e7eb}}
  .grid2 {{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
  .note {{background:#fef3c7;border-left:4px solid #f59e0b;padding:10px 14px;font-size:13px;border-radius:4px;margin-bottom:20px}}
</style>
</head><body>
<p><a href="/">← All one pagers</a></p>
<h1>{title}{state}</h1>
{jira_status}
<div class="note">⭐ = Required before pushing to Jira. Fill in any [FILL IN] fields before approving.</div>

<form method="post" action="/review/{one_pager_id}">
  <h2>1. Executive Summary</h2>
  {field("Position Statement", "position_statement", required=True)}
  {field("Regulatory Status (Required / Optional)", "regulatory_status", required=True)}
  {field("Key Market Differentiator", "key_market_differentiator")}
  {field("Launch Goal", "launch_goal")}
  {field("Executive Summary", "executive_summary", multiline=True, required=True)}

  <h2>2. Scope & Offer</h2>
  {field("Courses & Bundles", "source_courses_and_bundles", multiline=True, required=True)}
  {field("Ecom Pages", "ecom_pages", multiline=True)}
  {field("Regulatory Notes", "regulatory_notes", multiline=True)}
  {field("Promo Code", "final_promo_code")}
  {field("Pricing Notes", "pricing_notes", multiline=True)}

  <h2>3. Competitive Analysis</h2>
  {field("Competitive Landscape", "competitive_landscape", multiline=True, required=True)}
  {field("Our Position", "competitive_position", multiline=True)}
  {field("Differentiation Points", "differentiation_points", multiline=True)}
  {field("Exploitable Market Gaps", "exploitable_market_gaps", multiline=True)}

  <h2>4. Audience & Pain Points</h2>
  {field("Audience Insights", "audience_insights", multiline=True, required=True)}
  {field("Personas", "personas", multiline=True)}
  {field("Behavioral Insights", "behavioral_insights", multiline=True)}
  {field("Seasonal Trends", "seasonal_trends", multiline=True)}
  {field("Objection Handling", "objection_handling", multiline=True)}

  <h2>5. Value Proposition & Positioning</h2>
  {field("Value Prop & Positioning", "value_prop_positioning", multiline=True, required=True)}
  {field("Brand Positioning Statement", "brand_positioning_statement")}
  {field("State-Specific Messaging", "state_specific_messaging", multiline=True)}
  {field("Messaging Angles", "messaging_angles", multiline=True)}
  {field("Messaging Guidelines", "messaging_guidelines", multiline=True)}

  <h2>6. Social Proof & Trust Signals</h2>
  {field("Trust Signals", "trust_signals", multiline=True, required=True)}
  {field("Pass Guarantee Terms", "pass_guarantee_terms", multiline=True)}
  {field("Testimonials", "testimonials", multiline=True)}

  <h2>7. Market Presence & GTM</h2>
  <div class="grid2">
    {field("ToF %", "budget_tof_pct")}
    {field("MoF %", "budget_mof_pct")}
    {field("BoF %", "budget_bof_pct")}
    {field("Market Presence", "market_presence_status")}
  </div>
  {field("Budget Rationale", "budget_rationale", multiline=True)}
  {field("ToF Channel Strategy", "tof_channel_strategy", multiline=True)}
  {field("MoF Channel Strategy", "mof_channel_strategy", multiline=True)}
  {field("BoF Channel Strategy", "bof_channel_strategy", multiline=True)}

  <h2>App Store Content</h2>
  {field("App Store Subtitle", "app_store_subtitle")}
  {field("App Store Promo Text", "app_store_promo_text")}
  {field("App Store Keywords", "app_store_keywords")}
  {field("App Store Description", "app_store_description", multiline=True)}
  {field("Play Store Short Description", "play_store_short_description")}
  {field("Play Store Full Description", "play_store_full_description", multiline=True)}

  <h2>PMM Notes</h2>
  <div class="field">
    <label>Status</label>
    <select name="pmm_status">
      <option value="draft" {"selected" if row.get("pmm_status") == "draft" else ""}>Draft</option>
      <option value="review" {"selected" if row.get("pmm_status") == "review" else ""}>In Review</option>
      <option value="approved" {"selected" if row.get("pmm_status") == "approved" else ""}>Approved</option>
      <option value="pushed" {"selected" if row.get("pmm_status") == "pushed" else ""}>Pushed to Jira</option>
    </select>
  </div>
  {field("PMM Owner", "pmm_owner")}
  {field("PMM Notes", "pmm_notes", multiline=True)}

  <div class="actions">
    <button type="submit" class="save">Save Changes</button>
    <button type="button" class="jira" onclick="pushJira('{one_pager_id}')">Push to Jira</button>
    <button type="button" class="back" onclick="location.href='/'">Cancel</button>
  </div>
</form>

<script>
async function pushJira(id) {{
  if (!confirm('Push this one pager to Jira?')) return;
  const r = await fetch('/push-jira/' + id, {{method:'POST'}});
  const d = await r.json();
  if (d.jira_ticket_id) {{
    alert('Jira ticket created: ' + d.jira_ticket_id);
    location.reload();
  }} else {{
    alert('Error: ' + (d.detail || JSON.stringify(d)));
  }}
}}
</script>
</body></html>"""


@app.post("/review/{one_pager_id}")
async def save_review(one_pager_id: str, request: Request):
    form = await request.form()
    data = dict(form)

    # Cast integer fields
    for pct_field in ("budget_tof_pct", "budget_mof_pct", "budget_bof_pct"):
        if pct_field in data:
            try:
                data[pct_field] = int(data[pct_field]) if data[pct_field] else None
            except ValueError:
                data[pct_field] = None

    allowed = {
        "position_statement", "regulatory_status", "key_market_differentiator",
        "launch_goal", "executive_summary", "source_courses_and_bundles",
        "ecom_pages", "regulatory_notes", "final_promo_code", "pricing_notes",
        "competitive_landscape", "competitive_position", "differentiation_points",
        "exploitable_market_gaps", "audience_insights", "personas",
        "behavioral_insights", "seasonal_trends", "objection_handling",
        "value_prop_positioning", "brand_positioning_statement",
        "state_specific_messaging", "messaging_angles", "messaging_guidelines",
        "trust_signals", "pass_guarantee_terms", "testimonials",
        "market_presence_status", "budget_tof_pct", "budget_mof_pct",
        "budget_bof_pct", "budget_rationale", "tof_channel_strategy",
        "mof_channel_strategy", "bof_channel_strategy", "app_store_subtitle",
        "app_store_promo_text", "app_store_description", "app_store_keywords",
        "play_store_short_description", "play_store_full_description",
        "pmm_owner", "pmm_status", "pmm_notes",
    }
    updates = {k: (v if v != "" else None) for k, v in data.items() if k in allowed}

    if not updates:
        return RedirectResponse(f"/review/{one_pager_id}", status_code=303)

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    vals = list(updates.values()) + [one_pager_id]

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(f"UPDATE one_pagers SET {set_clause}, updated_at = NOW() WHERE id = %s", vals)
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

    return RedirectResponse(f"/review/{one_pager_id}", status_code=303)


# ─────────────────────────────────────────────
# PUSH TO JIRA
# ─────────────────────────────────────────────

@app.post("/push-jira/{one_pager_id}")
async def push_to_jira(one_pager_id: str):
    if not all([JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY]):
        raise HTTPException(
            status_code=400,
            detail="Jira not configured. Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY env vars."
        )

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("""
        SELECT op.*, l.launch_name, l.state, l.vertical, l.hard_launch_date, l.status
        FROM one_pagers op
        LEFT JOIN launches l ON op.launch_id = l.id
        WHERE op.id = %s
    """, (one_pager_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Not found")

    row = dict(row)
    description = build_jira_description(row)

    title = row.get("launch_name") or row.get("airtable_record_id") or one_pager_id
    state = f" ({row['state']})" if row.get("state") else ""
    summary = f"Course Launch One Pager — {title}{state}"

    payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": summary,
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": description}]
                    }
                ]
            },
            "issuetype": {"name": "Task"},
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{JIRA_BASE_URL}/rest/api/3/issue",
            json=payload,
            auth=(JIRA_EMAIL, JIRA_API_TOKEN),
            headers={"Accept": "application/json"},
            timeout=15,
        )

    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Jira error {response.status_code}: {response.text}")

    jira_key = response.json()["key"]

    try:
        cur.execute("""
            UPDATE one_pagers SET jira_ticket_id = %s, jira_pushed_at = NOW(),
              pmm_status = 'pushed', updated_at = NOW()
            WHERE id = %s
        """, (jira_key, one_pager_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

    return {"jira_ticket_id": jira_key}

# ─────────────────────────────────────────────
# LOOKUP API ENDPOINTS (replaces Airtable nodes)
# ─────────────────────────────────────────────

@app.get("/api/brands")
async def get_brands(vertical: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SELECT * FROM brands")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.get("/api/products")
async def get_products(vertical: Optional[str] = None, state: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    if vertical:
        cur.execute(
            "SELECT * FROM products WHERE LOWER(vertical) = LOWER(%s) OR %s = ANY(state_availability) OR 'National' = ANY(state_availability)",
            (vertical, state or "")
        )
    else:
        cur.execute("SELECT * FROM products")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.get("/api/personas")
async def get_personas():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SELECT * FROM personas")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.get("/api/budget-rules")
async def get_budget_rules(market_presence: Optional[str] = None, vertical: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    if market_presence and vertical:
        cur.execute(
            "SELECT * FROM budget_allocation_rules WHERE LOWER(market_presence) = LOWER(%s) AND LOWER(vertical) = LOWER(%s)",
            (market_presence, vertical)
        )
    elif market_presence:
        cur.execute("SELECT * FROM budget_allocation_rules WHERE LOWER(market_presence) = LOWER(%s)", (market_presence,))
    else:
        cur.execute("SELECT * FROM budget_allocation_rules")
    rows = [dict(r) for r in cur.fetchall()]
    # Convert Decimal to float for JSON
    for row in rows:
        for k in ("tof_pct", "mof_pct", "bof_pct"):
            if row.get(k) is not None:
                row[k] = float(row[k])
    conn.close()
    return rows


@app.get("/api/pmm")
async def get_pmm(vertical: Optional[str] = None, brand: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    if vertical:
        cur.execute(
            "SELECT * FROM pmm_assignments WHERE LOWER(vertical) = LOWER(%s)",
            (vertical,)
        )
    else:
        cur.execute("SELECT * FROM pmm_assignments")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.get("/api/launches")
async def get_launches():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SELECT * FROM launches ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


# ─────────────────────────────────────────────
# INTAKE FORM: PMM submits new launch
# ─────────────────────────────────────────────

@app.get("/launch/new", response_class=HTMLResponse)
async def new_launch_form():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SELECT id, name FROM brands ORDER BY name")
    brands = cur.fetchall()
    cur.execute("SELECT id, name, vertical FROM products ORDER BY vertical, name")
    products = cur.fetchall()
    cur.execute("SELECT * FROM pmm_assignments ORDER BY vertical")
    pmms = cur.fetchall()
    conn.close()

    brand_options = "".join(f'<option value="{b["name"]}">{b["name"]}</option>' for b in brands)
    product_checkboxes = ""
    current_vertical = None
    for p in products:
        if p["vertical"] != current_vertical:
            if current_vertical is not None:
                product_checkboxes += "</div>"
            product_checkboxes += f'<div class="product-group" data-vertical="{p["vertical"]}"><div class="product-group-label">{p["vertical"]}</div>'
            current_vertical = p["vertical"]
        product_checkboxes += f'<label class="checkbox-label"><input type="checkbox" name="product_ids" value="{p["id"]}"> {p["name"]}</label>'
    if current_vertical:
        product_checkboxes += "</div>"

    pmm_options = "".join(
        f'<option value="{p["pmm_name"]}" data-vertical="{p["vertical"]}">{p["pmm_name"]} ({p["vertical"]})</option>'
        for p in pmms
    )

    n8n_status = "configured" if N8N_TRIGGER_URL else "not configured — add N8N_TRIGGER_URL env var"

    return f"""<!DOCTYPE html>
<html><head><title>New Launch</title>
<style>
  body {{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#111}}
  h1 {{font-size:22px}} h2 {{font-size:15px;color:#4f46e5;border-bottom:2px solid #e0e7ff;padding-bottom:6px;margin-top:28px}}
  .field {{margin-bottom:16px}}
  label {{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:4px}}
  input, select, textarea {{width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;font-family:inherit;box-sizing:border-box}}
  .grid2 {{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
  .product-group {{margin-bottom:12px}}
  .product-group-label {{font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:6px}}
  .checkbox-label {{display:flex;align-items:center;gap:8px;font-weight:400;font-size:14px;margin-bottom:4px;cursor:pointer}}
  .checkbox-label input {{width:auto}}
  .btn-primary {{background:#4f46e5;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px}}
  .btn-primary:hover {{background:#4338ca}}
  .back {{color:#4f46e5;font-size:14px}}
  .n8n-status {{font-size:12px;color:#6b7280;margin-bottom:20px;padding:8px 12px;background:#f9fafb;border-radius:6px}}
  .required {{color:#ef4444}}
</style>
</head><body>
<p><a href="/" class="back">← All one pagers</a></p>
<h1>New Launch</h1>
<p class="n8n-status">n8n trigger: {n8n_status}</p>

<form method="post" action="/launch/new">
  <h2>Launch Info</h2>
  <div class="field">
    <label>Launch Name <span class="required">*</span></label>
    <input type="text" name="launch_name" required placeholder="e.g. Aceable Insurance — Texas Launch">
  </div>
  <div class="grid2">
    <div class="field">
      <label>Brand <span class="required">*</span></label>
      <select name="brand" required>{brand_options}</select>
    </div>
    <div class="field">
      <label>Vertical <span class="required">*</span></label>
      <select name="vertical" id="vertical-select" required onchange="filterProducts(this.value)">
        <option value="">Select...</option>
        <option value="INS">Insurance (INS)</option>
        <option value="RE">Real Estate (RE)</option>
        <option value="DRV">Driving (DRV)</option>
        <option value="MTG">Mortgage (MTG)</option>
      </select>
    </div>
  </div>
  <div class="grid2">
    <div class="field">
      <label>State <span class="required">*</span></label>
      <input type="text" name="state" required placeholder="e.g. CA, TX, FL">
    </div>
    <div class="field">
      <label>Hard Launch Date</label>
      <input type="date" name="hard_launch_date">
    </div>
  </div>
  <div class="grid2">
    <div class="field">
      <label>Market Presence <span class="required">*</span></label>
      <select name="market_presence" required>
        <option value="Strong">Strong</option>
        <option value="Emerging">Emerging</option>
        <option value="New">New</option>
      </select>
    </div>
    <div class="field">
      <label>Regulatory Status</label>
      <select name="regulatory_status">
        <option value="Regulated State">Regulated State</option>
        <option value="Unregulated State">Unregulated State</option>
      </select>
    </div>
  </div>

  <h2>Products</h2>
  <div id="products-container">{product_checkboxes}</div>

  <h2>PMM Assignment</h2>
  <div class="field">
    <label>Assigned PMM</label>
    <select name="pmm_owner">{pmm_options}</select>
  </div>

  <h2>Optional Notes</h2>
  <div class="field">
    <label>Additional Context for AI</label>
    <textarea name="launch_notes" rows="3" placeholder="Anything specific you want the AI to know about this launch..."></textarea>
  </div>

  <button type="submit" class="btn-primary">Create Launch & Trigger n8n →</button>
</form>

<script>
function filterProducts(vertical) {{
  document.querySelectorAll('.product-group').forEach(g => {{
    const v = g.dataset.vertical.toLowerCase();
    const match = vertical === '' ||
      (vertical === 'INS' && v === 'insurance') ||
      (vertical === 'RE' && v === 'real estate') ||
      (vertical === 'DRV' && v === 'driving') ||
      (vertical === 'MTG' && v === 'mortgage');
    g.style.display = match ? 'block' : 'none';
  }});
}}
</script>
</body></html>"""


@app.post("/launch/new")
async def create_launch(request: Request):
    form = await request.form()
    data = dict(form)
    product_ids = form.getlist("product_ids")

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        # 1. Create launch record
        cur.execute("""
            INSERT INTO launches (id, launch_name, brand, vertical, state, market_presence,
              regulatory_status, hard_launch_date, status, created_at, updated_at)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, 'Pending', NOW(), NOW())
            RETURNING id
        """, (
            data.get("launch_name"),
            data.get("brand"),
            data.get("vertical"),
            data.get("state"),
            data.get("market_presence"),
            data.get("regulatory_status"),
            data.get("hard_launch_date") or None,
        ))
        launch_id = cur.fetchone()["id"]

        # 2. Link products
        for pid in product_ids:
            cur.execute(
                "INSERT INTO launch_products (launch_id, product_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (launch_id, pid)
            )

        # 3. Create empty one_pager record
        cur.execute("""
            INSERT INTO one_pagers (id, launch_id, pmm_owner, pmm_status, created_at, updated_at)
            VALUES (gen_random_uuid(), %s, %s, 'pending', NOW(), NOW())
            RETURNING id
        """, (launch_id, data.get("pmm_owner")))
        one_pager_id = cur.fetchone()["id"]

        conn.commit()

        # 4. Trigger n8n workflow
        if N8N_TRIGGER_URL:
            trigger_payload = {
                "launch_id": str(launch_id),
                "one_pager_id": str(one_pager_id),
                "launch_name": data.get("launch_name"),
                "brand": data.get("brand"),
                "vertical": data.get("vertical"),
                "state": data.get("state"),
                "market_presence": data.get("market_presence"),
                "regulatory_status": data.get("regulatory_status"),
                "hard_launch_date": data.get("hard_launch_date"),
                "pmm_owner": data.get("pmm_owner"),
                "launch_notes": data.get("launch_notes"),
                "product_ids": product_ids,
            }
            async with httpx.AsyncClient() as client:
                await client.post(N8N_TRIGGER_URL, json=trigger_payload, timeout=10)

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

    return RedirectResponse(f"/review/{one_pager_id}", status_code=303)

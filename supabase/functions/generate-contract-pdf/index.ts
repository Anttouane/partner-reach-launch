import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatCurrency = (amount: number): string => {
  return (amount / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const generateContractHTML = (contract: any): string => {
  const signedStatus = contract.brand_signed_at && contract.creator_signed_at;
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif; 
      font-size: 11pt; 
      line-height: 1.6; 
      color: #1a1a1a;
      padding: 40px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      padding-bottom: 20px;
      border-bottom: 2px solid #6EC8FF;
    }
    .header h1 { 
      font-size: 24pt; 
      color: #1B1B1B; 
      margin-bottom: 8px;
    }
    .header .subtitle { 
      color: #666; 
      font-size: 12pt;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 10pt;
      font-weight: 600;
      margin-top: 12px;
      ${signedStatus 
        ? 'background-color: #d4edda; color: #155724;' 
        : 'background-color: #fff3cd; color: #856404;'}
    }
    .section { 
      margin-bottom: 30px; 
    }
    .section-title { 
      font-size: 14pt; 
      color: #1B1B1B; 
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .parties-grid { 
      display: flex; 
      gap: 40px; 
    }
    .party { 
      flex: 1; 
      background: #f9f9f9; 
      padding: 20px; 
      border-radius: 8px;
    }
    .party-title { 
      font-weight: 600; 
      color: #6EC8FF; 
      margin-bottom: 12px;
      font-size: 12pt;
    }
    .field { 
      margin-bottom: 8px; 
    }
    .field-label { 
      font-weight: 600; 
      color: #666; 
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field-value { 
      color: #1a1a1a; 
    }
    .financial-box {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 25px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .financial-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .financial-row:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 14pt;
      color: #28a745;
      padding-top: 15px;
      margin-top: 10px;
      border-top: 2px solid #28a745;
    }
    .signatures-grid { 
      display: flex; 
      gap: 40px; 
      margin-top: 20px;
    }
    .signature-box { 
      flex: 1; 
      border: 1px solid #ddd; 
      padding: 20px; 
      border-radius: 8px;
      min-height: 150px;
    }
    .signature-title { 
      font-weight: 600; 
      margin-bottom: 15px;
      color: #1B1B1B;
    }
    .signature-details {
      font-size: 9pt;
      color: #666;
    }
    .signature-status {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9pt;
      margin-top: 10px;
    }
    .signed { background-color: #d4edda; color: #155724; }
    .pending { background-color: #f8d7da; color: #721c24; }
    .footer { 
      margin-top: 50px; 
      padding-top: 20px; 
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
    .obligations {
      display: flex;
      gap: 30px;
    }
    .obligation-box {
      flex: 1;
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
    }
    .obligation-title {
      font-weight: 600;
      margin-bottom: 10px;
      color: #6EC8FF;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRAT DE PARTENARIAT</h1>
    <div class="subtitle">${contract.campaign_title}</div>
    <div class="status-badge">
      ${signedStatus ? '✓ CONTRAT SIGNÉ' : '⏳ EN ATTENTE DE SIGNATURE'}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">A. LES PARTIES</h2>
    <div class="parties-grid">
      <div class="party">
        <div class="party-title">LA MARQUE</div>
        <div class="field">
          <div class="field-label">Nom / Contact</div>
          <div class="field-value">${contract.brand_name || 'Non renseigné'}</div>
        </div>
        <div class="field">
          <div class="field-label">Société</div>
          <div class="field-value">${contract.brand_company || 'Non renseigné'}</div>
        </div>
        <div class="field">
          <div class="field-label">Adresse</div>
          <div class="field-value">${contract.brand_address || 'Non renseigné'}</div>
        </div>
      </div>
      <div class="party">
        <div class="party-title">LE CRÉATEUR</div>
        <div class="field">
          <div class="field-label">Nom</div>
          <div class="field-value">${contract.creator_name || 'Non renseigné'}</div>
        </div>
        <div class="field">
          <div class="field-label">Adresse</div>
          <div class="field-value">${contract.creator_address || 'Non renseigné'}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">B. DÉTAILS DE LA CAMPAGNE</h2>
    <div class="field">
      <div class="field-label">Description</div>
      <div class="field-value">${contract.campaign_description || 'Non renseigné'}</div>
    </div>
    <div style="display: flex; gap: 30px; margin-top: 15px;">
      <div class="field" style="flex: 1;">
        <div class="field-label">Date limite</div>
        <div class="field-value">${formatDate(contract.deadline)}</div>
      </div>
      <div class="field" style="flex: 1;">
        <div class="field-label">Période d'exclusivité</div>
        <div class="field-value">${contract.exclusivity_period ? contract.exclusivity_period + ' jours' : 'Aucune'}</div>
      </div>
    </div>
    ${contract.usage_rights ? `
    <div class="field" style="margin-top: 15px;">
      <div class="field-label">Droits d'utilisation</div>
      <div class="field-value">${contract.usage_rights}</div>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2 class="section-title">C. CONDITIONS FINANCIÈRES</h2>
    <div class="financial-box">
      <div class="financial-row">
        <span>Montant brut</span>
        <span>${formatCurrency(contract.total_amount)}</span>
      </div>
      <div class="financial-row">
        <span>Commission plateforme (${contract.platform_commission_rate}%)</span>
        <span>-${formatCurrency(contract.platform_commission_amount)}</span>
      </div>
      <div class="financial-row">
        <span>Frais Stripe (estimé)</span>
        <span>-${formatCurrency(contract.stripe_fee_estimate)}</span>
      </div>
      <div class="financial-row">
        <span>Net créateur</span>
        <span>${formatCurrency(contract.creator_net_amount)}</span>
      </div>
    </div>
    ${contract.payment_terms ? `
    <div class="field" style="margin-top: 20px;">
      <div class="field-label">Conditions de paiement</div>
      <div class="field-value">${contract.payment_terms}</div>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2 class="section-title">D. OBLIGATIONS DES PARTIES</h2>
    <div class="obligations">
      <div class="obligation-box">
        <div class="obligation-title">Obligations de la Marque</div>
        <div>${contract.brand_obligations || 'Non renseigné'}</div>
      </div>
      <div class="obligation-box">
        <div class="obligation-title">Obligations du Créateur</div>
        <div>${contract.creator_obligations || 'Non renseigné'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">E. VALIDATION & LITIGES</h2>
    <div class="field">
      <div class="field-label">Délai de validation</div>
      <div class="field-value">${contract.validation_deadline_days || 7} jours après livraison du contenu</div>
    </div>
    ${contract.dispute_resolution ? `
    <div class="field" style="margin-top: 15px;">
      <div class="field-label">Résolution des litiges</div>
      <div class="field-value">${contract.dispute_resolution}</div>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2 class="section-title">F. SIGNATURES</h2>
    <div class="signatures-grid">
      <div class="signature-box">
        <div class="signature-title">Signature Marque</div>
        ${contract.brand_signed_at ? `
          <div class="signature-details">
            <p>Signé le ${formatDate(contract.brand_signed_at)}</p>
            <p>IP: ${contract.brand_signature_ip || 'N/A'}</p>
          </div>
          <span class="signature-status signed">✓ Signé</span>
        ` : `
          <span class="signature-status pending">En attente</span>
        `}
      </div>
      <div class="signature-box">
        <div class="signature-title">Signature Créateur</div>
        ${contract.creator_signed_at ? `
          <div class="signature-details">
            <p>Signé le ${formatDate(contract.creator_signed_at)}</p>
            <p>IP: ${contract.creator_signature_ip || 'N/A'}</p>
          </div>
          <span class="signature-status signed">✓ Signé</span>
        ` : `
          <span class="signature-status pending">En attente</span>
        `}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Contrat généré via Partnery - Plateforme de mise en relation créateurs & marques</p>
    <p>ID du contrat: ${contract.id} | Version: ${contract.version}</p>
    <p>Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</body>
</html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

    const { contractId } = await req.json();
    if (!contractId) {
      throw new Error("Contract ID required");
    }

    // Fetch contract
    const { data: contract, error: contractError } = await supabaseClient
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      throw new Error("Contract not found");
    }

    // Check user has access
    if (contract.brand_id !== userData.user.id && contract.creator_id !== userData.user.id) {
      throw new Error("Access denied");
    }

    // Generate HTML
    const html = generateContractHTML(contract);

    // For now, return HTML as a data URL that can be printed to PDF
    // In production, you could use a PDF generation service like Puppeteer, 
    // wkhtmltopdf, or a third-party API
    const base64Html = btoa(unescape(encodeURIComponent(html)));
    const dataUrl = `data:text/html;base64,${base64Html}`;

    return new Response(
      JSON.stringify({ 
        url: dataUrl,
        html: html,
        filename: `contrat-${contract.campaign_title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${contract.id.slice(0, 8)}.html`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating contract PDF:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

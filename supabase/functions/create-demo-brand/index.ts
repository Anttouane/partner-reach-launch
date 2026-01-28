import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const email = 'marque.demo@partnery.fr';
    const password = 'Demo2025!';

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // Update password if user exists
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Demo brand account password updated',
          userId: existingUser.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { user_type: 'brand', full_name: 'TechStyle France' }
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;

    // Update profile to brand type
    await supabaseAdmin
      .from('profiles')
      .update({ 
        user_type: 'brand',
        full_name: 'TechStyle France',
        bio: 'Marque de mode tech française. Nous créons des vêtements connectés et accessoires lifestyle pour les digital natives.',
        website_url: 'https://techstyle.fr',
        instagram_url: 'https://instagram.com/techstylefr',
        linkedin_url: 'https://linkedin.com/company/techstyle-france'
      })
      .eq('id', userId);

    // Create brand profile
    await supabaseAdmin
      .from('brand_profiles')
      .upsert({
        id: userId,
        company_name: 'TechStyle France',
        description: 'Leader français de la mode tech et lifestyle connecté',
        industry: 'Mode & Tech',
        website: 'https://techstyle.fr'
      });

    // Create brand opportunities
    const opportunities = [
      {
        brand_id: userId,
        title: 'Lancement Collection Été 2026',
        description: 'Recherche créateurs mode/lifestyle pour promouvoir notre nouvelle collection été',
        campaign_type: 'Lancement produit',
        budget_range: '2000-5000€',
        target_audience: '18-35 ans, urbain, tech-savvy',
        status: 'active'
      },
      {
        brand_id: userId,
        title: 'Ambassadeur Marque Long Terme',
        description: 'Partenariat sur 6 mois avec créateur lifestyle établi',
        campaign_type: 'Ambassadeur',
        budget_range: '10000-20000€',
        target_audience: '25-40 ans, CSP+',
        status: 'active'
      }
    ];

    await supabaseAdmin.from('brand_opportunities').insert(opportunities);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo brand account created successfully',
        userId,
        email,
        password
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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

    // Find the demo brand account
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const demoBrandUser = existingUsers?.users?.find(u => u.email === 'marque.demo@partnery.fr');

    if (!demoBrandUser) {
      throw new Error('Demo brand account not found. Please create it first.');
    }

    const demoBrandId = demoBrandUser.id;

    // Create demo creators if they don't exist
    const creatorEmails = ['sophie.demo@partnery.fr', 'lucas.demo@partnery.fr', 'emma.demo@partnery.fr', 'thomas.demo@partnery.fr'];
    const creatorNames = ['Sophie Martin', 'Lucas Dubois', 'Emma Leroy', 'Thomas Bernard'];
    const creatorIds: string[] = [];

    for (let i = 0; i < creatorEmails.length; i++) {
      let creatorUser = existingUsers?.users?.find(u => u.email === creatorEmails[i]);
      
      if (!creatorUser) {
        // Create the creator
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: creatorEmails[i],
          password: 'Demo2025!',
          email_confirm: true,
          user_metadata: { user_type: 'creator', full_name: creatorNames[i] }
        });

        if (createError) {
          console.error(`Error creating creator ${creatorEmails[i]}:`, createError);
          continue;
        }
        creatorUser = newUser.user;

        // Update profile
        await supabaseAdmin
          .from('profiles')
          .update({ 
            full_name: creatorNames[i],
            bio: `Créateur de contenu passionné - ${creatorNames[i]}`
          })
          .eq('id', creatorUser.id);

        // Create creator profile
        const audienceSizes = [125000, 89000, 156000, 203000];
        const engagementRates = [4.5, 5.2, 6.1, 5.8];
        await supabaseAdmin
          .from('creator_profiles')
          .upsert({
            id: creatorUser.id,
            audience_size: audienceSizes[i],
            engagement_rate: engagementRates[i],
            content_categories: ['Lifestyle', 'Mode', 'Tech']
          });
      }
      
      creatorIds.push(creatorUser.id);
    }

    // Delete existing demo data for this brand
    await supabaseAdmin.from('payments').delete().eq('payer_id', demoBrandId);
    await supabaseAdmin.from('contracts').delete().eq('brand_id', demoBrandId);
    await supabaseAdmin.from('messages').delete().in('conversation_id', 
      (await supabaseAdmin.from('conversations').select('id').eq('participant_1', demoBrandId)).data?.map(c => c.id) || []
    );
    await supabaseAdmin.from('conversations').delete().eq('participant_1', demoBrandId);

    // Create payment history
    const paymentHistory = [
      { months_ago: 6, amount: 350000, creator_index: 0, description: 'Campagne Mode Printemps - Sophie Martin' },
      { months_ago: 5, amount: 280000, creator_index: 1, description: 'Review Tech Produit - Lucas Dubois' },
      { months_ago: 5, amount: 420000, creator_index: 2, description: 'Recettes Lifestyle - Emma Leroy' },
      { months_ago: 4, amount: 650000, creator_index: 3, description: 'Ambassadeur Fitness Q2 - Thomas Bernard' },
      { months_ago: 4, amount: 180000, creator_index: 0, description: 'Stories Mode - Sophie Martin' },
      { months_ago: 3, amount: 520000, creator_index: 2, description: 'Campagne Food Summer - Emma Leroy' },
      { months_ago: 3, amount: 380000, creator_index: 1, description: 'Unboxing Série Tech - Lucas Dubois' },
      { months_ago: 2, amount: 750000, creator_index: 3, description: 'Programme Fitness Complet - Thomas Bernard' },
      { months_ago: 2, amount: 290000, creator_index: 0, description: 'Collection Automne - Sophie Martin' },
      { months_ago: 1, amount: 450000, creator_index: 2, description: 'Recettes Festives - Emma Leroy' },
      { months_ago: 1, amount: 320000, creator_index: 1, description: 'Review Gaming - Lucas Dubois' },
      { months_ago: 0, amount: 580000, creator_index: 3, description: 'Challenge Fitness Hiver - Thomas Bernard' },
    ];

    const now = new Date();
    for (const payment of paymentHistory) {
      if (creatorIds[payment.creator_index]) {
        const paymentDate = new Date(now);
        paymentDate.setMonth(paymentDate.getMonth() - payment.months_ago);
        paymentDate.setDate(Math.floor(Math.random() * 20) + 5);

        const commissionRate = 5;
        const commissionAmount = Math.round(payment.amount * (commissionRate / 100));
        const netAmount = payment.amount - commissionAmount;

        await supabaseAdmin
          .from('payments')
          .insert({
            payer_id: demoBrandId,
            payee_id: creatorIds[payment.creator_index],
            amount: payment.amount,
            commission_amount: commissionAmount,
            commission_rate: commissionRate,
            net_amount: netAmount,
            status: 'completed',
            description: payment.description,
            created_at: paymentDate.toISOString(),
            updated_at: paymentDate.toISOString()
          });
      }
    }

    // Create contracts
    const contractHistory = [
      { months_ago: 5, creator_index: 0, campaign_title: 'Campagne Mode Printemps 2025', total_amount: 350000, status: 'completed' },
      { months_ago: 4, creator_index: 2, campaign_title: 'Collaboration Food & Lifestyle', total_amount: 420000, status: 'completed' },
      { months_ago: 3, creator_index: 3, campaign_title: 'Partenariat Fitness Q2-Q3', total_amount: 1400000, status: 'completed' },
      { months_ago: 1, creator_index: 1, campaign_title: 'Série Reviews Tech', total_amount: 700000, status: 'completed' },
      { months_ago: 0, creator_index: 2, campaign_title: 'Campagne Hiver 2026', total_amount: 580000, status: 'active' },
    ];

    for (const contract of contractHistory) {
      if (creatorIds[contract.creator_index]) {
        const contractDate = new Date(now);
        contractDate.setMonth(contractDate.getMonth() - contract.months_ago);

        const commissionRate = 5;
        const commissionAmount = Math.round(contract.total_amount * (commissionRate / 100));
        const netAmount = contract.total_amount - commissionAmount;

        await supabaseAdmin
          .from('contracts')
          .insert({
            brand_id: demoBrandId,
            creator_id: creatorIds[contract.creator_index],
            campaign_title: contract.campaign_title,
            campaign_description: `Partenariat avec ${creatorNames[contract.creator_index]} pour ${contract.campaign_title}`,
            total_amount: contract.total_amount,
            platform_commission_rate: commissionRate,
            platform_commission_amount: commissionAmount,
            creator_net_amount: netAmount,
            status: contract.status,
            brand_name: 'TechStyle France',
            brand_company: 'TechStyle France SAS',
            creator_name: creatorNames[contract.creator_index],
            deliverables: ['Posts Instagram', 'Stories', 'Reels'],
            platforms: ['Instagram', 'TikTok'],
            brand_signed_at: contractDate.toISOString(),
            creator_signed_at: contractDate.toISOString(),
            created_at: contractDate.toISOString(),
            updated_at: contractDate.toISOString()
          });
      }
    }

    // Create conversations
    for (let i = 0; i < Math.min(3, creatorIds.length); i++) {
      const { data: convData } = await supabaseAdmin
        .from('conversations')
        .insert({
          participant_1: demoBrandId,
          participant_2: creatorIds[i]
        })
        .select()
        .single();

      if (convData) {
        const messages = [
          { sender: demoBrandId, content: 'Bonjour ! Votre profil nous intéresse beaucoup pour notre prochaine campagne.' },
          { sender: creatorIds[i], content: 'Merci beaucoup ! Je serais ravi(e) d\'en discuter. Quels sont vos objectifs ?' },
          { sender: demoBrandId, content: 'Nous cherchons à promouvoir notre nouvelle collection auprès d\'une audience engagée.' },
          { sender: creatorIds[i], content: 'Parfait ! Je peux proposer différents formats: Reels, Stories, ou un post dédié. Quel budget avez-vous en tête ?' },
        ];

        for (const msg of messages) {
          await supabaseAdmin
            .from('messages')
            .insert({
              conversation_id: convData.id,
              sender_id: msg.sender,
              content: msg.content
            });
        }
      }
    }

    // Calculate totals
    const totalSpent = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    const totalPartnerships = contractHistory.length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data added to brand account',
        stats: {
          totalSpent: `${(totalSpent / 100).toLocaleString('fr-FR')} €`,
          totalPayments: paymentHistory.length,
          totalContracts: contractHistory.length,
          totalConversations: 3,
          creatorsCreated: creatorIds.length
        }
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

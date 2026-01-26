import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Demo creator with full history
    const demoCreator = {
      email: 'influenceur.demo@partnery.fr',
      password: 'Demo2025!',
      metadata: {
        full_name: 'Léa Moreau',
        user_type: 'creator',
      }
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === demoCreator.email)
    
    let creatorId: string

    if (existingUser) {
      creatorId = existingUser.id
      console.log('Demo creator already exists, updating data...')
    } else {
      // Create the demo creator user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: demoCreator.email,
        password: demoCreator.password,
        email_confirm: true,
        user_metadata: demoCreator.metadata
      })

      if (userError) {
        throw new Error(`Error creating user: ${userError.message}`)
      }

      creatorId = userData.user.id
    }

    // Update profile with rich bio and social links
    await supabaseAdmin
      .from('profiles')
      .update({
        full_name: 'Léa Moreau',
        bio: '✨ Créatrice lifestyle & mode | 250K+ communauté engagée | Passionnée par la mode durable et les voyages | Ambassadrice de marques premium depuis 2021 | Paris 📍',
        instagram_url: 'https://instagram.com/leamoreau',
        youtube_url: 'https://youtube.com/@leamoreauofficial',
        tiktok_url: 'https://tiktok.com/@leamoreau',
        twitter_url: 'https://twitter.com/leamoreau',
        linkedin_url: 'https://linkedin.com/in/leamoreau',
        website_url: 'https://leamoreau.fr'
      })
      .eq('id', creatorId)

    // Upsert creator profile
    await supabaseAdmin
      .from('creator_profiles')
      .upsert({
        id: creatorId,
        instagram_handle: '@leamoreau',
        tiktok_handle: '@leamoreau',
        youtube_handle: 'LeaMoreauOfficial',
        audience_size: 256000,
        engagement_rate: 5.8,
        content_categories: ['Mode', 'Lifestyle', 'Voyage', 'Beauté']
      })

    // Create demo brands if they don't exist
    const demoBrands = [
      { email: 'sephora.demo@partnery.fr', name: 'Sephora France', company: 'Sephora' },
      { email: 'asos.demo@partnery.fr', name: 'ASOS', company: 'ASOS' },
      { email: 'booking.demo@partnery.fr', name: 'Booking.com', company: 'Booking.com' },
      { email: 'samsung.demo@partnery.fr', name: 'Samsung France', company: 'Samsung' },
      { email: 'airfrance.demo@partnery.fr', name: 'Air France', company: 'Air France' },
    ]

    const brandIds: string[] = []

    for (const brand of demoBrands) {
      const existingBrand = existingUsers?.users?.find(u => u.email === brand.email)
      
      if (existingBrand) {
        brandIds.push(existingBrand.id)
      } else {
        const { data: brandData, error: brandError } = await supabaseAdmin.auth.admin.createUser({
          email: brand.email,
          password: 'Demo2025!',
          email_confirm: true,
          user_metadata: { full_name: brand.name, user_type: 'brand' }
        })

        if (!brandError && brandData.user) {
          brandIds.push(brandData.user.id)
          
          // Create brand profile
          await supabaseAdmin
            .from('brand_profiles')
            .upsert({
              id: brandData.user.id,
              company_name: brand.company,
              description: `Marque partenaire officielle - ${brand.company}`,
              industry: 'Retail & E-commerce',
              website: `https://${brand.company.toLowerCase().replace(/\s/g, '')}.com`
            })
        }
      }
    }

    // Create multiple pitches with different statuses
    const pitches = [
      {
        creator_id: creatorId,
        title: 'Campagne Mode Printemps-Été 2025',
        description: 'Création d\'une série de looks mode pour la nouvelle saison. 5 tenues complètes avec shooting photo professionnel, Reels Instagram et intégration TikTok.',
        content_type: 'Instagram + TikTok',
        estimated_reach: 250000,
        budget_range: '4000-6000€',
        tags: ['Mode', 'Fashion', 'Summer'],
        status: 'active'
      },
      {
        creator_id: creatorId,
        title: 'Voyage Découverte - Collaboration Tourisme',
        description: 'Je propose un partenariat voyage avec création de contenu immersif: vlogs YouTube, stories quotidiennes, et guide de destination.',
        content_type: 'YouTube + Instagram Stories',
        estimated_reach: 180000,
        budget_range: '5000-8000€',
        tags: ['Voyage', 'Travel', 'Lifestyle'],
        status: 'active'
      },
      {
        creator_id: creatorId,
        title: 'Test Produits Beauté - Review Authentique',
        description: 'Partenariat skincare/beauté avec tests approfondis sur 4 semaines. Contenu honnête et détaillé pour une audience exigeante.',
        content_type: 'YouTube Review + Instagram',
        estimated_reach: 200000,
        budget_range: '3000-5000€',
        tags: ['Beauté', 'Skincare', 'Review'],
        status: 'active'
      }
    ]

    // Delete existing pitches for this creator
    await supabaseAdmin.from('pitches').delete().eq('creator_id', creatorId)
    
    // Insert new pitches
    await supabaseAdmin.from('pitches').insert(pitches)

    // Create completed payments (revenues) over the last 6 months
    const now = new Date()
    const payments = [
      // Month -6: 2 payments
      {
        payer_id: brandIds[0] || creatorId,
        payee_id: creatorId,
        amount: 350000, // 3500€
        commission_rate: 10,
        commission_amount: 35000,
        net_amount: 315000,
        status: 'completed',
        description: 'Campagne Sephora - Collection Été',
        created_at: new Date(now.getFullYear(), now.getMonth() - 6, 15).toISOString()
      },
      {
        payer_id: brandIds[1] || creatorId,
        payee_id: creatorId,
        amount: 280000,
        commission_rate: 10,
        commission_amount: 28000,
        net_amount: 252000,
        status: 'completed',
        description: 'Partenariat ASOS - Lookbook',
        created_at: new Date(now.getFullYear(), now.getMonth() - 6, 25).toISOString()
      },
      // Month -5: 1 payment
      {
        payer_id: brandIds[2] || creatorId,
        payee_id: creatorId,
        amount: 450000,
        commission_rate: 10,
        commission_amount: 45000,
        net_amount: 405000,
        status: 'completed',
        description: 'Booking.com - Voyage Lisbonne',
        created_at: new Date(now.getFullYear(), now.getMonth() - 5, 10).toISOString()
      },
      // Month -4: 2 payments
      {
        payer_id: brandIds[0] || creatorId,
        payee_id: creatorId,
        amount: 420000,
        commission_rate: 10,
        commission_amount: 42000,
        net_amount: 378000,
        status: 'completed',
        description: 'Sephora - Lancement nouvelle gamme',
        created_at: new Date(now.getFullYear(), now.getMonth() - 4, 5).toISOString()
      },
      {
        payer_id: brandIds[3] || creatorId,
        payee_id: creatorId,
        amount: 550000,
        commission_rate: 10,
        commission_amount: 55000,
        net_amount: 495000,
        status: 'completed',
        description: 'Samsung - Galaxy S24 Launch',
        created_at: new Date(now.getFullYear(), now.getMonth() - 4, 20).toISOString()
      },
      // Month -3: 2 payments
      {
        payer_id: brandIds[1] || creatorId,
        payee_id: creatorId,
        amount: 320000,
        commission_rate: 10,
        commission_amount: 32000,
        net_amount: 288000,
        status: 'completed',
        description: 'ASOS - Black Friday Campaign',
        created_at: new Date(now.getFullYear(), now.getMonth() - 3, 8).toISOString()
      },
      {
        payer_id: brandIds[4] || creatorId,
        payee_id: creatorId,
        amount: 680000,
        commission_rate: 10,
        commission_amount: 68000,
        net_amount: 612000,
        status: 'completed',
        description: 'Air France - Campagne Premium',
        created_at: new Date(now.getFullYear(), now.getMonth() - 3, 22).toISOString()
      },
      // Month -2: 3 payments
      {
        payer_id: brandIds[0] || creatorId,
        payee_id: creatorId,
        amount: 380000,
        commission_rate: 10,
        commission_amount: 38000,
        net_amount: 342000,
        status: 'completed',
        description: 'Sephora - Noël Collection',
        created_at: new Date(now.getFullYear(), now.getMonth() - 2, 3).toISOString()
      },
      {
        payer_id: brandIds[2] || creatorId,
        payee_id: creatorId,
        amount: 520000,
        commission_rate: 10,
        commission_amount: 52000,
        net_amount: 468000,
        status: 'completed',
        description: 'Booking.com - Destinations Hiver',
        created_at: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString()
      },
      {
        payer_id: brandIds[3] || creatorId,
        payee_id: creatorId,
        amount: 290000,
        commission_rate: 10,
        commission_amount: 29000,
        net_amount: 261000,
        status: 'completed',
        description: 'Samsung - Accessoires Galaxy',
        created_at: new Date(now.getFullYear(), now.getMonth() - 2, 28).toISOString()
      },
      // Month -1: 2 payments
      {
        payer_id: brandIds[4] || creatorId,
        payee_id: creatorId,
        amount: 750000,
        commission_rate: 10,
        commission_amount: 75000,
        net_amount: 675000,
        status: 'completed',
        description: 'Air France - Classe Business Experience',
        created_at: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString()
      },
      {
        payer_id: brandIds[1] || creatorId,
        payee_id: creatorId,
        amount: 400000,
        commission_rate: 10,
        commission_amount: 40000,
        net_amount: 360000,
        status: 'completed',
        description: 'ASOS - New Year Collection',
        created_at: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString()
      },
      // Current month: 1 completed + 1 pending
      {
        payer_id: brandIds[0] || creatorId,
        payee_id: creatorId,
        amount: 480000,
        commission_rate: 10,
        commission_amount: 48000,
        net_amount: 432000,
        status: 'completed',
        description: 'Sephora - Saint Valentin',
        created_at: new Date(now.getFullYear(), now.getMonth(), 5).toISOString()
      },
      {
        payer_id: brandIds[2] || creatorId,
        payee_id: creatorId,
        amount: 600000,
        commission_rate: 10,
        commission_amount: 60000,
        net_amount: 540000,
        status: 'pending',
        description: 'Booking.com - Printemps 2025 (en cours)',
        created_at: new Date(now.getFullYear(), now.getMonth(), 18).toISOString()
      }
    ]

    // Delete existing demo payments for this creator
    await supabaseAdmin.from('payments').delete().eq('payee_id', creatorId)
    
    // Insert payments
    await supabaseAdmin.from('payments').insert(payments)

    // Calculate totals
    const completedPayments = payments.filter(p => p.status === 'completed')
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.net_amount, 0)
    const totalCollaborations = completedPayments.length

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Compte créateur démo créé avec succès!',
        credentials: {
          email: demoCreator.email,
          password: demoCreator.password
        },
        stats: {
          totalRevenue: `${(totalRevenue / 100).toLocaleString('fr-FR')}€`,
          totalCollaborations,
          pendingPayment: '5 400€'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

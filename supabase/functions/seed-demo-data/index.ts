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

    // Demo creators data
    const creators = [
      {
        email: 'sophie@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'Sophie Martin',
          user_type: 'creator',
          bio: 'Passionnée de mode et lifestyle, je crée du contenu authentique qui inspire.',
        },
        profile: {
          instagram_handle: '@sophiestyle',
          tiktok_handle: '@sophiestyle',
          youtube_handle: 'SophieStyleVlog',
          audience_size: 125000,
          engagement_rate: 4.5,
          content_categories: ['Mode', 'Lifestyle', 'Beauté']
        },
        pitch: {
          title: 'Collection Printemps 2025 - Collaboration Mode',
          description: 'Je propose une collaboration autour d\'une collection capsule pour le printemps. Mon audience est principalement féminine, 18-35 ans, très engagée sur les tendances mode durable. Je peux créer 3 posts Instagram, 5 stories, et 1 Reel dédié.',
          content_type: 'Instagram Reel + Posts',
          estimated_reach: 125000,
          budget_range: '2000-5000€',
          tags: ['Mode', 'Fashion', 'Sustainable']
        }
      },
      {
        email: 'lucas@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'Lucas Dubois',
          user_type: 'creator',
          bio: 'Tech reviewer et gamer. Je teste et partage mon avis sur les dernières innovations.',
        },
        profile: {
          instagram_handle: '@lucastech',
          tiktok_handle: '@lucastechfr',
          youtube_handle: 'LucasTechReview',
          audience_size: 89000,
          engagement_rate: 5.2,
          content_categories: ['Tech', 'Gaming', 'Reviews']
        },
        pitch: {
          title: 'Review Tech Produit - Unboxing & Test Complet',
          description: 'Spécialisé dans les reviews tech approfondies. Je propose un unboxing + test sur 2 semaines avec vidéo YouTube (15-20min), post Instagram, et intégration TikTok. Mon audience est très qualifiée: 70% hommes 20-40 ans, passionnés de tech.',
          content_type: 'YouTube Video + Social Media',
          estimated_reach: 89000,
          budget_range: '1500-3000€',
          tags: ['Tech', 'Review', 'Unboxing']
        }
      },
      {
        email: 'emma@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'Emma Leroy',
          user_type: 'creator',
          bio: 'Food blogger et chef amateure. La cuisine est mon art, Instagram ma galerie.',
        },
        profile: {
          instagram_handle: '@emmacuisine',
          tiktok_handle: '@emmafood',
          youtube_handle: 'EmmaInTheKitchen',
          audience_size: 156000,
          engagement_rate: 6.1,
          content_categories: ['Food', 'Recettes', 'Lifestyle']
        },
        pitch: {
          title: 'Création de Recettes pour Marque Alimentaire',
          description: 'Je crée des recettes originales et esthétiques autour de vos produits. Package complet: 3 recettes exclusives, photoshoot professionnel, 3 Reels, stories interactives avec sondages. Taux d\'engagement exceptionnel de 6.1%.',
          content_type: 'Instagram Reels + Photos',
          estimated_reach: 156000,
          budget_range: '3000-6000€',
          tags: ['Food', 'Recettes', 'Cooking']
        }
      },
      {
        email: 'thomas@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'Thomas Bernard',
          user_type: 'creator',
          bio: 'Fitness coach et entrepreneur. Je motive ma communauté à atteindre leurs objectifs.',
        },
        profile: {
          instagram_handle: '@thomasfit',
          tiktok_handle: '@fitwithThomas',
          youtube_handle: 'ThomasFitnessTV',
          audience_size: 203000,
          engagement_rate: 5.8,
          content_categories: ['Fitness', 'Sport', 'Motivation']
        },
        pitch: {
          title: 'Programme Fitness - Ambassadeur de Marque',
          description: 'Je cherche un partenariat long terme (6 mois) avec une marque de sport/nutrition. Je peux créer un programme exclusif, 4 posts/mois, stories quotidiennes, et organisation d\'un challenge communautaire. Audience très engagée et fidèle.',
          content_type: 'Long-term Partnership',
          estimated_reach: 203000,
          budget_range: '5000-10000€',
          tags: ['Fitness', 'Sport', 'Ambassadeur']
        }
      }
    ]

    // Demo brand with full history
    const demoBrand = {
      email: 'marque.demo@partnery.fr',
      password: 'Demo2025!',
      metadata: {
        full_name: 'TechStyle France',
        user_type: 'brand',
      },
      profile: {
        company_name: 'TechStyle France',
        description: 'Marque française de vêtements et accessoires tech-lifestyle. Nous créons des produits innovants pour les digital natives.',
        industry: 'Mode & Tech',
        website: 'https://techstyle.fr'
      },
      opportunity: {
        title: 'Campagne Automne 2025 - Influenceurs Mode & Tech',
        description: 'Recherche de créateurs pour notre nouvelle collection automne. Nous cherchons des profils authentiques avec une audience engagée dans les domaines mode, lifestyle et tech.',
        campaign_type: 'Campagne Saisonnière',
        budget_range: '3000-8000€',
        target_audience: '18-35 ans, urbains, tech-savvy',
        requirements: ['Minimum 50K followers', 'Contenu créatif et original', 'Engagement rate >4%']
      }
    }

    // Other demo brands (simpler)
    const otherBrands = [
      {
        email: 'nike@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'Nike France',
          user_type: 'brand',
        },
        profile: {
          company_name: 'Nike',
          description: 'Marque mondiale de sport et lifestyle.',
          industry: 'Sport & Lifestyle',
          website: 'https://nike.com'
        },
        opportunity: {
          title: 'Recherche Ambassadeurs Running 2025',
          description: 'Nike recherche des runners passionnés pour promouvoir notre nouvelle collection.',
          campaign_type: 'Ambassadeur',
          budget_range: '5000-10000€',
          target_audience: 'Sportifs 18-45 ans',
          requirements: ['Minimum 50K followers', 'Contenu sport/fitness', 'Engagement rate >4%']
        }
      },
      {
        email: 'loreal@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'L\'Oréal Paris',
          user_type: 'brand',
        },
        profile: {
          company_name: 'L\'Oréal Paris',
          description: 'Leader mondial de la beauté.',
          industry: 'Beauté & Cosmétiques',
          website: 'https://loreal.com'
        },
        opportunity: {
          title: 'Lancement Nouvelle Gamme Skincare',
          description: 'Collaboration pour le lancement de notre nouvelle ligne de soins.',
          campaign_type: 'Lancement Produit',
          budget_range: '3000-7000€',
          target_audience: 'Femmes 25-45 ans',
          requirements: ['Expertise beauté/skincare', 'Contenu de qualité', 'Audience féminine']
        }
      }
    ]

    const createdCreatorIds: string[] = []
    
    // Create creators
    for (const creator of creators) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: creator.email,
        password: creator.password,
        email_confirm: true,
        user_metadata: creator.metadata
      })

      if (userError) {
        console.error(`Error creating user ${creator.email}:`, userError)
        continue
      }

      createdCreatorIds.push(userData.user.id)

      // Update profile
      await supabaseAdmin
        .from('profiles')
        .update({ bio: creator.metadata.bio })
        .eq('id', userData.user.id)

      // Create creator profile
      await supabaseAdmin
        .from('creator_profiles')
        .insert({
          id: userData.user.id,
          ...creator.profile
        })

      // Create pitch
      await supabaseAdmin
        .from('pitches')
        .insert({
          creator_id: userData.user.id,
          ...creator.pitch
        })
    }

    // Create main demo brand with history
    const { data: brandUserData, error: brandUserError } = await supabaseAdmin.auth.admin.createUser({
      email: demoBrand.email,
      password: demoBrand.password,
      email_confirm: true,
      user_metadata: demoBrand.metadata
    })

    if (brandUserError) {
      throw new Error(`Error creating demo brand: ${brandUserError.message}`)
    }

    const demoBrandId = brandUserData.user.id

    // Create brand profile
    await supabaseAdmin
      .from('brand_profiles')
      .insert({
        id: demoBrandId,
        ...demoBrand.profile
      })

    // Create opportunity
    await supabaseAdmin
      .from('brand_opportunities')
      .insert({
        brand_id: demoBrandId,
        ...demoBrand.opportunity
      })

    // Create payment history for demo brand (payments made to creators)
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
    ]

    const now = new Date()
    for (const payment of paymentHistory) {
      if (createdCreatorIds[payment.creator_index]) {
        const paymentDate = new Date(now)
        paymentDate.setMonth(paymentDate.getMonth() - payment.months_ago)
        paymentDate.setDate(Math.floor(Math.random() * 20) + 5)

        const commissionRate = 5
        const commissionAmount = Math.round(payment.amount * (commissionRate / 100))
        const netAmount = payment.amount - commissionAmount

        await supabaseAdmin
          .from('payments')
          .insert({
            payer_id: demoBrandId,
            payee_id: createdCreatorIds[payment.creator_index],
            amount: payment.amount,
            commission_amount: commissionAmount,
            commission_rate: commissionRate,
            net_amount: netAmount,
            status: 'completed',
            description: payment.description,
            created_at: paymentDate.toISOString(),
            updated_at: paymentDate.toISOString()
          })
      }
    }

    // Create completed contracts for demo brand
    const contractHistory = [
      { 
        months_ago: 5, 
        creator_index: 0, 
        campaign_title: 'Campagne Mode Printemps 2024',
        total_amount: 350000,
        status: 'completed'
      },
      { 
        months_ago: 4, 
        creator_index: 2, 
        campaign_title: 'Collaboration Food & Lifestyle',
        total_amount: 420000,
        status: 'completed'
      },
      { 
        months_ago: 3, 
        creator_index: 3, 
        campaign_title: 'Partenariat Fitness Q2-Q3',
        total_amount: 1400000,
        status: 'completed'
      },
      { 
        months_ago: 1, 
        creator_index: 1, 
        campaign_title: 'Série Reviews Tech',
        total_amount: 700000,
        status: 'completed'
      },
      { 
        months_ago: 0, 
        creator_index: 2, 
        campaign_title: 'Campagne Hiver 2025',
        total_amount: 580000,
        status: 'active'
      },
    ]

    for (const contract of contractHistory) {
      if (createdCreatorIds[contract.creator_index]) {
        const contractDate = new Date(now)
        contractDate.setMonth(contractDate.getMonth() - contract.months_ago)

        const commissionRate = 5
        const commissionAmount = Math.round(contract.total_amount * (commissionRate / 100))
        const netAmount = contract.total_amount - commissionAmount

        const creatorNames = ['Sophie Martin', 'Lucas Dubois', 'Emma Leroy', 'Thomas Bernard']

        await supabaseAdmin
          .from('contracts')
          .insert({
            brand_id: demoBrandId,
            creator_id: createdCreatorIds[contract.creator_index],
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
          })
      }
    }

    // Create conversations between demo brand and creators
    for (let i = 0; i < Math.min(3, createdCreatorIds.length); i++) {
      const { data: convData } = await supabaseAdmin
        .from('conversations')
        .insert({
          participant_1: demoBrandId,
          participant_2: createdCreatorIds[i]
        })
        .select()
        .single()

      if (convData) {
        const messages = [
          { sender: demoBrandId, content: 'Bonjour ! Votre profil nous intéresse beaucoup pour notre prochaine campagne.' },
          { sender: createdCreatorIds[i], content: 'Merci beaucoup ! Je serais ravi(e) d\'en discuter. Quels sont vos objectifs ?' },
          { sender: demoBrandId, content: 'Nous cherchons à promouvoir notre nouvelle collection auprès d\'une audience engagée.' },
        ]

        for (const msg of messages) {
          await supabaseAdmin
            .from('messages')
            .insert({
              conversation_id: convData.id,
              sender_id: msg.sender,
              content: msg.content
            })
        }
      }
    }

    // Create other brands (simpler, no history)
    for (const brand of otherBrands) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: brand.email,
        password: brand.password,
        email_confirm: true,
        user_metadata: brand.metadata
      })

      if (userError) {
        console.error(`Error creating user ${brand.email}:`, userError)
        continue
      }

      await supabaseAdmin
        .from('brand_profiles')
        .insert({
          id: userData.user.id,
          ...brand.profile
        })

      await supabaseAdmin
        .from('brand_opportunities')
        .insert({
          brand_id: userData.user.id,
          ...brand.opportunity
        })
    }

    // Calculate totals for demo brand
    const totalSpent = paymentHistory.reduce((sum, p) => sum + p.amount, 0)
    const totalPartnerships = contractHistory.length

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data created successfully',
        credentials: {
          demoBrand: {
            email: demoBrand.email,
            password: demoBrand.password,
            stats: {
              totalSpent: `${(totalSpent / 100).toLocaleString('fr-FR')}€`,
              totalPartnerships,
              activeContracts: contractHistory.filter(c => c.status === 'active').length
            }
          },
          creators: creators.map(c => ({ email: c.email, password: c.password })),
          otherBrands: otherBrands.map(b => ({ email: b.email, password: b.password }))
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

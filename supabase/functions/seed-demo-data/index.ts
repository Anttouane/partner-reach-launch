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

    // Demo brands data
    const brands = [
      {
        email: 'nike@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'Nike France',
          user_type: 'brand',
        },
        profile: {
          company_name: 'Nike',
          description: 'Marque mondiale de sport et lifestyle. Nous recherchons des créateurs authentiques pour représenter nos valeurs.',
          industry: 'Sport & Lifestyle',
          website: 'https://nike.com'
        },
        opportunity: {
          title: 'Recherche Ambassadeurs Running 2025',
          description: 'Nike recherche des runners passionnés pour promouvoir notre nouvelle collection de chaussures. Nous cherchons des créateurs avec une communauté engagée dans le sport et le fitness.',
          campaign_type: 'Ambassadeur',
          budget_range: '5000-10000€',
          target_audience: 'Sportifs 18-45 ans',
          requirements: ['Minimum 50K followers', 'Contenu régulier sport/fitness', 'Engagement rate >4%']
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
          description: 'Leader mondial de la beauté. Nous collaborons avec des créateurs de contenu pour des campagnes innovantes.',
          industry: 'Beauté & Cosmétiques',
          website: 'https://loreal.com'
        },
        opportunity: {
          title: 'Lancement Nouvelle Gamme Skincare',
          description: 'Collaboration pour le lancement de notre nouvelle ligne de soins visage. Recherche de créateurs beauté pour reviews authentiques et tutoriels.',
          campaign_type: 'Lancement Produit',
          budget_range: '3000-7000€',
          target_audience: 'Femmes 25-45 ans',
          requirements: ['Expertise beauté/skincare', 'Contenu de qualité', 'Audience féminine majoritaire']
        }
      },
      {
        email: 'deliveroo@demo.com',
        password: 'Demo123!',
        metadata: {
          full_name: 'Deliveroo',
          user_type: 'brand',
        },
        profile: {
          company_name: 'Deliveroo',
          description: 'Service de livraison de repas leader. Nous recherchons des food creators pour showcaser nos restaurants partenaires.',
          industry: 'Food & Delivery',
          website: 'https://deliveroo.fr'
        },
        opportunity: {
          title: 'Campagne Food Lovers - Restaurants Partenaires',
          description: 'Recherche de food bloggers pour une campagne autour de nos meilleurs restaurants. Contenu créatif attendu: unboxing, dégustation, stories interactives.',
          campaign_type: 'Contenu Sponsorisé',
          budget_range: '2000-4000€',
          target_audience: 'Foodies 20-40 ans',
          requirements: ['Contenu food de qualité', 'Bon storytelling', 'Audience urbaine']
        }
      }
    ]

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

    // Create brands
    for (const brand of brands) {
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

      // Create brand profile
      await supabaseAdmin
        .from('brand_profiles')
        .insert({
          id: userData.user.id,
          ...brand.profile
        })

      // Create opportunity
      await supabaseAdmin
        .from('brand_opportunities')
        .insert({
          brand_id: userData.user.id,
          ...brand.opportunity
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data created successfully',
        credentials: {
          creators: creators.map(c => ({ email: c.email, password: c.password })),
          brands: brands.map(b => ({ email: b.email, password: b.password }))
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
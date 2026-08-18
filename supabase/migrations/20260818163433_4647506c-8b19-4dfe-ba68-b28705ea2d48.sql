
create or replace function public.is_campaign_owner(_campaign_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.campaigns c where c.id = _campaign_id and c.brand_id = _user_id)
$$;

create or replace function public.has_approved_match(_campaign_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.campaign_matches m
    where m.campaign_id = _campaign_id and m.creator_id = _user_id and m.brand_status = 'approved'
  )
$$;

drop policy if exists "brand manages matches" on public.campaign_matches;
create policy "brand manages matches" on public.campaign_matches
for all to authenticated
using (public.is_campaign_owner(campaign_id, auth.uid()))
with check (public.is_campaign_owner(campaign_id, auth.uid()));

drop policy if exists "creator sees campaigns via matches" on public.campaigns;
create policy "creator sees campaigns via matches" on public.campaigns
for select to authenticated
using (public.has_approved_match(id, auth.uid()));


-- 1. Fix user_commissions: restrict SELECT to owner + admins only
DROP POLICY IF EXISTS "Anyone can view commission rates" ON public.user_commissions;
CREATE POLICY "Users can view their own commission" ON public.user_commissions
FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- 2. Fix payments: remove client-side UPDATE policy (webhook uses service role)
DROP POLICY IF EXISTS "Users can view payment updates" ON public.payments;

-- 3. Add admin SELECT on withdrawals
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals
FOR SELECT USING (has_role(auth.uid(), 'admin'));

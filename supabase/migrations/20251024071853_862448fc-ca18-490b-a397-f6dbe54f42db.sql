-- Drop the problematic policies
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "First user can become super admin" ON public.user_roles;

-- Create a policy that allows users to insert themselves as super_admin if no super_admin exists
-- This avoids recursion by not querying user_roles in the policy
CREATE POLICY "First user can become super admin"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'super_admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  )
);

-- Allow super admins to manage all roles using the security definer function
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
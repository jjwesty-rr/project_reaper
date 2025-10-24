-- Drop the restrictive policy
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create a policy that allows users to insert themselves as super_admin if no super_admin exists
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

-- Allow super admins to do anything with roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);
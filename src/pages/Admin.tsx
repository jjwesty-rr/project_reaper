import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, DollarSign, Users, Briefcase } from 'lucide-react';
import { StateLimitsManagement } from '@/components/admin/StateLimitsManagement';
import { UserIntakeDashboard } from '@/components/admin/UserIntakeDashboard';
import { AttorneyManagement } from '@/components/admin/AttorneyManagement';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'super_admin' | 'admin' | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Use RPC calls for secure role checking
      const { data: isSuperAdmin, error: superAdminError } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'super_admin' });

      if (superAdminError) throw superAdminError;

      if (isSuperAdmin) {
        setUserRole('super_admin');
        setLoading(false);
        return;
      }

      // Check if user is any type of admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { _user_id: user.id });

      if (adminError) throw adminError;

      if (isAdmin) {
        setUserRole('admin');
        setLoading(false);
        return;
      }

      // Not an admin - check if any super admin exists (initial setup)
      const { data: superAdminExists, error: superAdminExistsError } = await supabase
        .rpc('super_admin_exists');

      if (superAdminExistsError) throw superAdminExistsError;

      if (!superAdminExists) {
        // First time setup - make this user super admin
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'super_admin' });

        if (insertError) {
          toast.error('Failed to setup admin access. Please contact support.');
          navigate('/home');
          return;
        }

        setUserRole('super_admin');
        setNeedsSetup(true);
        toast.success('Welcome! You are now the Super Admin.');
      } else {
        toast.error('Access denied. Admin privileges required.');
        navigate('/home');
        return;
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error('Error checking permissions');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">
              Role: <span className="font-semibold capitalize">{userRole?.replace('_', ' ')}</span>
            </p>
          </div>
          <Shield className="h-12 w-12 text-primary" />
        </div>

        {needsSetup && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Welcome, Super Admin!</CardTitle>
              <CardDescription>
                This is your first time accessing the admin portal. You now have full access to manage
                state limits, view all user intakes, manage attorneys, and add other admins.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="state-limits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="state-limits">
              <DollarSign className="h-4 w-4 mr-2" />
              State Limits
            </TabsTrigger>
            <TabsTrigger value="intakes">
              <Users className="h-4 w-4 mr-2" />
              Client Intakes
            </TabsTrigger>
            <TabsTrigger value="attorneys">
              <Briefcase className="h-4 w-4 mr-2" />
              Attorneys
            </TabsTrigger>
            {userRole === 'super_admin' && (
              <TabsTrigger value="admin-management">
                <Shield className="h-4 w-4 mr-2" />
                Admin Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="state-limits">
            <StateLimitsManagement />
          </TabsContent>

          <TabsContent value="intakes">
            <UserIntakeDashboard />
          </TabsContent>

          <TabsContent value="attorneys">
            <AttorneyManagement />
          </TabsContent>

          {userRole === 'super_admin' && (
            <TabsContent value="admin-management">
              <AdminManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

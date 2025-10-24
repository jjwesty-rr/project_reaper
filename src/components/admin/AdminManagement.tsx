import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, UserPlus, UserMinus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
}

export function AdminManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        roles: (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role)
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) throw error;
      toast.success('Admin role granted');
      fetchUsers();
    } catch (error: any) {
      console.error('Error granting admin:', error);
      toast.error(error.message || 'Failed to grant admin role');
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke admin access?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;
      toast.success('Admin role revoked');
      fetchUsers();
    } catch (error) {
      console.error('Error revoking admin:', error);
      toast.error('Failed to revoke admin role');
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('super_admin')) {
      return <Badge variant="destructive">Super Admin</Badge>;
    }
    if (roles.includes('admin')) {
      return <Badge variant="default">Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  const canModifyRole = (roles: string[]) => {
    return !roles.includes('super_admin');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <div>
            <CardTitle>Admin Management</CardTitle>
            <CardDescription>
              Grant or revoke admin access for users (Super Admin only)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.roles)}</TableCell>
                  <TableCell className="text-right">
                    {canModifyRole(user.roles) && (
                      <>
                        {user.roles.includes('admin') ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeAdmin(user.id)}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Revoke Admin
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGrantAdmin(user.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Grant Admin
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

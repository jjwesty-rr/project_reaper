import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user' | 'super_admin'>('user');
  const [inviting, setInviting] = useState(false);

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

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email: inviteEmail, role: inviteRole }
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('user');
      fetchUsers();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast.error(error.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Admin Management</CardTitle>
              <CardDescription>
                Grant or revoke admin access for users (Super Admin only)
              </CardDescription>
            </div>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation email to a new user and assign them a role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as 'admin' | 'user' | 'super_admin')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser} disabled={inviting}>
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

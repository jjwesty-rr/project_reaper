import { useEffect, useState } from 'react';
import { api } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Edit, UserPlus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export function AdminManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [saving, setSaving] = useState(false)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
const [newUser, setNewUser] = useState({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'client' as 'client' | 'admin' | 'super_admin'
});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setEditDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      await api.updateUserRole(editingUser.id, selectedRole);
      
      toast.success('User role updated successfully');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update user role');
    } finally {
      setSaving(false);
    }
  };



  const handleAddUser = async () => {
  // Validate required fields
  if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name) {
    toast.error('Please fill in all required fields');
    return;
  }


  const handleDeleteUser = async (user: any) => {
  // Confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to delete ${user.first_name} ${user.last_name}?\n\n` +
    `This will permanently delete:\n` +
    `- Their account\n` +
    `- All their submissions\n\n` +
    `This action cannot be undone.`
  );
  
  if (!confirmed) return;
  
  try {
    await api.deleteUser(user.id);
    toast({
      title: "User Deleted",
      description: `${user.first_name} ${user.last_name} has been deleted.`,
    });
    // Refresh the users list
    loadUsers();
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Failed to delete user",
      variant: "destructive",
    });
  }
};

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUser.email)) {
    toast.error('Please enter a valid email address');
    return;
  }

  // Validate password length
  if (newUser.password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  setSaving(true);
  try {
    await api.register({
      email: newUser.email,
      password: newUser.password,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role
    });
    
    toast.success('User created successfully');
    setAddUserDialogOpen(false);
    
    // Reset form
    setNewUser({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'client'
    });
    
    fetchUsers(); // Reload users list
  } catch (error: any) {
    console.error('Error creating user:', error);
    toast.error(error.message || 'Failed to create user');
  } finally {
    setSaving(false);
  }
};



  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') {
      return <Badge variant="destructive">Super Admin</Badge>;
    }
    if (role === 'admin') {
      return <Badge variant="default">Admin</Badge>;
    }
    return <Badge variant="outline">Client</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Shield className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Shield className="h-5 w-5" />
      <div>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions (Super Admin only)
        </CardDescription>
      </div>
    </div>
    <Button onClick={() => setAddUserDialogOpen(true)}>
      <UserPlus className="h-4 w-4 mr-2" />
      Add User
    </Button>
  </div>
</CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                   <TableCell className="text-right">
  <div className="flex gap-2 justify-end">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => openEditDialog(user)}
    >
      <Edit className="h-4 w-4 mr-2" />
      Change Role
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDeleteUser(user)}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </Button>
  </div>
</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {editingUser?.first_name} {editingUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Current User</p>
                <p className="text-sm text-muted-foreground">{editingUser.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">New Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedRole === 'client' && 'Can only view their own submissions'}
                  {selectedRole === 'admin' && 'Can access admin portal and view all submissions'}
                  {selectedRole === 'super_admin' && 'Full access including user management'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  {/* Add User Dialog */}
<Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New User</DialogTitle>
      <DialogDescription>
        Create a new user account with a specific role
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={newUser.first_name}
            onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={newUser.last_name}
            onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          placeholder="user@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
          placeholder="Minimum 6 characters"
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 6 characters long
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select 
          value={newUser.role} 
          onValueChange={(value: 'client' | 'admin' | 'super_admin') => setNewUser({...newUser, role: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {newUser.role === 'client' && 'Can only view their own submissions'}
          {newUser.role === 'admin' && 'Can access admin portal and view all submissions'}
          {newUser.role === 'super_admin' && 'Full access including user management'}
        </p>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleAddUser} disabled={saving}>
        {saving ? 'Creating...' : 'Create User'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </>
  );
}
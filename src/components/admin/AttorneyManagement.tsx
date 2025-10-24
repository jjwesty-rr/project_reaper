import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Attorney {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty_areas: string[];
  location: string;
  is_active: boolean;
}

export function AttorneyManagement() {
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAttorney, setEditingAttorney] = useState<Attorney | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty_areas: '',
    location: '',
    is_active: true
  });

  useEffect(() => {
    fetchAttorneys();
  }, []);

  const fetchAttorneys = async () => {
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('*')
        .order('name');

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error fetching attorneys:', error);
      toast.error('Failed to load attorneys');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (attorney: Attorney) => {
    setEditingAttorney(attorney);
    setFormData({
      name: attorney.name,
      email: attorney.email,
      phone: attorney.phone,
      specialty_areas: attorney.specialty_areas.join(', '),
      location: attorney.location,
      is_active: attorney.is_active
    });
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty_areas: '',
      location: '',
      is_active: true
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const specialtyAreas = formData.specialty_areas
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const attorneyData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty_areas: specialtyAreas,
        location: formData.location,
        is_active: formData.is_active
      };

      if (editingAttorney) {
        const { error } = await supabase
          .from('attorneys')
          .update(attorneyData)
          .eq('id', editingAttorney.id);

        if (error) throw error;
        toast.success('Attorney updated');
      } else {
        const { error } = await supabase
          .from('attorneys')
          .insert(attorneyData);

        if (error) throw error;
        toast.success('Attorney added');
      }

      fetchAttorneys();
      handleClose();
    } catch (error: any) {
      console.error('Error saving attorney:', error);
      toast.error(error.message || 'Failed to save attorney');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attorney?')) return;

    try {
      const { error } = await supabase
        .from('attorneys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Attorney deleted');
      fetchAttorneys();
    } catch (error) {
      console.error('Error deleting attorney:', error);
      toast.error('Failed to delete attorney');
    }
  };

  const handleClose = () => {
    setEditingAttorney(null);
    setIsAddingNew(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attorney Referral Management</CardTitle>
              <CardDescription>
                Manage attorney contacts for estate referrals
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Attorney
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attorneys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No attorneys added yet
                  </TableCell>
                </TableRow>
              ) : (
                attorneys.map((attorney) => (
                  <TableRow key={attorney.id}>
                    <TableCell className="font-medium">{attorney.name}</TableCell>
                    <TableCell>{attorney.email}</TableCell>
                    <TableCell>{attorney.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {attorney.specialty_areas.map((spec, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{attorney.location}</TableCell>
                    <TableCell>
                      <Badge variant={attorney.is_active ? 'default' : 'secondary'}>
                        {attorney.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(attorney)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attorney.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editingAttorney !== null || isAddingNew} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAttorney ? 'Edit Attorney' : 'Add New Attorney'}
            </DialogTitle>
            <DialogDescription>
              Enter attorney details for estate referrals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Attorney name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="attorney@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialty">Specialty Areas</Label>
              <Input
                id="specialty"
                value={formData.specialty_areas}
                onChange={(e) => setFormData({ ...formData, specialty_areas: e.target.value })}
                placeholder="e.g., Probate, Trust Administration, Estate Planning (comma separated)"
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Active (available for referrals)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

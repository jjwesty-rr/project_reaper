import { useEffect, useState } from 'react';
import { api } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StateLimit {
  id: number;
  state: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

export function StateLimitsManagement() {
  const [limits, setLimits] = useState<StateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLimit, setEditingLimit] = useState<StateLimit | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formState, setFormState] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const data = await api.getStateLimits();
      setLimits(data);
    } catch (error) {
      console.error('Error fetching limits:', error);
      toast.error('Failed to load state limits');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (limit: StateLimit) => {
    setEditingLimit(limit);
    setFormState(limit.state);
    setFormAmount(limit.limit_amount.toString());
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setFormState('');
    setFormAmount('');
  };

  const handleSave = async () => {
    if (!formState || !formAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    setSaving(true);
    try {
      if (editingLimit) {
        await api.updateStateLimit(editingLimit.id, {
          state: formState,
          limit_amount: amount
        });
        toast.success('State limit updated');
      } else {
        await api.createStateLimit({
          state: formState,
          limit_amount: amount
        });
        toast.success('State limit added');
      }

      fetchLimits();
      handleClose();
    } catch (error: any) {
      console.error('Error saving limit:', error);
      toast.error(error.message || 'Failed to save state limit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this state limit?')) return;

    try {
      await api.deleteStateLimit(id);
      toast.success('State limit deleted');
      fetchLimits();
    } catch (error) {
      console.error('Error deleting limit:', error);
      toast.error('Failed to delete state limit');
    }
  };

  const handleClose = () => {
    setEditingLimit(null);
    setIsAddingNew(false);
    setFormState('');
    setFormAmount('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <DollarSign className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <div>
                <CardTitle>State Estate Limits</CardTitle>
                <CardDescription>
                  Manage small estate affidavit limits by state
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add State
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {limits.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No state limits configured yet</p>
              <p className="text-sm text-muted-foreground">
                Add state limits to customize the settlement referral logic
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Limit Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limits.map((limit) => (
                  <TableRow key={limit.id}>
                    <TableCell className="font-medium">{limit.state}</TableCell>
                    <TableCell>${limit.limit_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(limit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(limit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editingLimit !== null || isAddingNew} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLimit ? 'Edit State Limit' : 'Add New State Limit'}
            </DialogTitle>
            <DialogDescription>
              Set the small estate affidavit limit for this state
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="state">State Name *</Label>
              <Input
                id="state"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                placeholder="e.g., California"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Limit Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="e.g., 184500"
              />
              <p className="text-xs text-muted-foreground">
                Estates below this amount qualify for small estate affidavit
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
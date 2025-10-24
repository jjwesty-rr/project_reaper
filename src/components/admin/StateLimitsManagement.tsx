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

interface StateLimit {
  id: string;
  state: string;
  limit_amount: number;
}

export function StateLimitsManagement() {
  const [limits, setLimits] = useState<StateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLimit, setEditingLimit] = useState<StateLimit | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formState, setFormState] = useState('');
  const [formAmount, setFormAmount] = useState('');

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('state_estate_limits')
        .select('*')
        .order('state');

      if (error) throw error;
      setLimits(data || []);
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

    try {
      const amount = parseFloat(formAmount);
      if (isNaN(amount) || amount < 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (editingLimit) {
        const { error } = await supabase
          .from('state_estate_limits')
          .update({ state: formState, limit_amount: amount })
          .eq('id', editingLimit.id);

        if (error) throw error;
        toast.success('State limit updated');
      } else {
        const { error } = await supabase
          .from('state_estate_limits')
          .insert({ state: formState, limit_amount: amount });

        if (error) throw error;
        toast.success('State limit added');
      }

      fetchLimits();
      handleClose();
    } catch (error: any) {
      console.error('Error saving limit:', error);
      toast.error(error.message || 'Failed to save state limit');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this state limit?')) return;

    try {
      const { error } = await supabase
        .from('state_estate_limits')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>State Estate Limits</CardTitle>
              <CardDescription>
                Manage small estate affidavit limits by state
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add State
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                      <Pencil className="h-4 w-4" />
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="state">State Name</Label>
              <Input
                id="state"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                placeholder="e.g., California"
              />
            </div>
            <div>
              <Label htmlFor="amount">Limit Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="e.g., 184500"
              />
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

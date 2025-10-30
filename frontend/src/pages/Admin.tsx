import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Users, Briefcase, ArrowLeft, Eye, UserPlus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { AdminManagement } from '@/components/admin/AdminManagement';  // ADD THIS LINE

interface Submission {
  id: number;
  contact_email: string;
  decedent_name: string;
  decedent_state: string;
  estate_value: number;
  referral_type: string;
  status: string;
  attorney_id?: number;
  notes?: string;
  created_at: string;
}

interface Attorney {
  id: number;
  name: string;
  email: string;
  phone: string;
  state: string;
  specialties: string[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [selectedAttorneyId, setSelectedAttorneyId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const submissionsData = await api.getSubmissions();
      setSubmissions(submissionsData);

      const attorneysData = await api.getAttorneys();
      setAttorneys(attorneysData);

      toast.success('Data loaded successfully');
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (submission: Submission) => {
    setEditingSubmission(submission);
    setSelectedAttorneyId(submission.attorney_id?.toString() || '');
    setSelectedStatus(submission.status);
    setNotes(submission.notes || '');
    setEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingSubmission) return;

    setSaving(true);
    try {
      const updates: any = {
        status: selectedStatus,
      };

      if (selectedAttorneyId) {
        updates.attorney_id = parseInt(selectedAttorneyId);
      }

      if (notes) {
        updates.notes = notes;
      }

      await api.updateSubmission(editingSubmission.id, updates);
      
      toast.success('Submission updated successfully');
      setEditDialogOpen(false);
      loadData(); // Reload data to show changes
    } catch (error: any) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    } finally {
      setSaving(false);
    }
  };

  const getAssignedAttorney = (attorneyId?: number) => {
    if (!attorneyId) return null;
    return attorneys.find(a => a.id === attorneyId);
  };

  const getReferralBadge = (type: string) => {
    const colors: Record<string, string> = {
      'affidavit': 'bg-green-500',
      'informal': 'bg-blue-500',
      'formal': 'bg-orange-500',
      'trust': 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  const assignedCount = submissions.filter(s => s.attorney_id).length;
  const unassignedCount = submissions.filter(s => !s.attorney_id).length;
  
  
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">
              Manage estate settlement submissions and attorneys
            </p>
          </div>
          <Shield className="h-12 w-12 text-primary" />
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{submissions.length}</CardTitle>
              <CardDescription>Total Submissions</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{attorneys.length}</CardTitle>
              <CardDescription>Registered Attorneys</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{assignedCount}</CardTitle>
              <CardDescription>Assigned to Attorney</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-orange-600">{unassignedCount}</CardTitle>
              <CardDescription>Awaiting Assignment</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions">
              <Users className="h-4 w-4 mr-2" />
              Client Submissions
            </TabsTrigger>
          <TabsTrigger value="attorneys">
  <Briefcase className="h-4 w-4 mr-2" />
  Attorneys
</TabsTrigger>
<TabsTrigger value="users">
  <Shield className="h-4 w-4 mr-2" />
  User Management
</TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>
                  View, assign attorneys, and manage estate settlement submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Decedent</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Estate Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Attorney</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">
                          No submissions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((submission) => {
                        const assignedAttorney = getAssignedAttorney(submission.attorney_id);
                        return (
                          <TableRow key={submission.id}>
                            <TableCell className="font-mono">#{submission.id}</TableCell>
                            <TableCell className="font-medium">{submission.decedent_name}</TableCell>
                            <TableCell className="text-sm">{submission.contact_email}</TableCell>
                            <TableCell>{submission.decedent_state}</TableCell>
                            <TableCell>${submission.estate_value.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={getReferralBadge(submission.referral_type)}>
                                {submission.referral_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{submission.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {assignedAttorney ? (
                                <div className="text-sm">
                                  <p className="font-medium">{assignedAttorney.name}</p>
                                  <p className="text-muted-foreground text-xs">{assignedAttorney.email}</p>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-100">
                                  Unassigned
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(submission.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/status/${submission.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(submission)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attorneys Tab */}
          <TabsContent value="attorneys">
            <Card>
              <CardHeader>
                <CardTitle>Attorney Directory</CardTitle>
                <CardDescription>
                  Manage attorneys available for client matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attorneys.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No attorneys registered yet</p>
                    <p className="text-sm text-muted-foreground">
                      Attorneys can be added via the Flask API endpoint
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Specialties</TableHead>
                        <TableHead>Assigned Cases</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attorneys.map((attorney) => {
                        const assignedCases = submissions.filter(s => s.attorney_id === attorney.id).length;
                        return (
                          <TableRow key={attorney.id}>
                            <TableCell className="font-medium">{attorney.name}</TableCell>
                            <TableCell>{attorney.email}</TableCell>
                            <TableCell>{attorney.phone}</TableCell>
                            <TableCell>{attorney.state}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {attorney.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{assignedCases} cases</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        

        {/* User Management Tab */}
<TabsContent value="users">
  <AdminManagement />
</TabsContent>

        </Tabs>
      </div>

      

      {/* Edit Submission Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Submission #{editingSubmission?.id}</DialogTitle>
            <DialogDescription>
              Assign attorney, update status, and add notes
            </DialogDescription>
          </DialogHeader>
          
          {editingSubmission && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Decedent</p>
                  <p className="text-sm text-muted-foreground">{editingSubmission.decedent_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Contact</p>
                  <p className="text-sm text-muted-foreground">{editingSubmission.contact_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Type</p>
                  <Badge className={getReferralBadge(editingSubmission.referral_type)}>
                    {editingSubmission.referral_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Estate Value</p>
                  <p className="text-sm text-muted-foreground">${editingSubmission.estate_value.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attorney">Assign Attorney</Label>
                <Select value={selectedAttorneyId} onValueChange={setSelectedAttorneyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an attorney" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {attorneys.map((attorney) => (
                      <SelectItem key={attorney.id} value={attorney.id.toString()}>
                        {attorney.name} - {attorney.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under review">Under Review</SelectItem>
                    <SelectItem value="assigned">Assigned to Attorney</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this submission, attorney interactions, special considerations, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
   </div>
    </>
  );
}
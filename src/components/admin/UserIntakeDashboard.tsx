import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Submission {
  id: string;
  user_id: string;
  referral_type: string;
  total_estimated_value: number;
  status: string;
  created_at: string;
  contact_info: any;
  decedent_info: any;
}

export function UserIntakeDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const search = searchTerm.toLowerCase();
    const contactName = sub.contact_info?.name?.toLowerCase() || '';
    const decedentName = sub.decedent_info?.name?.toLowerCase() || '';
    return contactName.includes(search) || decedentName.includes(search);
  });

  const getReferralTypeColor = (type: string) => {
    switch (type) {
      case 'affidavits': return 'default';
      case 'informal_probate': return 'secondary';
      case 'formal_probate': return 'destructive';
      case 'trust_administration': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Intake Submissions</CardTitle>
        <CardDescription>
          View all estate settlement intake submissions
        </CardDescription>
        <Input
          placeholder="Search by contact or decedent name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact Name</TableHead>
              <TableHead>Decedent Name</TableHead>
              <TableHead>Referral Type</TableHead>
              <TableHead>Est. Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.contact_info?.name || 'N/A'}</TableCell>
                  <TableCell>{sub.decedent_info?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getReferralTypeColor(sub.referral_type)}>
                      {sub.referral_type?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${sub.total_estimated_value?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sub.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(sub.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/status/${sub.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
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

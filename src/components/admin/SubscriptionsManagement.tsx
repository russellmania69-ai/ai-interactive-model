import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { XCircle, CheckCircle } from 'lucide-react';

interface Subscription {
  id: string;
  user_email: string;
  model_name: string;
  subscription_price: number;
  payment_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
}

export default function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      // Get subscription details before updating
      const subscription = subscriptions.find(sub => sub.id === id);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ payment_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Send cancellation email if status is cancelled
      if (newStatus === 'cancelled' && subscription) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'cancellation_confirmation',
            to: subscription.user_email,
            data: {
              name: subscription.user_email.split('@')[0],
              plan: `${subscription.model_name} Subscription`,
              subscriptionEndDate: new Date(subscription.subscription_end_date).toLocaleDateString()
            }
          }
        });
      }

      loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.user_email}</TableCell>
                <TableCell>{sub.model_name}</TableCell>
                <TableCell>${sub.subscription_price}</TableCell>
                <TableCell>
                  <Badge variant={sub.payment_status === 'completed' ? 'default' : 'secondary'}>
                    {sub.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(sub.subscription_start_date).toLocaleDateString()} - 
                  {new Date(sub.subscription_end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {sub.payment_status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(sub.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Activate
                    </Button>
                  )}
                  {sub.payment_status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(sub.id, 'cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

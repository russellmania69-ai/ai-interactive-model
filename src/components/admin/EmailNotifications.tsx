import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Mail, Send, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmailNotifications() {
  const [testEmail, setTestEmail] = useState('');
  const [emailType, setEmailType] = useState('subscription_confirmation');
  const [sending, setSending] = useState(false);
  const [runningReminders, setRunningReminders] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({ title: 'Error', description: 'Please enter an email address', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: emailType,
          to: testEmail,
          data: {
            name: 'Test User',
            plan: 'Premium Plan',
            amount: '29.99',
            currency: 'USD',
            transactionId: 'TEST-' + Date.now(),
            renewalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          }
        }
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Test email sent successfully!' });
      setTestEmail('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send email', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const runRenewalReminders = async () => {
    setRunningReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-renewal-reminders');

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: `Sent ${data.message}` 
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send reminders', variant: 'destructive' });
    } finally {
      setRunningReminders(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="type">Email Type</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscription_confirmation">Subscription Confirmation</SelectItem>
                <SelectItem value="payment_receipt">Payment Receipt</SelectItem>
                <SelectItem value="renewal_reminder">Renewal Reminder</SelectItem>
                <SelectItem value="cancellation_confirmation">Cancellation Confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={sendTestEmail} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Renewal Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Send renewal reminder emails to all subscriptions expiring in 3 days.
          </p>
          <Button onClick={runRenewalReminders} disabled={runningReminders}>
            <Clock className="h-4 w-4 mr-2" />
            {runningReminders ? 'Sending...' : 'Send Renewal Reminders'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
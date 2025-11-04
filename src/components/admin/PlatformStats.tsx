import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Users, DollarSign, MessageSquare, Image } from 'lucide-react';

export default function PlatformStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalChats: 0,
    totalImages: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, subsRes, chatsRes, imagesRes] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('subscription_price, payment_status'),
        supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('chat_images').select('id', { count: 'exact', head: true }),
      ]);

      const activeSubs = subsRes.data?.filter(s => s.payment_status === 'completed') || [];
      const revenue = activeSubs.reduce((sum, s) => sum + Number(s.subscription_price || 0), 0);

      setStats({
        totalUsers: usersRes.count || 0,
        activeSubscriptions: activeSubs.length,
        totalRevenue: revenue,
        totalChats: chatsRes.count || 0,
        totalImages: imagesRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChats}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Generated Images</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalImages}</div>
        </CardContent>
      </Card>
    </div>
  );
}

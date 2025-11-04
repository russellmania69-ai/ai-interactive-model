import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UsersManagement from '@/components/admin/UsersManagement';
import SubscriptionsManagement from '@/components/admin/SubscriptionsManagement';
import ContentModeration from '@/components/admin/ContentModeration';
import PlatformStats from '@/components/admin/PlatformStats';
import ModelsManagement from '@/components/admin/ModelsManagement';
import EmailNotifications from '@/components/admin/EmailNotifications';
import EmailAnalytics from '@/components/admin/EmailAnalytics';



export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }

    setIsAdmin(true);
  }, [user, profile, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>



          <TabsContent value="stats">
            <PlatformStats />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="models">
            <ModelsManagement />
          </TabsContent>

          <TabsContent value="emails">
            <EmailNotifications />
          </TabsContent>

          <TabsContent value="analytics">
            <EmailAnalytics />
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Users, Plus, Search, Lock, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getAuth, postAuth } from '@/util/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { useAppSelector } from '@/app/store/hooks';

interface GroupMember {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
}

// interface Group {
//   id: number;
//   name: string;
//   description: string;
//   memberCount: number;
//   isPrivate: boolean;
//   isMember: boolean;
//   createdAt: string;
// }

interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  isMember: boolean;
  createdAt: string;
  isBlocked?: boolean;     // ← add this line
}

export function GroupsScreen() {
  const navigate = useNavigate();
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const [selectedTab, setSelectedTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  


  // const fetchGroups = async () => {
  //   try {
  //     setLoading(true);
  //     const endpoint = selectedTab === 'my-groups' ? '/api/groups?my_groups=1' : '/api/groups';
  //     const res = await getAuth(endpoint);
  //     setGroups(res);
  //   } catch (error) {
  //     console.error('Failed to fetch groups', error);
  //     toast.error('Failed to load groups');
  //   } finally {
  //     setLoading(false);
  //   }
  // };





const fetchGroups = async () => {
    try {
        setLoading(true);
        const endpoint = selectedTab === 'my-groups' 
            ? '/api/groups?my_groups=1' 
            : '/api/groups';  // or '/api/groups?discover=1' if backend supports flag

        const res = await getAuth(endpoint);
        
        // Filter blocked groups only in Discover tab
        let processedGroups = res;
        if (selectedTab === 'discover') {
            processedGroups = res.filter((g: Group) => !g.isBlocked);
        }
        
        setGroups(processedGroups);
    } catch (error) {
        console.error('Failed to fetch groups', error);
        toast.error('Failed to load groups');
    } finally {
        setLoading(false);
    }
};



  useEffect(() => {
    fetchGroups();
  }, [selectedTab]);

  const handleCreateGroup = async () => {
    if (isGuest) {
      toast.info('Please log in to create a group', {
        action: { label: 'Log In', onClick: () => navigate('/auth') }
      });
      return;
    }
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      await postAuth('/api/groups', {
        name: newGroupName,
        description: newGroupDescription,
        is_private: isPrivate,
      });
      toast.success('Group created successfully!');
      setDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsPrivate(false);
      fetchGroups();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId: number, groupName: string) => {
    if (isGuest) {
      toast.info('Please log in to join groups', {
        action: { label: 'Log In', onClick: () => navigate('/auth') }
      });
      return;
    }
    try {
      await postAuth(`/api/groups/${groupId}/join`);
      toast.success(`Joined ${groupName}!`);
      fetchGroups();
    } catch (error: any) {
      console.error(error);
      const msg = error.data && error.data.message ? error.data.message : 'Failed to join group';
      toast.error(msg);
    }
  };

  const handleViewGroup = (groupId: number) => {
    navigate(`/groups/${groupId}`);
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <TopNav />

      <div className="w-full">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users size={32} className="text-primary" />
                Groups
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Join communities and make predictions together
              </p>
            </div>

            {!isGuest && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="shadow-lg shadow-primary/20"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    }}
                  >
                    <Plus size={20} className="mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Group Name</Label>
                      <Input
                        placeholder="Enter group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="glass-card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe your group..."
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        className="glass-card"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="private" className="font-normal cursor-pointer">
                        Make this group private
                      </Label>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateGroup}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      }}
                    >
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Unified Controls & Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-muted/50 p-1 h-auto self-start md:self-auto">
                <TabsTrigger value="discover" className="px-6 py-2 rounded-md">Discover</TabsTrigger>
                <TabsTrigger value="my-groups" className="px-6 py-2 rounded-md">My Groups</TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <TabsContent value="discover" className="mt-0">
              <motion.div
                className="grid gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {loading ? (
                  <div className="text-center py-20">Loading groups...</div>
                ) : filteredGroups.length > 0 ? (
                  filteredGroups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      className="glass-card rounded-xl p-5 border border-border/50 hover:border-primary/20 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg">{group.name}</h3>
                            {group.isPrivate ? (
                              <Lock size={14} className="text-muted-foreground" />
                            ) : (
                              <Globe size={14} className="text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3 text-sm line-clamp-1">{group.description}</p>
                          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Users size={14} />
                              <span>{group.memberCount} members</span>
                            </div>
                            <span>•</span>
                            <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {!group.isMember && !isGuest && (
                          <Button
                            onClick={() => handleJoinGroup(group.id, group.name)}
                            disabled={group.isPrivate}
                            size="sm"
                            className="px-6"
                            style={{
                              background: group.isPrivate
                                ? undefined
                                : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                            }}
                          >
                            {group.isPrivate ? 'Private' : 'Join'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                    <Search className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium">No groups found matching "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="my-groups" className="mt-0">
              {loading ? (
                <div className="text-center py-20">Loading groups...</div>
              ) : groups.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                  <Users size={40} className="mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold text-lg mb-2">No Groups Joined</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    You haven't joined any groups yet. Explore the community to find where you belong.
                  </p>
                  <Button
                    onClick={() => setSelectedTab('discover')}
                    variant="outline"
                    className="glass-card"
                  >
                    Discover Groups
                  </Button>
                </div>
              ) : (
                <motion.div
                  className="grid gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {filteredGroups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      className="glass-card rounded-xl p-5 border border-border/50 hover:border-primary/20 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg">{group.name}</h3>
                            {group.isPrivate ? (
                              <Lock size={14} className="text-muted-foreground" />
                            ) : (
                              <Globe size={14} className="text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3 text-sm line-clamp-1">{group.description}</p>
                          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Users size={14} />
                              <span>{group.memberCount} members</span>
                            </div>
                            <span>•</span>
                            <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-6 glass-card"
                          onClick={() => handleViewGroup(group.id)}
                        >
                          View
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>


      <MobileNav />
    </div>
  );
}
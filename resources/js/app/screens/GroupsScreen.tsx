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

interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  isMember: boolean;
  createdAt: string;
  isBlocked?: boolean;
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

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const endpoint = selectedTab === 'my-groups' 
          ? '/api/groups?my_groups=1' 
          : '/api/groups';

      const res = await getAuth(endpoint);
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

  const handleJoinGroup = async (groupId: number, groupName: string, isPrivate: boolean) => {
    if (isGuest) {
      toast.info('Please log in to join groups', {
        action: { label: 'Log In', onClick: () => navigate('/auth') }
      });
      return;
    }
    
    try {
      const res = await postAuth(`/api/groups/${groupId}/join`);
      toast.success(res.message || `Joined ${groupName}!`);
      fetchGroups();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to join group';
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
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <TopNav />

      <div className="w-full">
        <div className="max-w-5xl mx-auto px-2 md:px-4 py-4 md:py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div>
              <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 text-foreground tracking-tight">
                <Users size={20} className="text-primary md:w-8 md:h-8" />
                Groups
              </h1>
              <p className="text-muted-foreground mt-0.5 md:mt-2 text-[10px] md:text-lg">
                Join communities and make predictions together
              </p>
            </div>

            {!isGuest && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 md:h-11 px-3 md:px-6 shadow-lg shadow-primary/20 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    }}
                  >
                    <Plus size={14} className="mr-1.5 md:mr-2 md:w-5 md:h-5" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card sm:max-w-md p-4 md:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-sm md:text-lg">Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-[10px] md:text-sm">Group Name</Label>
                      <Input
                        placeholder="Enter group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="glass-card h-8 md:h-10 text-xs md:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-[10px] md:text-sm">Description</Label>
                      <Textarea
                        placeholder="Describe your group..."
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        className="glass-card min-h-[60px] md:min-h-[100px] text-xs md:text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="private" className="font-normal cursor-pointer text-[10px] md:text-sm">
                        Make this group private
                      </Label>
                    </div>
                    <Button
                      className="w-full h-8 md:h-11 text-xs md:text-sm font-bold"
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
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-3 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <TabsList className="bg-muted/50 p-0.5 h-8 md:h-12 self-start md:self-auto rounded-lg md:rounded-xl">
                <TabsTrigger value="discover" className="px-4 md:px-6 py-1 md:py-2 rounded-md md:rounded-lg text-[10px] md:text-sm">Discover</TabsTrigger>
                <TabsTrigger value="my-groups" className="px-4 md:px-6 py-1 md:py-2 rounded-md md:rounded-lg text-[10px] md:text-sm">My Groups</TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                <Input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 md:h-10 pl-8 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors text-xs md:text-sm"
                />
              </div>
            </div>

            <TabsContent value="discover" className="mt-0">
              <motion.div
                className="flex flex-col gap-1.5 md:gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {loading ? (
                  <div className="text-center py-12 md:py-20 text-xs md:text-lg">Loading groups...</div>
                ) : filteredGroups.length > 0 ? (
                  filteredGroups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 border border-border/50 hover:border-primary/20 transition-all shadow-sm group-card-hover"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between md:justify-start gap-3 mb-1 md:mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="font-bold text-sm md:text-lg truncate text-foreground">{group.name}</h3>
                              <div className="shrink-0 p-1 rounded-full bg-muted/50">
                                {group.isPrivate ? (
                                  <Lock size={10} className="text-muted-foreground md:w-3.5 md:h-3.5" />
                                ) : (
                                  <Globe size={10} className="text-muted-foreground md:w-3.5 md:h-3.5" />
                                )}
                              </div>
                            </div>
                            
                            {/* Join button right of name on mobile */}
                            {!group.isMember && !isGuest && (
                              <Button
                                onClick={() => handleJoinGroup(group.id, group.name, group.isPrivate)}
                                size="sm"
                                className="md:hidden h-6 px-3 rounded-full font-bold text-[9px] shadow-lg shadow-primary/10"
                                style={{
                                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                }}
                              >
                                {group.isPrivate ? 'Req' : 'Join'}
                              </Button>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-1 leading-relaxed">
                            {group.description}
                          </p>
                          
                          <div className="flex items-center gap-3 text-[8px] md:text-xs font-bold text-muted-foreground/70">
                            <div className="flex items-center gap-1">
                              <Users size={10} className="md:w-3.5 md:h-3.5" />
                              <span>{group.memberCount} members</span>
                            </div>
                            <span className="opacity-30">•</span>
                            <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {!group.isMember && !isGuest && (
                          <div className="hidden md:flex justify-end shrink-0">
                            <Button
                              onClick={() => handleJoinGroup(group.id, group.name, group.isPrivate)}
                              size="lg"
                              className="px-10 rounded-full font-bold shadow-lg shadow-primary/10 transition-all active:scale-95 hover:brightness-110"
                              style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                              }}
                            >
                              {group.isPrivate ? 'Request to Join' : 'Join'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 md:py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                    <Search className="mx-auto h-8 w-8 md:h-10 md:w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium text-xs md:text-lg">No groups found</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="my-groups" className="mt-0">
              <motion.div
                className="flex flex-col gap-1.5 md:gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {loading ? (
                  <div className="text-center py-12 md:py-20 text-xs md:text-lg">Loading groups...</div>
                ) : groups.length === 0 ? (
                  <div className="text-center py-12 md:py-20 bg-muted/10 rounded-2xl border border-dashed border-border p-4">
                    <Users size={32} className="mx-auto mb-3 text-muted-foreground/50 md:w-10 md:h-10" />
                    <h3 className="font-semibold text-sm md:text-lg mb-1">No Groups Joined</h3>
                    <p className="text-muted-foreground mb-4 text-[10px] md:text-sm max-w-sm mx-auto">
                      Explore the community to find where you belong.
                    </p>
                    <Button
                      onClick={() => setSelectedTab('discover')}
                      variant="outline"
                      className="glass-card h-8 md:h-11 text-[10px] md:text-sm px-4 md:px-6"
                    >
                      Discover Groups
                    </Button>
                  </div>
                ) : (
                  filteredGroups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 border border-border/50 hover:border-primary/20 transition-all shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between md:justify-start gap-3 mb-1 md:mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="font-bold text-sm md:text-lg truncate text-foreground">{group.name}</h3>
                              <div className="shrink-0 p-1 rounded-full bg-muted/50">
                                {group.isPrivate ? (
                                  <Lock size={10} className="text-muted-foreground md:w-3.5 md:h-3.5" />
                                ) : (
                                  <Globe size={10} className="text-muted-foreground md:w-3.5 md:h-3.5" />
                                )}
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="md:hidden h-6 px-3 rounded-full font-bold text-[9px] glass-card"
                              onClick={() => handleViewGroup(group.id)}
                            >
                              View
                            </Button>
                          </div>
                          
                          <p className="text-muted-foreground mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-1 leading-relaxed">
                            {group.description}
                          </p>
                          
                          <div className="flex items-center gap-3 text-[8px] md:text-xs font-bold text-muted-foreground/70">
                            <div className="flex items-center gap-1">
                              <Users size={10} className="md:w-3.5 md:h-3.5" />
                              <span>{group.memberCount} members</span>
                            </div>
                            <span className="opacity-30">•</span>
                            <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="hidden md:flex justify-end shrink-0">
                          <Button
                            size="lg"
                            variant="outline"
                            className="px-10 rounded-full font-bold glass-card shadow-sm hover:bg-muted/50 transition-all active:scale-95"
                            onClick={() => handleViewGroup(group.id)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
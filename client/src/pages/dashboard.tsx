import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import CreateEventModal from "@/components/create-event-modal";
import { useState } from "react";
import { Calendar, Coins, Trophy, Users, Plus, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: myEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/dashboard/my-events"],
  });

  const { data: myEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/dashboard/my-entries"],
  });

  if (eventsLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      upcoming: "bg-blue-500/20 text-blue-400",
      live: "bg-green-500/20 text-green-400",
      ended: "bg-gray-500/20 text-gray-400"
    };
    return variants[status as keyof typeof variants] || variants.upcoming;
  };

  const getPlatformName = (platform: string) => {
    return platform === "viveverse" ? "Viveverse" : "Meta Horizon Worlds";
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400">Manage your events and track your activity</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 bg-dark-card/50 rounded-lg px-4 py-2">
              <Coins className="text-accent h-5 w-5" />
              <span className="text-accent font-semibold text-lg">{user?.points?.toLocaleString() || 0}</span>
              <span className="text-gray-400 text-sm">SP</span>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-surface/50 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">My Events</p>
                  <p className="text-2xl font-bold text-primary">{myEvents?.length || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface/50 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Raffle Entries</p>
                  <p className="text-2xl font-bold text-secondary">{myEntries?.length || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-secondary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface/50 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Points</p>
                  <p className="text-2xl font-bold text-accent">{user?.points?.toLocaleString() || 0}</p>
                </div>
                <Coins className="h-8 w-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface/50 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Wins</p>
                  <p className="text-2xl font-bold text-green-400">0</p>
                </div>
                <Trophy className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-dark-surface border-primary/20">
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              My Events
            </TabsTrigger>
            <TabsTrigger value="entries" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Raffle Entries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {myEvents && myEvents.length > 0 ? (
              <div className="space-y-6">
                {myEvents.map((event: any) => (
                  <Card key={event.id} className="bg-dark-surface/50 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                            <Badge className={getStatusBadge(event.status)}>
                              {event.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-400 mb-4">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-secondary" />
                              <span className="text-gray-300">
                                {format(new Date(event.eventDate), "MMM dd, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Coins className="h-4 w-4 text-accent" />
                              <span className="text-gray-300">{event.entryPoints} SP entry</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="text-gray-300">Max {event.maxWinners} winners</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-primary/50 hover:border-primary"
                            onClick={() => window.open(event.worldUrl, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View World
                          </Button>
                          <Badge variant="outline" className="text-center">
                            {getPlatformName(event.platform)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Events Created</h3>
                <p className="text-gray-500 mb-6">Start hosting your own virtual metaverse events!</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            {myEntries && myEntries.length > 0 ? (
              <div className="space-y-6">
                {myEntries.map((entry: any) => (
                  <Card key={entry.entry.id} className="bg-dark-surface/50 border-secondary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{entry.event.title}</h3>
                            <Badge className={getStatusBadge(entry.raffle.status)}>
                              {entry.raffle.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-accent" />
                              <span className="text-gray-300">
                                {entry.entry.entryCount} {entry.entry.entryCount === 1 ? 'entry' : 'entries'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-secondary" />
                              <span className="text-gray-300">
                                Entered {format(new Date(entry.entry.createdAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-gray-300">
                                Event: {format(new Date(entry.event.eventDate), "MMM dd, yyyy")}
                              </span>
                            </div>
                          </div>
                          
                          {entry.raffle.status === "active" && (
                            <div className="bg-primary/10 rounded-lg p-3">
                              <p className="text-primary text-sm font-medium">
                                Raffle is still active! Good luck! 🍀
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="outline">
                            {getPlatformName(entry.event.platform)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Raffle Entries</h3>
                <p className="text-gray-500 mb-6">Start entering raffles to win access to exclusive events!</p>
                <Button 
                  onClick={() => window.location.href = "/events"}
                  className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/80 hover:to-accent/80"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Browse Events
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CreateEventModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      </div>
    </div>
  );
}

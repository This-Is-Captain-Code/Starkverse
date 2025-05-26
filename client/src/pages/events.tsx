import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EventCard from "@/components/event-card";
import CreateEventModal from "@/components/create-event-modal";
import { Search, Filter, Plus, Calendar, Trophy } from "lucide-react";

export default function Events() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || event.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  }) || [];

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Discover Events
            </h1>
            <p className="text-gray-400">Explore amazing virtual metaverse experiences</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 mt-4 md:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-dark-surface/50 border-primary/20 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-card border-primary/20 text-white"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-dark-card border-primary/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="bg-dark-card border-primary/20 text-white">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="viveverse">Viveverse</SelectItem>
                  <SelectItem value="meta-horizon">Meta Horizon Worlds</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-primary/50 hover:border-primary">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event: any) => (
              <EventCard key={event.id} event={event} showPlatform />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {events?.length === 0 ? (
              <>
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Events Yet</h3>
                <p className="text-gray-500 mb-6">Be the first to create an amazing virtual event!</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              </>
            ) : (
              <>
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPlatformFilter("all");
                  }}
                  variant="outline"
                  className="border-primary/50 hover:border-primary"
                >
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        )}

        <CreateEventModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      </div>
    </div>
  );
}

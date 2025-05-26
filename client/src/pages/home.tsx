import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/event-card";
import RaffleCard from "@/components/raffle-card";
import CreateEventModal from "@/components/create-event-modal";
import { useState } from "react";
import { Rocket, Plus, Trophy, Users, Coins, TrendingUp } from "lucide-react";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: activeRaffles, isLoading: rafflesLoading } = useQuery({
    queryKey: ["/api/raffles/active"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (eventsLoading || rafflesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Starkverse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full animate-float blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-secondary/10 rounded-full animate-float blur-xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-accent/10 rounded-full animate-float blur-xl" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fadeIn">
            Welcome to Starkverse
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Discover and host premium virtual metaverse events powered by blockchain technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 px-8 py-4 text-lg animate-glow"
              onClick={() => document.getElementById('featured-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="outline" 
              className="border-primary/50 hover:border-primary px-8 py-4 text-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Event
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section id="featured-events" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Featured Events
            </h2>
            <p className="text-gray-400 text-lg">Premium virtual experiences waiting for you</p>
          </div>
          
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.slice(0, 6).map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
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
            </div>
          )}

          {events && events.length > 6 && (
            <div className="text-center">
              <Button 
                variant="outline" 
                className="border-primary/50 hover:border-primary px-8 py-3"
              >
                View All Events
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Active Raffles */}
      <section className="py-20 px-4 bg-gradient-to-r from-dark-surface/30 to-dark-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Active Raffles
            </h2>
            <p className="text-gray-400 text-lg">Use your Starknet points to enter exclusive event raffles</p>
          </div>

          {activeRaffles && activeRaffles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeRaffles.slice(0, 4).map((raffle: any) => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Coins className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Active Raffles</h3>
              <p className="text-gray-500">Check back soon for new raffle opportunities!</p>
            </div>
          )}
        </div>
      </section>

      {/* Create Event CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
            <CardContent className="relative z-10 p-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ready to Create Your Event?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Host your own virtual metaverse experience and earn from ticket sales and sponsorships
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="text-primary text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Upload Your World</h3>
                  <p className="text-gray-400 text-sm">Connect Viveverse or Meta Horizon Worlds URLs</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="text-secondary text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Set Raffle Parameters</h3>
                  <p className="text-gray-400 text-sm">Configure entry costs and winner selection</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-accent text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Launch & Earn</h3>
                  <p className="text-gray-400 text-sm">Go live and start earning from your events</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 px-8 py-4 text-lg animate-glow"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-20 px-4 bg-gradient-to-r from-dark-surface/30 to-dark-card/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalEvents.toLocaleString()}</div>
                <div className="text-gray-400">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">{stats.activeUsers.toLocaleString()}</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">{(stats.pointsDistributed / 1000000).toFixed(1)}M</div>
                <div className="text-gray-400">Points Distributed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">{stats.raffleWinners.toLocaleString()}</div>
                <div className="text-gray-400">Raffle Winners</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <CreateEventModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}

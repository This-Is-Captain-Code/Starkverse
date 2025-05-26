import { Button } from "@/components/ui/button";
import CreateEventModal from "@/components/create-event-modal";
import { useState } from "react";
import { Rocket, Plus, Trophy } from "lucide-react";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);

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



      {/* Quick Actions */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Button 
              onClick={() => window.location.href = '/events'}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 p-8 h-auto flex-col space-y-3"
            >
              <Trophy className="h-12 w-12" />
              <div>
                <h3 className="text-xl font-semibold">Browse Events</h3>
                <p className="text-sm opacity-80">Enter raffles and win access to MetaHorizon worlds</p>
              </div>
            </Button>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="border-primary/50 hover:border-primary hover:bg-primary/10 p-8 h-auto flex-col space-y-3"
            >
              <Plus className="h-12 w-12" />
              <div>
                <h3 className="text-xl font-semibold">Create Event</h3>
                <p className="text-sm opacity-80">Host your own virtual metaverse experience</p>
              </div>
            </Button>
          </div>
        </div>
      </section>

      <CreateEventModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}

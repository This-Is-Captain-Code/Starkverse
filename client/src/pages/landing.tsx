import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Box, Rocket, Plus, Clock, Users, Coins, Calendar, Trophy } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-dark-surface/80 backdrop-blur-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Box className="text-primary text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Starkverse
              </span>
            </div>
            <Button onClick={handleLogin} className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80">
              Enter Starkverse
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full animate-float blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-secondary/10 rounded-full animate-float blur-xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-accent/10 rounded-full animate-float blur-xl" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fadeIn">
            Enter the Starkverse
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Host and discover premium virtual metaverse events. Win raffles with Starknet points and step into immersive digital worlds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 px-8 py-4 text-lg animate-glow"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline" 
              className="border-primary/50 hover:border-primary px-8 py-4 text-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Event
            </Button>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="bg-dark-surface/50 backdrop-blur-lg border-t border-primary/20 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Box className="text-primary text-2xl" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Starkverse
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                The premier platform for virtual metaverse events powered by Starknet blockchain technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={handleLogin} className="hover:text-primary transition-colors">Explore Events</button></li>
                <li><button onClick={handleLogin} className="hover:text-primary transition-colors">Create Event</button></li>
                <li><button onClick={handleLogin} className="hover:text-primary transition-colors">Raffles</button></li>
                <li><button onClick={handleLogin} className="hover:text-primary transition-colors">Dashboard</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Connect</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                </a>
              </div>
              <div className="text-xs text-gray-500">
                Powered by Starknet
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 Starkverse. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Coins, ExternalLink, Trophy, Crown } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    platform: string;
    worldUrl: string;
    entryPoints: number;
    maxWinners: number;
    eventDate: string;
    status: string;
    creatorId: string;
  };
  showPlatform?: boolean;
}

export default function EventCard({ event, showPlatform = false }: EventCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user won this raffle
  const { data: winnerStatus } = useQuery({
    queryKey: [`/api/raffle/${event.id}/winner`],
    enabled: !!user,
  });

  const enterRaffleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/raffles/${event.id}/enter`);
    },
    onSuccess: (response) => {
      toast({
        title: "Raffle Entry Successful!",
        description: `You've entered the raffle for ${event.title}. Good luck!`,
      });
      
      // Invalidate relevant queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/my-entries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Entry Failed",
        description: error.message || "Failed to enter raffle. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const canEnterRaffle = user && user.points >= event.entryPoints && event.status === "upcoming";

  return (
    <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20 hover:border-primary/50 transition-all duration-300 group">
      {/* Event Image Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-white/60 mx-auto mb-2" />
            <p className="text-white/60 text-sm">{getPlatformName(event.platform)}</p>
          </div>
        </div>
        {showPlatform && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-black/50 border-white/20 text-white">
              {getPlatformName(event.platform)}
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={getStatusBadge(event.status)}>
            {event.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
        </div>
        
        <p className="text-gray-400 mb-4 text-sm line-clamp-2">{event.description}</p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-secondary" />
              <span className="text-gray-300">
                {format(new Date(event.eventDate), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-secondary" />
              <span className="text-gray-300">{event.maxWinners} winners</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-accent" />
              <span className="text-accent font-semibold">{event.entryPoints} SP entry</span>
            </div>
            <div className="text-xs text-gray-400">
              🏆 Win raffle to access
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {canEnterRaffle ? (
            <Button 
              onClick={() => enterRaffleMutation.mutate()}
              disabled={enterRaffleMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/80 text-sm"
            >
              {enterRaffleMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Entering...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Enter Raffle
                </>
              )}
            </Button>
          ) : event.status === "ended" ? (
            <Button disabled className="flex-1 text-sm">
              Event Ended
            </Button>
          ) : event.status === "live" ? (
            <Button disabled className="flex-1 text-sm bg-green-500/20 text-green-400">
              Event Live
            </Button>
          ) : !user ? (
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-sm"
            >
              Login to Enter
            </Button>
          ) : (
            <Button disabled className="flex-1 text-sm">
              Insufficient Points
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

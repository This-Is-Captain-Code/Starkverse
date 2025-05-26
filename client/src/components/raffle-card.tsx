import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, Trophy, Plus, Coins } from "lucide-react";
import { format, differenceInHours, differenceInMinutes } from "date-fns";

interface RaffleCardProps {
  raffle: {
    id: number;
    eventId: number;
    status: string;
    endTime: string;
  };
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get event details for this raffle
  const { data: event } = useQuery({
    queryKey: [`/api/events/${raffle.eventId}`],
  });

  // Get raffle entries count (mock data for now)
  const totalEntries = Math.floor(Math.random() * 2000) + 500;
  const userEntries = Math.floor(Math.random() * 5);

  const enterRaffleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/raffles/${raffle.id}/enter`);
    },
    onSuccess: () => {
      toast({
        title: "Raffle Entry Added!",
        description: `You've added another entry to the raffle. Good luck!`,
      });
      
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

  if (!event) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-lg border-primary/30">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTimeLeft = () => {
    const now = new Date();
    const endTime = new Date(raffle.endTime);
    
    if (endTime <= now) {
      return "Ended";
    }
    
    const hoursLeft = differenceInHours(endTime, now);
    const minutesLeft = differenceInMinutes(endTime, now) % 60;
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m left`;
    } else {
      return `${minutesLeft}m left`;
    }
  };

  const isActive = raffle.status === "active" && new Date(raffle.endTime) > new Date();
  const canEnter = user && user.points >= event.entryPoints && isActive;
  const winProbability = userEntries > 0 ? ((userEntries / totalEntries) * 100).toFixed(1) : "0";

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-lg border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
      
      <CardContent className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{event.title}</h3>
          <Badge className={isActive ? "bg-accent/20 text-accent animate-glow" : "bg-gray-500/20 text-gray-400"}>
            <Clock className="mr-1 h-3 w-3" />
            {getTimeLeft()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{totalEntries.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-1">{event.maxWinners}</div>
            <div className="text-gray-400 text-sm">Winners</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Your entries:</span>
            <span className="text-accent font-semibold">{userEntries}</span>
          </div>
          <div className="w-full bg-dark-card rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full animate-glow transition-all duration-300"
              style={{ width: `${Math.min((userEntries / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">Win probability: {winProbability}%</div>
        </div>

        {isActive ? (
          <Button 
            onClick={() => enterRaffleMutation.mutate()}
            disabled={!canEnter || enterRaffleMutation.isPending}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
          >
            {enterRaffleMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Adding Entry...
              </>
            ) : canEnter ? (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry ({event.entryPoints} SP)
              </>
            ) : !user ? (
              "Login Required"
            ) : (
              "Insufficient Points"
            )}
          </Button>
        ) : (
          <Button disabled className="w-full border-2 border-gray-500/50 text-gray-500">
            <Trophy className="mr-2 h-4 w-4" />
            Raffle Ended
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

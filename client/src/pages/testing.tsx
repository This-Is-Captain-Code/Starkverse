import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Coins, Crown, RefreshCw, Trophy, ExternalLink } from "lucide-react";

export default function Testing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get events for winner buttons
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  // Refund points mutation
  const refundMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/points/refund-entries");
    },
    onSuccess: (data) => {
      toast({
        title: "Points Refunded!",
        description: `Refunded ${data.refunded} SP. New balance: ${data.newBalance} SP`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refund points",
        variant: "destructive",
      });
    },
  });

  // Make winner mutation
  const makeWinnerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest("POST", `/api/raffle/${eventId}/make-winner`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "You're a Winner! 🎉",
        description: `You can now access ${data.eventTitle || 'the MetaHorizon event'}!`,
      });
      // Force refresh all winner queries
      queryClient.invalidateQueries({ queryKey: ["/api/raffle"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set winner status",
        variant: "destructive",
      });
    },
  });

  // Award points mutation
  const awardPointsMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest("POST", "/api/points/award", { amount });
    },
    onSuccess: (data) => {
      toast({
        title: "Points Awarded!",
        description: `Added ${data.points - (user as any)?.points} SP to your balance`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to award points",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">Login Required</h2>
            <p className="text-gray-300 mb-6">Please login to access testing features</p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-primary/80"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
          Testing Panel
        </h1>
        <p className="text-lg text-gray-300">
          Demo tools for testing the Starkverse raffle system
        </p>
      </div>

      {/* User Stats */}
      <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-accent" />
            <span>Your Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Current Balance</p>
              <p className="text-2xl font-bold text-accent">{(user as any)?.points || 0} SP</p>
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary">
              {user.email}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Points Management */}
      <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-secondary" />
            <span>Points Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => awardPointsMutation.mutate(500)}
              disabled={awardPointsMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {awardPointsMutation.isPending ? "Adding..." : "Add 500 SP"}
            </Button>
            <Button
              onClick={() => awardPointsMutation.mutate(1000)}
              disabled={awardPointsMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {awardPointsMutation.isPending ? "Adding..." : "Add 1000 SP"}
            </Button>
            <Button
              onClick={() => refundMutation.mutate()}
              disabled={refundMutation.isPending}
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
            >
              {refundMutation.isPending ? "Refunding..." : "Refund All Entries"}
            </Button>
            <Button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/raffle"] });
                queryClient.invalidateQueries({ queryKey: ["/api/events"] });
                toast({
                  title: "Refreshed!",
                  description: "Winner status updated. Check the Events page.",
                });
              }}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Winner Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Winner Controls */}
      <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <span>Raffle Winner Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm">
            Set yourself as a winner to test accessing MetaHorizon worlds
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events?.map((event: any) => (
              <div key={event.id} className="p-4 bg-dark-surface/30 rounded-lg border border-primary/10">
                <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{event.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-accent/50 text-accent">
                    {event.entryPoints} SP entry
                  </Badge>
                  <Button
                    onClick={() => makeWinnerMutation.mutate(event.id)}
                    disabled={makeWinnerMutation.isPending}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                  >
                    {makeWinnerMutation.isPending ? "Setting..." : (
                      <>
                        <Trophy className="mr-1 h-3 w-3" />
                        Make Winner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle>Testing Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Add SP tokens using the buttons above</li>
            <li>Go to Events page and enter raffles using your SP</li>
            <li>Come back here and set yourself as a winner</li>
            <li>Return to Events to see the golden "Winner!" badge</li>
            <li>Click "Enter Meta Horizon Worlds" to access the real event URLs</li>
            <li>Use "Refund All Entries" to reset and test again</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
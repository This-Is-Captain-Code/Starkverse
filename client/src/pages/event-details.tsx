import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  Users, 
  Coins, 
  ExternalLink, 
  Trophy, 
  Crown, 
  ArrowLeft,
  MapPin,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function EventDetails() {
  const [match, params] = useRoute("/event/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const eventId = parseInt(params?.id || "0");

  // Get event details
  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  // Check if user won this raffle
  const { data: winnerStatus } = useQuery({
    queryKey: [`/api/raffle/${eventId}/winner`],
    enabled: !!user && !!eventId,
  });

  // Enter raffle mutation
  const enterRaffleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/raffles/${eventId}/enter`);
    },
    onSuccess: () => {
      toast({
        title: "Raffle Entered! 🎟️",
        description: `You've entered the raffle for ${event?.title}. Good luck!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Entry Failed",
        description: error.message || "Failed to enter raffle",
        variant: "destructive",
      });
    },
  });

  const getPlatformName = (platform: string) => {
    return platform === "viveverse" ? "Viveverse" : "Meta Horizon Worlds";
  };

  const getPlatformColor = (platform: string) => {
    return platform === "viveverse" ? "from-purple-500 to-blue-500" : "from-blue-500 to-cyan-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-dark-bg pt-16">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-4">Event Not Found</h2>
              <p className="text-gray-300 mb-6">The event you're looking for doesn't exist.</p>
              <Link href="/events">
                <Button className="bg-primary hover:bg-primary/80">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canEnterRaffle = user && (user as any).points >= event.entryPoints && event.status === "upcoming";
  const isWinner = winnerStatus?.isWinner;

  return (
    <div className="min-h-screen bg-dark-bg pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/events">
          <Button variant="ghost" className="mb-6 text-gray-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20 overflow-hidden">
              <div className={`h-48 bg-gradient-to-r ${getPlatformColor(event.platform)} flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative text-center">
                  <Badge className={`bg-gradient-to-r ${getPlatformColor(event.platform)} text-white mb-4`}>
                    {getPlatformName(event.platform)}
                  </Badge>
                  <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
                  <div className="flex items-center justify-center space-x-4 text-white/80">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.eventDate), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.eventDate), "HH:mm")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6">
                <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Event Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-dark-surface/30 rounded-lg">
                    <Coins className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-accent">{event.entryPoints}</p>
                    <p className="text-sm text-gray-400">SP Entry Cost</p>
                  </div>
                  <div className="text-center p-4 bg-dark-surface/30 rounded-lg">
                    <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-secondary">{event.maxWinners}</p>
                    <p className="text-sm text-gray-400">Max Winners</p>
                  </div>
                  <div className="text-center p-4 bg-dark-surface/30 rounded-lg">
                    <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-400">
                      {event.status === "upcoming" ? "Active" : event.status}
                    </p>
                    <p className="text-sm text-gray-400">Raffle Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {/* Winner Status or Entry */}
            <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {isWinner ? (
                    <>
                      <Crown className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400">Congratulations!</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="h-5 w-5 text-primary" />
                      <span>Enter Raffle</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isWinner ? (
                  <>
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-500/30">
                      <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                      <p className="text-yellow-400 font-semibold mb-1">You Won!</p>
                      <p className="text-gray-300 text-sm">You have exclusive access to this event</p>
                    </div>
                    <Button 
                      onClick={() => window.open(winnerStatus.worldUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                      size="lg"
                    >
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Enter {getPlatformName(event.platform)}
                    </Button>
                  </>
                ) : canEnterRaffle ? (
                  <>
                    <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <Coins className="h-12 w-12 text-accent mx-auto mb-2" />
                      <p className="text-accent font-semibold mb-1">{event.entryPoints} SP Required</p>
                      <p className="text-gray-300 text-sm">Your balance: {(user as any)?.points} SP</p>
                    </div>
                    <Button 
                      onClick={() => enterRaffleMutation.mutate()}
                      disabled={enterRaffleMutation.isPending}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold"
                      size="lg"
                    >
                      {enterRaffleMutation.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Entering Raffle...
                        </>
                      ) : (
                        <>
                          <Trophy className="mr-2 h-5 w-5" />
                          Enter Raffle ({event.entryPoints} SP)
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center p-4 bg-gray-500/10 rounded-lg border border-gray-500/30">
                    <p className="text-gray-400 mb-2">
                      {!user ? "Login required to enter raffle" : 
                       (user as any).points < event.entryPoints ? "Insufficient SP tokens" : 
                       "Raffle is closed"}
                    </p>
                    {!user && (
                      <Button 
                        onClick={() => window.location.href = "/api/login"}
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-primary/10"
                      >
                        Login to Enter
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Info */}
            {user && (
              <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-400">Your Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-accent" />
                      <span className="text-accent font-semibold">{(user as any)?.points || 0} SP</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      Balance
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
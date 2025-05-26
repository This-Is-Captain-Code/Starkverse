import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Coins, Trophy, Star, Calendar, Gift, Sparkles } from "lucide-react";

export default function Rewards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: unclaimedRewards = [], isLoading: unclaimedLoading } = useQuery({
    queryKey: ["/api/rewards/unclaimed"],
  });

  const { data: rewardHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/rewards/history"],
  });

  const claimMutation = useMutation({
    mutationFn: async (completionId: number) => {
      return apiRequest(`/api/rewards/${completionId}/claim`, {
        method: "POST",
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Reward Claimed!",
        description: `Successfully claimed your SP tokens! New balance: ${data.newBalance} SP`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/unclaimed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Claim Failed",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: "Legendary", color: "bg-yellow-500/20 text-yellow-400", icon: "🏆" };
    if (score >= 80) return { label: "Excellent", color: "bg-purple-500/20 text-purple-400", icon: "⭐" };
    if (score >= 70) return { label: "Great", color: "bg-blue-500/20 text-blue-400", icon: "💎" };
    if (score >= 60) return { label: "Good", color: "bg-green-500/20 text-green-400", icon: "✨" };
    return { label: "Participated", color: "bg-gray-500/20 text-gray-400", icon: "🎯" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (unclaimedLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Gift className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SP Token Rewards
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Claim your SP tokens earned from completing metaverse events
          </p>
        </div>

        {/* Unclaimed Rewards Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-semibold">Unclaimed Rewards</h2>
            {unclaimedRewards.length > 0 && (
              <Badge className="bg-accent/20 text-accent">
                {unclaimedRewards.length} pending
              </Badge>
            )}
          </div>

          {unclaimedRewards.length === 0 ? (
            <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Unclaimed Rewards</h3>
                <p className="text-gray-400 text-center">
                  Complete metaverse events to earn SP token rewards!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unclaimedRewards.map((reward: any) => {
                const performance = getPerformanceLevel(reward.performanceScore);
                return (
                  <Card
                    key={reward.id}
                    className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20 hover:border-primary/50 transition-all duration-300 group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Event Completed!</CardTitle>
                        <Badge className={performance.color}>
                          {performance.icon} {performance.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Performance Score:</span>
                          <span className="text-white font-semibold">{reward.performanceScore}/100</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">SP Reward:</span>
                          <div className="flex items-center space-x-1">
                            <Coins className="h-4 w-4 text-accent" />
                            <span className="text-accent font-bold text-lg">{reward.spAwarded} SP</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Completed:</span>
                          <span className="text-sm text-gray-300">
                            {formatDate(reward.completedAt)}
                          </span>
                        </div>

                        <Button
                          onClick={() => claimMutation.mutate(reward.id)}
                          disabled={claimMutation.isPending}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                        >
                          {claimMutation.isPending ? "Claiming..." : "Claim Reward"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Reward History Section */}
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="h-6 w-6 text-secondary" />
            <h2 className="text-2xl font-semibold">Reward History</h2>
          </div>

          {rewardHistory.length === 0 ? (
            <Card className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Completion History</h3>
                <p className="text-gray-400 text-center">
                  Your event completion history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rewardHistory.map((completion: any) => {
                const performance = getPerformanceLevel(completion.performanceScore);
                return (
                  <Card
                    key={completion.id}
                    className="bg-gradient-to-br from-dark-surface/50 to-dark-card/30 backdrop-blur-lg border-primary/20"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge className={performance.color}>
                              {performance.icon} {performance.label}
                            </Badge>
                            <span className="text-gray-400">Score: {completion.performanceScore}/100</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Completed: {formatDate(completion.completedAt)}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Coins className="h-4 w-4 text-accent" />
                            <span className="text-accent font-bold">{completion.spAwarded} SP</span>
                          </div>
                          <Badge
                            variant={completion.rewardClaimed ? "default" : "secondary"}
                            className={completion.rewardClaimed ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}
                          >
                            {completion.rewardClaimed ? "Claimed" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
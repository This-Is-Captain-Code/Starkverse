import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// For demo purposes, we'll use a simplified wallet connection
// In production, this would integrate with actual Starknet wallets
interface WalletConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (address: string) => void;
}

export default function WalletConnect({ open, onOpenChange, onConnect }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const demoWallets = [
    {
      name: "ArgentX",
      icon: "🦊",
      description: "Most popular Starknet wallet",
      installed: true,
      demoAddress: "0x123...abc"
    },
    {
      name: "Braavos",
      icon: "🛡️", 
      description: "Security-focused Starknet wallet",
      installed: false,
      demoAddress: "0x456...def"
    }
  ];

  const handleConnect = async (wallet: typeof demoWallets[0]) => {
    setConnecting(true);
    
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo - generate a mock Starknet address
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40).padStart(40, '0')}`;
      
      setConnectedAddress(mockAddress);
      onConnect(mockAddress);
      
      toast({
        title: "Wallet Connected!",
        description: `Successfully connected to ${wallet.name}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const copyAddress = () => {
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-surface border-primary/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Connect Starknet Wallet
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your Starknet wallet to interact with Starkverse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {demoWallets.map((wallet) => (
            <Card 
              key={wallet.name}
              className="bg-dark-card/50 border-primary/20 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => !connecting && handleConnect(wallet)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white">{wallet.name}</h3>
                      <p className="text-gray-400 text-sm">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {wallet.installed ? (
                      <Badge className="bg-green-500/20 text-green-400">Installed</Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400">Not Installed</Badge>
                    )}
                    {connecting ? (
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {connectedAddress && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-sm text-green-400">✅ Connected</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{formatAddress(connectedAddress)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>By connecting, you agree to Starkverse Terms of Service</p>
          <p className="mt-1">
            🔗 Powered by Starknet • Testnet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
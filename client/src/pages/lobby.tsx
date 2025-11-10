import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lobby() {
  const { gameState, playerId, startGame } = useWebSocket();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!gameState || !playerId) {
      setLocation("/");
    } else if (gameState.lobby.status === "playing" || gameState.lobby.status === "finished") {
      setLocation("/game");
    }
  }, [gameState, playerId, setLocation]);

  if (!gameState || !playerId) {
    return null;
  }

  const isHost = gameState.lobby.hostId === playerId;
  const canStart = gameState.players.length >= 2;

  const copyCode = () => {
    navigator.clipboard.writeText(gameState.lobby.code);
    toast({
      title: "Code copied!",
      description: "Share this code with your friends",
    });
  };

  const handleStartGame = () => {
    startGame(gameState.lobby.id);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-3xl mb-2">Waiting Room</CardTitle>
            <CardDescription>Share the lobby code with your friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Lobby Code</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="font-heading text-5xl font-bold text-primary tracking-widest" data-testid="text-lobby-code">
                  {gameState.lobby.code}
                </h2>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyCode}
                data-testid="button-copy-code"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Players ({gameState.players.length})
                </h3>
                <Badge variant="secondary" data-testid="badge-player-count">
                  {gameState.players.length} player{gameState.players.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="space-y-2">
                {gameState.players.map((player) => (
                  <Card key={player.id} data-testid={`card-player-${player.id}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-heading font-semibold text-primary">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium" data-testid={`text-player-name-${player.id}`}>
                          {player.name}
                        </span>
                      </div>
                      {player.isHost && (
                        <Badge variant="default" data-testid={`badge-host-${player.id}`}>Host</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {isHost ? (
              <div className="space-y-2">
                <Button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  className="w-full h-12 text-lg font-heading"
                  data-testid="button-start-game"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Game
                </Button>
                {!canStart && (
                  <p className="text-sm text-muted-foreground text-center">
                    Waiting for at least 2 players to start...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Waiting for host to start the game...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

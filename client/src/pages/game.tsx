import { useState, useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Check, Send, Users, Menu, X } from "lucide-react";
import { WinnerModal } from "@/components/winner-modal";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const { gameState, playerId, submitGuess } = useWebSocket();
  const [, setLocation] = useLocation();
  const [guess, setGuess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!gameState || !playerId) {
      setLocation("/");
    } else if (gameState.lobby.status === "waiting") {
      setLocation("/lobby");
    }
  }, [gameState, playerId, setLocation]);

  if (!gameState || !playerId) {
    return null;
  }

  const currentPlayer = gameState.currentPlayer;
  const isMyTurn = currentPlayer?.id === playerId;
  const winner = gameState.lobby.winnerId
    ? gameState.players.find((p) => p.id === gameState.lobby.winnerId)
    : null;

  const handleSubmitGuess = () => {
    const guessNum = parseInt(guess);
    if (!isNaN(guessNum) && guessNum >= gameState.minRange && guessNum <= gameState.maxRange) {
      submitGuess(gameState.lobby.id, guessNum);
      setGuess("");
    } else {
      toast({
        title: "Invalid guess",
        description: `Please enter a number between ${gameState.minRange} and ${gameState.maxRange}`,
        variant: "destructive",
      });
    }
  };

  const PlayerSidebar = () => (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Users className="h-5 w-5" />
            Players
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            data-testid="button-close-sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-2 pt-0">
          <div className="bg-muted/30 rounded-md p-2 text-center mb-4">
            <p className="text-xs text-muted-foreground mb-1">Lobby Code</p>
            <p className="font-heading font-bold text-primary tracking-wider" data-testid="text-sidebar-lobby-code">
              {gameState.lobby.code}
            </p>
          </div>
          {gameState.players.map((player) => {
            const isCurrentTurn = currentPlayer?.id === player.id;
            const isWinner = gameState.lobby.winnerId === player.id;
            
            return (
              <div
                key={player.id}
                className={cn(
                  "p-3 rounded-md border transition-all",
                  isCurrentTurn && "bg-primary/5 border-primary/30 ring-2 ring-primary/20",
                  isWinner && "bg-success/5 border-success/30"
                )}
                data-testid={`card-sidebar-player-${player.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading font-semibold",
                      isWinner ? "bg-success/20 text-success" : "bg-muted text-foreground"
                    )}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm" data-testid={`text-sidebar-player-name-${player.id}`}>
                      {player.name}
                      {player.id === playerId && " (You)"}
                    </span>
                  </div>
                  {isCurrentTurn && gameState.lobby.status === "playing" && (
                    <Badge variant="default" className="text-xs" data-testid={`badge-turn-${player.id}`}>
                      Turn
                    </Badge>
                  )}
                  {isWinner && (
                    <Badge className="text-xs bg-success text-success-foreground" data-testid={`badge-winner-${player.id}`}>
                      Winner
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="font-heading text-3xl font-bold">Guess the Number</h1>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  data-testid="button-open-sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-heading">
                        {isMyTurn ? "Your Turn!" : `${currentPlayer?.name}'s Turn`}
                      </CardTitle>
                      <Badge variant="secondary" data-testid="badge-range">
                        {gameState.minRange} - {gameState.maxRange}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Guess a number between {gameState.minRange} and {gameState.maxRange}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter your guess"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && isMyTurn && handleSubmitGuess()}
                        disabled={!isMyTurn || gameState.lobby.status === "finished"}
                        min={gameState.minRange}
                        max={gameState.maxRange}
                        className="text-4xl text-center font-heading h-16"
                        data-testid="input-guess"
                      />
                      <Button
                        onClick={handleSubmitGuess}
                        disabled={!isMyTurn || !guess || gameState.lobby.status === "finished"}
                        size="lg"
                        className="px-8 h-16"
                        data-testid="button-submit-guess"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Guess History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {gameState.guesses.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No guesses yet. Be the first to guess!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-auto">
                        {[...gameState.guesses].reverse().map((g, idx) => (
                          <div
                            key={`${g.playerId}-${g.timestamp}`}
                            className={cn(
                              "p-4 rounded-md border flex items-center justify-between transition-all",
                              g.feedback === "correct" && "bg-success/5 border-success/30",
                              g.feedback === "higher" && "bg-destructive/5 border-destructive/30",
                              g.feedback === "lower" && "bg-destructive/5 border-destructive/30",
                              idx === 0 && "animate-in fade-in slide-in-from-top-2"
                            )}
                            data-testid={`card-guess-${g.playerId}-${g.timestamp}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="font-heading font-semibold text-sm">
                                  {g.playerName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{g.playerName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Guessed <span className="font-heading font-bold text-lg">{g.number}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {g.feedback === "higher" && (
                                <Badge variant="destructive" className="gap-1" data-testid={`badge-feedback-${g.playerId}-${g.timestamp}`}>
                                  <ArrowUp className="h-3 w-3" />
                                  Higher
                                </Badge>
                              )}
                              {g.feedback === "lower" && (
                                <Badge variant="destructive" className="gap-1" data-testid={`badge-feedback-${g.playerId}-${g.timestamp}`}>
                                  <ArrowDown className="h-3 w-3" />
                                  Lower
                                </Badge>
                              )}
                              {g.feedback === "correct" && (
                                <Badge className="gap-1 bg-success text-success-foreground" data-testid={`badge-feedback-${g.playerId}-${g.timestamp}`}>
                                  <Check className="h-3 w-3" />
                                  Correct!
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="hidden lg:block w-80">
              <PlayerSidebar />
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden">
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l p-4">
              <PlayerSidebar />
            </div>
          </div>
        )}
      </div>

      {winner && <WinnerModal winner={winner} lobbyId={gameState.lobby.id} />}
    </>
  );
}

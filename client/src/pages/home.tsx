import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useLocation } from "wouter";
import { Users, Trophy, ArrowRight } from "lucide-react";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const { createLobby, joinLobby, gameState, error, clearError } = useWebSocket();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (gameState) {
      if (gameState.lobby.status === "waiting") {
        setLocation("/lobby");
      } else if (gameState.lobby.status === "playing" || gameState.lobby.status === "finished") {
        setLocation("/game");
      }
    }
  }, [gameState, setLocation]);

  const handleCreateLobby = () => {
    if (playerName.trim()) {
      createLobby(playerName.trim());
    }
  };

  const handleJoinLobby = () => {
    if (playerName.trim() && lobbyCode.trim()) {
      joinLobby(lobbyCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            Guess the Number
          </h1>
          <p className="text-muted-foreground">
            Compete with friends to guess the secret number!
          </p>
        </div>

        {mode === "menu" && (
          <div className="space-y-4">
            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all" onClick={() => setMode("create")} data-testid="card-create-lobby">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-heading">Create Lobby</CardTitle>
                  <CardDescription>Start a new game</CardDescription>
                </div>
                <div className="bg-primary/10 p-3 rounded-md">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
            </Card>

            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all" onClick={() => setMode("join")} data-testid="card-join-lobby">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-heading">Join Lobby</CardTitle>
                  <CardDescription>Enter a lobby code</CardDescription>
                </div>
                <div className="bg-secondary/10 p-3 rounded-md">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {mode === "create" && (
          <Card data-testid="card-create-form">
            <CardHeader>
              <CardTitle className="font-heading">Create New Lobby</CardTitle>
              <CardDescription>Enter your name to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Your Name</Label>
                <Input
                  id="create-name"
                  data-testid="input-player-name"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateLobby()}
                  maxLength={30}
                  className="text-lg"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" data-testid="text-error">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode("menu");
                    clearError();
                  }}
                  className="flex-1"
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateLobby}
                  disabled={!playerName.trim()}
                  className="flex-1"
                  data-testid="button-create"
                >
                  Create Lobby
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === "join" && (
          <Card data-testid="card-join-form">
            <CardHeader>
              <CardTitle className="font-heading">Join Lobby</CardTitle>
              <CardDescription>Enter the lobby code and your name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lobby-code">Lobby Code</Label>
                <Input
                  id="lobby-code"
                  data-testid="input-lobby-code"
                  placeholder="6-character code"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-2xl text-center font-heading tracking-wider"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="join-name">Your Name</Label>
                <Input
                  id="join-name"
                  data-testid="input-player-name-join"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinLobby()}
                  maxLength={30}
                  className="text-lg"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" data-testid="text-error">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode("menu");
                    clearError();
                  }}
                  className="flex-1"
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinLobby}
                  disabled={!playerName.trim() || lobbyCode.length !== 6}
                  className="flex-1"
                  data-testid="button-join"
                >
                  Join Lobby
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

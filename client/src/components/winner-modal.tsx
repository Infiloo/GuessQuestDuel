import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import type { Player } from "@shared/schema";

interface WinnerModalProps {
  winner: Player;
  lobbyId: string;
}

export function WinnerModal({ winner, lobbyId }: WinnerModalProps) {
  const [show, setShow] = useState(false);
  const { newRound, gameState } = useWebSocket();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    setShow(true);
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNewRound = () => {
    newRound(lobbyId);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={true}
        numberOfPieces={200}
        gravity={0.3}
      />
      <Card className="w-full max-w-md relative z-10 animate-in zoom-in-95" data-testid="modal-winner">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
            <Trophy className="h-10 w-10 text-success" />
          </div>
          <CardTitle className="font-heading text-4xl mb-2">
            🎉 Winner! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div>
            <p className="text-muted-foreground mb-2">Congratulations to</p>
            <h2 className="font-heading text-3xl font-bold text-success" data-testid="text-winner-name">
              {winner.name}
            </h2>
          </div>
          
          {gameState?.guesses && gameState.guesses.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Winning Number</p>
              <p className="font-heading text-5xl font-bold text-primary" data-testid="text-winning-number">
                {gameState.guesses.find(g => g.feedback === "correct")?.number}
              </p>
            </div>
          )}

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Guesses</p>
            <p className="font-heading text-2xl font-bold" data-testid="text-total-guesses">
              {gameState?.guesses.length || 0}
            </p>
          </div>

          <Button
            onClick={handleNewRound}
            size="lg"
            className="w-full h-12 text-lg font-heading"
            data-testid="button-new-round"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Start New Round
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

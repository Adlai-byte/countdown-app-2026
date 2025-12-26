import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dices,
  Ticket,
  Brain,
  Users,
  MessageCircle,
  Flame,
  Grid3X3,
  Zap,
  ChevronLeft,
  Palette,
  Wine,
  Crown,
  CircleDot,
  Laugh,
  Sparkles,
  Lightbulb,
  Rocket,
  Wifi,
  Circle,
  Type,
} from 'lucide-react';
import { SpinWheel } from '@/components/fun/SpinWheel';
import { ScratchCards } from '@/components/fun/ScratchCards';
import { TriviaGame } from '@/components/fun/TriviaGame';
import { WouldYouRather } from '@/components/fun/WouldYouRather';
import { HotPotato } from '@/components/fun/HotPotato';
import { TruthOrDare } from '@/components/fun/TruthOrDare';
import { Bingo } from '@/components/fun/Bingo';
import { Charades } from '@/components/fun/Charades';
import { ColorGame } from '@/components/fun/ColorGame';
import { NeverHaveIEver } from '@/components/fun/NeverHaveIEver';
import { Kings } from '@/components/fun/Kings';
import { DrinkRoulette } from '@/components/fun/DrinkRoulette';
import { JokeMachine } from '@/components/fun/JokeMachine';
import { FortuneTeller } from '@/components/fun/FortuneTeller';
import { BoredomBuster } from '@/components/fun/BoredomBuster';
import { LiveTrivia } from '@/components/fun/LiveTrivia';
import { SpacePicture } from '@/components/fun/SpacePicture';
import { BalloonPop } from '@/components/fun/BalloonPop';
import { ConfettiText } from '@/components/fun/ConfettiText';
import { Card } from '@/components/ui';

type GameId = 'wheel' | 'scratch' | 'trivia' | 'wyr' | 'hotpotato' | 'truthordare' | 'bingo' | 'charades' | 'colorgame' | 'neverhaveiever' | 'kings' | 'drinkroulette' | 'jokes' | 'fortune' | 'boredom' | 'livetrivia' | 'space' | 'balloonpop' | 'confettitext';

interface GameConfig {
  id: GameId;
  name: string;
  icon: React.ElementType;
  description: string;
  players: string;
  color: string;
}

const soloGames: GameConfig[] = [
  { id: 'wheel', name: 'Spin Wheel', icon: Dices, description: 'Fortune awaits', players: '1', color: 'from-purple to-magenta' },
  { id: 'scratch', name: 'Scratch Cards', icon: Ticket, description: 'Reveal predictions', players: '1', color: 'from-cyan to-blue-500' },
  { id: 'trivia', name: 'Trivia', icon: Brain, description: 'Test your knowledge', players: '1', color: 'from-green-500 to-emerald-600' },
  { id: 'colorgame', name: 'Color Rush', icon: Palette, description: 'Match the colors!', players: '1+', color: 'from-pink-500 to-yellow-500' },
  { id: 'balloonpop', name: 'Balloon Pop', icon: Circle, description: 'Pop them all!', players: '1', color: 'from-red-500 to-pink-500' },
  { id: 'confettitext', name: 'Confetti Text', icon: Type, description: 'Explosive text!', players: '1+', color: 'from-gold to-orange-500' },
];

const partyGames: GameConfig[] = [
  { id: 'charades', name: 'Charades', icon: Users, description: 'Act it out!', players: '2+', color: 'from-orange-500 to-red-500' },
  { id: 'wyr', name: 'Would You Rather', icon: MessageCircle, description: 'Choose wisely', players: '2+', color: 'from-pink-500 to-rose-600' },
  { id: 'hotpotato', name: 'Hot Potato', icon: Flame, description: 'Pass it quick!', players: '3+', color: 'from-red-500 to-orange-600' },
  { id: 'bingo', name: 'NYE Bingo', icon: Grid3X3, description: 'Get 5 in a row', players: '2+', color: 'from-indigo-500 to-purple-600' },
  { id: 'truthordare', name: 'Truth or Dare', icon: Zap, description: 'Party classic', players: '2+', color: 'from-violet-500 to-fuchsia-600' },
];

const drinkingGames: GameConfig[] = [
  { id: 'neverhaveiever', name: 'Never Have I Ever', icon: Wine, description: 'Confess or drink!', players: '2+', color: 'from-purple-600 to-pink-600' },
  { id: 'kings', name: 'Kings', icon: Crown, description: 'The card game', players: '3+', color: 'from-yellow-500 to-amber-600' },
  { id: 'drinkroulette', name: 'Drink Roulette', icon: CircleDot, description: 'Spin to drink!', players: '2+', color: 'from-red-600 to-rose-600' },
];

const liveGames: GameConfig[] = [
  { id: 'jokes', name: 'Joke Machine', icon: Laugh, description: 'Random jokes!', players: '1+', color: 'from-yellow-500 to-orange-500' },
  { id: 'fortune', name: '2026 Fortune', icon: Sparkles, description: 'Your year ahead', players: '1', color: 'from-purple to-pink-500' },
  { id: 'boredom', name: 'Activity Ideas', icon: Lightbulb, description: 'What to do?', players: '1+', color: 'from-cyan to-blue-500' },
  { id: 'livetrivia', name: 'Live Trivia', icon: Brain, description: '1000s of Qs!', players: '1+', color: 'from-green-500 to-teal-500' },
  { id: 'space', name: 'Space Today', icon: Rocket, description: 'NASA daily pic', players: '1+', color: 'from-indigo-500 to-purple-500' },
];

export function FunPage() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const allGames = [...soloGames, ...partyGames, ...drinkingGames, ...liveGames];
  const currentGame = allGames.find((g) => g.id === selectedGame);

  const renderGame = () => {
    switch (selectedGame) {
      case 'wheel':
        return <SpinWheel />;
      case 'scratch':
        return <ScratchCards />;
      case 'trivia':
        return <TriviaGame />;
      case 'wyr':
        return <WouldYouRather />;
      case 'hotpotato':
        return <HotPotato />;
      case 'truthordare':
        return <TruthOrDare />;
      case 'bingo':
        return <Bingo />;
      case 'charades':
        return <Charades />;
      case 'colorgame':
        return <ColorGame />;
      case 'neverhaveiever':
        return <NeverHaveIEver />;
      case 'kings':
        return <Kings />;
      case 'drinkroulette':
        return <DrinkRoulette />;
      case 'jokes':
        return <JokeMachine />;
      case 'fortune':
        return <FortuneTeller />;
      case 'boredom':
        return <BoredomBuster />;
      case 'livetrivia':
        return <LiveTrivia />;
      case 'space':
        return <SpacePicture />;
      case 'balloonpop':
        return <BalloonPop />;
      case 'confettitext':
        return <ConfettiText />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            // Game View
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Back Button & Game Header */}
              <div className="flex items-center gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedGame(null)}
                  className="p-2 rounded-full bg-surface-elevated hover:bg-border/50 transition-colors"
                >
                  <ChevronLeft size={24} className="text-text-secondary" />
                </motion.button>
                <div className="flex items-center gap-3">
                  {currentGame && (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentGame.color} flex items-center justify-center`}>
                      <currentGame.icon size={20} className="text-white" />
                    </div>
                  )}
                  <div>
                    <h1
                      className="text-xl font-bold text-text-primary"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {currentGame?.name}
                    </h1>
                    <p className="text-sm text-text-muted">{currentGame?.players} players</p>
                  </div>
                </div>
              </div>

              {/* Game Content */}
              {renderGame()}
            </motion.div>
          ) : (
            // Game Selection View
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center"
              >
                <h1
                  className="text-2xl font-bold text-text-primary"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Fun Zone
                </h1>
                <p className="text-text-secondary">
                  Games for every party!
                </p>
              </motion.div>

              {/* Solo Games Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                  <span>SOLO GAMES</span>
                  <span className="text-xs text-text-muted/60">(1 player)</span>
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {soloGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={() => setSelectedGame(game.id)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Party Games Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                  <Users size={16} />
                  <span>PARTY GAMES</span>
                  <span className="text-xs text-text-muted/60">(2+ players)</span>
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {partyGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={() => setSelectedGame(game.id)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Drinking Games Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                  <Wine size={16} />
                  <span>DRINKING GAMES</span>
                  <span className="text-xs text-text-muted/60">(21+)</span>
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {drinkingGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={() => setSelectedGame(game.id)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Live API Games Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                  <Wifi size={16} />
                  <span>LIVE API GAMES</span>
                  <span className="text-xs text-text-muted/60">(internet)</span>
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {liveGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={() => setSelectedGame(game.id)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Card variant="glass" className="p-4 text-center">
                  <p className="text-sm text-text-muted">
                    Party games are best played together - gather your friends and family!
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface GameCardProps {
  game: GameConfig;
  onClick: () => void;
}

function GameCard({ game, onClick }: GameCardProps) {
  const Icon = game.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center p-4 rounded-2xl bg-surface-elevated hover:bg-border/30 transition-all"
    >
      {/* Icon with gradient background */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-2 shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>

      {/* Name */}
      <span className="text-xs font-medium text-text-primary text-center leading-tight">
        {game.name}
      </span>

      {/* Player count badge */}
      <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 text-white">
        {game.players}
      </span>
    </motion.button>
  );
}

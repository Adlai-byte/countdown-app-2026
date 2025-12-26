import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laugh, RefreshCw, Share2, Copy, Check } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { fetchRandomJoke, fetchDadJoke, type Joke, type DadJoke } from '@/services/partyApi';

type JokeType = 'random' | 'dad';

interface DisplayJoke {
  setup?: string;
  punchline: string;
  type: JokeType;
}

export function JokeMachine() {
  const [joke, setJoke] = useState<DisplayJoke | null>(null);
  const [showPunchline, setShowPunchline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jokeType, setJokeType] = useState<JokeType>('random');

  const getJoke = async () => {
    setLoading(true);
    setShowPunchline(false);
    setCopied(false);

    try {
      if (jokeType === 'dad') {
        const dadJoke: DadJoke = await fetchDadJoke();
        setJoke({
          punchline: dadJoke.joke,
          type: 'dad',
        });
        setShowPunchline(true);
      } else {
        const randomJoke: Joke = await fetchRandomJoke();
        setJoke({
          setup: randomJoke.setup,
          punchline: randomJoke.punchline,
          type: 'random',
        });
      }
    } catch {
      setJoke({
        punchline: "Why did the API fail? Because it couldn't handle your awesomeness! 🎉",
        type: 'random',
      });
      setShowPunchline(true);
    } finally {
      setLoading(false);
    }
  };

  const copyJoke = async () => {
    if (!joke) return;
    const text = joke.setup ? `${joke.setup}\n\n${joke.punchline}` : joke.punchline;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareJoke = async () => {
    if (!joke) return;
    const text = joke.setup ? `${joke.setup}\n\n${joke.punchline}` : joke.punchline;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Party Joke',
          text: text,
        });
      } catch {
        copyJoke();
      }
    } else {
      copyJoke();
    }
  };

  return (
    <div className="space-y-4">
      {/* Joke Type Selector */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setJokeType('random')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            jokeType === 'random'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
          }`}
        >
          😂 Random
        </button>
        <button
          onClick={() => setJokeType('dad')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            jokeType === 'dad'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
          }`}
        >
          👨 Dad Jokes
        </button>
      </div>

      {/* Joke Display */}
      <Card variant="glass" className="p-6 min-h-[200px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!joke ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-text-secondary">
                Press the button to get a joke!
              </p>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-5xl inline-block"
              >
                🎲
              </motion.div>
              <p className="text-text-secondary mt-4">Finding a funny one...</p>
            </motion.div>
          ) : (
            <motion.div
              key="joke"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {joke.setup && (
                <p className="text-lg text-text-primary mb-4">{joke.setup}</p>
              )}

              <AnimatePresence>
                {showPunchline ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <p className="text-xl font-bold text-gold">{joke.punchline}</p>
                    <div className="text-4xl">😂</div>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPunchline(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple to-magenta rounded-xl text-white font-medium"
                  >
                    Reveal Punchline! 👀
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={getJoke}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <RefreshCw size={18} className="mr-2 animate-spin" />
          ) : (
            <Laugh size={18} className="mr-2" />
          )}
          {joke ? 'Next Joke' : 'Get Joke'}
        </Button>

        {joke && showPunchline && (
          <>
            <Button variant="secondary" onClick={shareJoke}>
              <Share2 size={18} />
            </Button>
            <Button variant="secondary" onClick={copyJoke}>
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </Button>
          </>
        )}
      </div>

      {/* Fun Counter */}
      <Card variant="glass" className="p-3 text-center">
        <p className="text-xs text-text-muted">
          Powered by Official Joke API & icanhazdadjoke
        </p>
      </Card>
    </div>
  );
}

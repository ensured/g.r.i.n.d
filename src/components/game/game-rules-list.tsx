import { Crown } from "lucide-react";

interface GameRulesListProps {
  className?: string;
}

export function GameRulesList({ className = "" }: GameRulesListProps) {
  const gameRules = [
    {
      text: "The leader gets maximum 3 consecutive successful trick lands before the next leader is selected",
      icon: <Crown className="h-4 w-4 text-amber-500 dark:text-amber-400 mx-0.5" />,
      highlight: "leader",
      addSpaceAfterHighlight: true
    },
    {
      text: "Spell G.R.I.N.D and you're out!",
      highlight: "G.R.I.N.D",
      addSpaceAfterHighlight: true
    },
    {
      icon: <Crown className="h-4 w-4 text-amber-500 dark:text-amber-400 mx-0.5" />,
      text: "The leader chooses the location — you deliver the trick or face elimination",
      highlight: "leader",
      addSpaceAfterHighlight: true
    }
  ]
  return (
    <div className={`space-y-4 ${className}`}>
      {gameRules.map((rule, index) => (
        <div key={index} className="relative flex items-start gap-4 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex-shrink-0 mt-1">
            <div className="relative">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
              {rule.text.split(' ').map((word, wordIndex) => {
                const isHighlight = rule.highlight && word.toLowerCase().includes(rule.highlight.toLowerCase());
                const isGrind = word === 'G.R.I.N.D';

                if (isGrind) {
                  return (
                    <span key={wordIndex} className="inline-flex items-center">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-md tracking-wider shadow-sm">
                        {word}
                      </span>
                      <span className="w-1.5"></span>
                    </span>
                  );
                }

                if (isHighlight && rule.icon) {
                  return (
                    <span key={wordIndex} className="inline-flex items-center">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {word}
                      </span>
                      {rule.icon}
                      <span> </span>
                    </span>
                  );
                }

                return <span key={wordIndex}>{word} </span>;
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

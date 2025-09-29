import { Crown, Users, Award, Clock } from "lucide-react";

interface GameRulesListProps {
  className?: string;
}

export function GameRulesList({ className = "" }: GameRulesListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Crown className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
        <div>
          <h4 className="font-medium text-foreground">Leader</h4>
          <p className="text-muted-foreground">Draw a card and perform the trick. If successful, others must follow. 3 successful tricks pass leadership.</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
        <div>
          <h4 className="font-medium text-foreground">Follower</h4>
          <p className="text-muted-foreground">Attempt the leader&apos;s trick. Succeed to stay safe, fail to get a letter.</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Award className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
        <div>
          <h4 className="font-medium text-foreground">Winner</h4>
          <p className="text-muted-foreground">Be the last player standing by avoiding all 5 letters in &ldquo;G.R.I.N.D&rdquo;</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
        <div>
          <h4 className="font-medium text-foreground">Quick Tips</h4>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Leaders: Choose tricks you can consistently perform</li>
            <li>Followers: Watch the leader carefully and focus on accuracy</li>
            <li>Everyone: Stay engaged and have fun!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

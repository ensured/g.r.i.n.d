import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GameRulesList } from "@/components/game/game-rules-list";

const RulesPage = () => {

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Game Rules
                    </h1>
                    <p className="text-lg">
                        Learn how to play G.R.I.N.D and become the ultimate skater
                    </p>
                </div>

                <div className="space-y-8">
                    <GameRulesList />

                    <div className="mt-12 text-center">
                        <Button asChild size="lg">
                            <Link href="/">
                                Start Playing
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RulesPage
import { trickCards } from "@/types/tricks";
import { difficultyColors } from "@/types/tricks";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

const difficultyOrder = {
    "Beginner": 1,
    "Intermediate": 2,
    "Advanced": 3,
    "Pro": 4,
} as const;

function TrickDescription({ description }: { description: string }) {
    // This component will show the full description in a dialog on mobile
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 ml-2 hover:bg-transparent"
                    aria-label="View description"
                >
                    <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Description</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>{description}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function TricksPage() {
    // Sort tricks by difficulty and then by points
    const sortedTricks = [...trickCards].sort((a, b) => {
        if (difficultyOrder[a.difficulty] !== difficultyOrder[b.difficulty]) {
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        return b.points - a.points;
    });

    return (
        <div className="container mx-auto px-4 py-8 ">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2">Skateboard Tricks</h1>
                <p className="text-muted-foreground">
                    Browse all ({sortedTricks.length}) available tricks and their point values
                </p>
            </div>

            <div className="rounded-md border border-primary/20">
                <Table className="">
                    <TableHeader>
                        <TableRow className="!border-primary/60">
                            <TableHead className="w-[200px]">Trick</TableHead>
                            <TableHead className="w-[120px] text-center">Difficulty</TableHead>
                            <TableHead className="w-[100px] text-right">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTricks.map((trick) => {
                            const { bg, text } = difficultyColors[trick.difficulty];
                            return (
                                <TableRow key={trick.id} className="hover:bg-accent !border-border">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <span className="hidden sm:inline">
                                                {trick.name}
                                            </span>
                                            <span className="sm:hidden">
                                                {trick.name.length > 15
                                                    ? `${trick.name.substring(0, 12)}...`
                                                    : trick.name}
                                            </span>
                                            <TrickDescription description={trick.description} />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <Badge
                                                className={`${bg} ${text} hover:${bg} hover:opacity-90`}
                                                variant="secondary"
                                            >
                                                {trick.difficulty}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {trick.points} pts
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    {/* <TableCaption className="py-6">
                        Showing {sortedTricks.length} tricks in total
                    </TableCaption> */}
                </Table>
            </div>
        </div>
    );
}

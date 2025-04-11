"use client";

import {
  Card as CardType,
  CardThumbnail as CardThumbnailType,
  CardClosed,
} from "@/lib/types/card";
import EasyCard from "@/assets/cards/easy.svg";
import MediumCard from "@/assets/cards/medium.svg";
import HardCard from "@/assets/cards/hard.svg";

import EasyModal from "@/assets/modals/easy.svg";
import MediumModal from "@/assets/modals/medium.svg";
import HardModal from "@/assets/modals/hard.svg";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Check, X } from "lucide-react";

export function CardThumbnail({
  card,
  hoverable = false,
}: {
  card: CardThumbnailType;
  hoverable?: boolean;
}) {
  const BackgroundSvg =
    card.level === 1 ? EasyCard : card.level === 2 ? MediumCard : HardCard;

  const hoverRotation = Math.random() * 10 - 5;

  return (
    <div className="cursor-pointer">
      <motion.div
        className="relative shrink-0 grow-0 my-0 -mx-4"
        whileHover={
          hoverable
            ? {
                scale: 1.05,
                rotate: hoverRotation,
                transition: { duration: 0.3 },
              }
            : {}
        }
      >
        <img
          src={BackgroundSvg.src}
          alt="card background"
          width={200}
          height={350}
        />
        <div
          className={cn(
            "absolute inset-0 p-8 text-center text-balance flex flex-col items-center justify-center",
            card.level === 3 && "text-danger"
          )}
        >
          {card.thumbnail}
        </div>

        {/* Subject indicator */}
        {card.subject && (
          <div className="absolute top-3 right-3 bg-black/40 px-2 py-0.5 rounded-md text-xs font-medium text-white rotate-3">
            {card.subject}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function Card({ card }: { card: CardType }) {
  const BackgroundSvg =
    card.level === 1 ? EasyModal : card.level === 2 ? MediumModal : HardModal;
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <CardThumbnail hoverable card={card} />
        </div>
      </DialogTrigger>
      <DialogContent className="border-none bg-transparent shadow-none w-fit h-fit max-w-none! max-h-none! p-0">
        <img
          src={BackgroundSvg.src}
          alt="card background"
          className="w-200 max-w-[100vw]! rotate-90 md:rotate-0"
        />
        <DialogTitle className="sr-only">{card.question}</DialogTitle>
        <div className="fixed inset-0 overflow-y-auto md:flex flex-col items-center justify-center">
          <div className="p-8 space-y-4 px-20 md:px-8">
            <h1 className="text-lg md:text-2xl font-bold text-black/70 text-center">
              {card.question}
            </h1>

            <Collapsible
              open={isAnswerOpen}
              onOpenChange={setIsAnswerOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <button className="bg-black/20 flex items-center gap-2 p-2 rounded-lg w-fit  border border-black/20">
                  <span>Reveal Answer</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isAnswerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="rounded-lg bg-black/15 p-4 border border-black/15">
                  <p className="text-center md:text-lg font-medium bg-black/15 p-2 rounded-lg w-fit mx-auto mb-4">
                    {card.answers[card.correctAnswer]}
                  </p>
                  <p>{card.explanation}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PlayableCard({
  card,
  onAnswer,
  disabled = false,
}: {
  card: CardClosed;
  onAnswer: (cardId: string, answerIndex: number) => Promise<boolean>;
  disabled?: boolean;
}) {
  const BackgroundSvg =
    card.level === 1 ? EasyModal : card.level === 2 ? MediumModal : HardModal;
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAnswerClick = (index: number) => {
    if (isSubmitting || isCorrect !== null) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      const result = await onAnswer(card.id, selectedAnswer);
      setIsCorrect(result);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          <CardThumbnail hoverable card={card} />
        </div>
      </DialogTrigger>
      <DialogContent className="border-none bg-transparent shadow-none w-fit h-fit max-w-none! max-h-none! p-0">
        <img
          src={BackgroundSvg.src}
          alt="card background"
          className="w-200 max-w-[100vw]! rotate-90 md:rotate-0"
        />
        <DialogTitle className="sr-only">{card.question}</DialogTitle>
        <div className="fixed inset-0 overflow-y-auto md:flex flex-col items-center justify-center">
          <div className="p-8 space-y-4 px-10 md:px-8">
            <h1 className="text-lg md:text-2xl font-bold text-black/70 text-center mb-6">
              {card.question}
            </h1>

            <div className="grid grid-cols-2 gap-3">
              {card.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={isSubmitting || isCorrect !== null || disabled}
                  className={cn(
                    "p-3 text-center rounded-lg border-4 transition-colors h-full flex items-center justify-center",
                    selectedAnswer === index
                      ? "border-primary bg-primary/50"
                      : "bg-black/5 border-black/10 hover:border-black/15 hover:bg-black/10",
                    isCorrect !== null &&
                      selectedAnswer === index &&
                      (isCorrect
                        ? "border-green-500 bg-green-400/50"
                        : "border-red-500 bg-red-500/50")
                  )}
                >
                  <span className="text-sm md:text-base">{answer}</span>
                </button>
              ))}
            </div>

            {isCorrect === null ? (
              <Button
                onClick={handleSubmit}
                size="xl"
                disabled={selectedAnswer === null || isSubmitting || disabled}
                className="w-full mt-6"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            ) : (
              <div
                className={cn(
                  "rounded-lg p-4 mt-6 flex items-center justify-between",
                  isCorrect
                    ? "bg-green-400/50 border-4 border-green-500"
                    : "bg-red-500/50 border-4 border-red-500"
                )}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                  <span>
                    {isCorrect
                      ? "Correct! Card added to your collection."
                      : "Incorrect! Card not added."}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

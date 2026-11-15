import {retainedTranscript} from './policy.mjs';
import {selectionInstructions, selectionReviewInstructions, selectionSchema, selectionPlan, selectedWords, deliveryWarnings} from './selection.mjs';

// Shared by the shipping endpoint and offline provider comparisons. No retries.
/** @param {(stage: string) => void} [onStage] */
export async function runSelection(words, analyze, onStage = () => {}) {
    onStage("editorial");
    // Exact timing stays authoritative in validation/native cutting. Sending
    // two full-precision timestamps for every word wastes the director's input
    // budget; sparse pause hints give it the useful delivery context instead.
    const inputWords = words.map(({id,clip,start,text,speaker}, index)=> {
      const previous = words[index - 1];
      const gap = previous?.clip === clip ? start - previous.end : 0;
      return {id,clip,text,...(speaker==null?{}:{speaker}),
        ...(gap >= 0.65 ? {pauseBefore:Math.round(gap * 100) / 100} : {})};
    });
    const sources = [];
    for (const word of words) {
      if (sources.at(-1)?.clip !== word.clip) sources.push({clip:word.clip,firstWord:word.id,lastWord:word.id});
      else sources.at(-1).lastWord = word.id;
    }
    // One virtual stitched recording, with stable source IDs for lossless mapping.
    // Avoid rendering/re-encoding/uploading a stitched video just for reasoning.
    const recording = {mode:'one_continuous_recording', sources, words:inputWords};
    const selection = await analyze(selectionInstructions, recording, selectionSchema, 5000, 65000);
    const draft = selectionPlan(selection, words);
    onStage("delivery_review");
    let final = await analyze(selectionReviewInstructions,
      {...recording, proposedKeeps: selection.keeps, retainedWords: selectedWords(draft, inputWords),
       retainedTranscript: retainedTranscript(draft, words), deliveryWarnings: deliveryWarnings(draft, words)}, selectionSchema, 5000, 65000);
    let plan = selectionPlan(final, words);
    const remaining = deliveryWarnings(plan, words).filter(warning=>warning.repair);
    if (remaining.length) {
      onStage("correction_review");
      final = await analyze(selectionReviewInstructions,
        {...recording, proposedKeeps: final.keeps, retainedWords: selectedWords(plan, inputWords),
         retainedTranscript: retainedTranscript(plan, words), deliveryWarnings: remaining}, selectionSchema, 5000, 25000);
      plan = selectionPlan(final, words);
      if (deliveryWarnings(plan, words).some(warning=>warning.repair)) throw new Error("Unresolved correction prefix");
    }
    return plan;
}

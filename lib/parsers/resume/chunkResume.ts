import { OpenAI } from "openai";
import { updateChunks } from "./updateChunks";
import { generateChunks } from "./generateChunks";

export const chunkResume = async (
  text: string,
  name: string,
  chunkTexts: string[],
  openai: OpenAI
) => {
  const chunksText = chunkTexts.join("\n\n");

  if (chunkTexts.length != 0) {
    const updatedChunks = await updateChunks(text, chunksText, openai);
  }
  const generatedChunks = await generateChunks(chunksText, openai);

  return generatedChunks;
};

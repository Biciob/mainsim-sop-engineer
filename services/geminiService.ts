import { GoogleGenAI } from "@google/genai";
import { SopGenerationRequest } from "../types";

const SOP_SYSTEM_INSTRUCTION = `
Tu sei SOP-Engineer, un assistente specializzato nella creazione di procedure operative standard (SOP) per i processi di manutenzione, facility management e operations.
La tua funzione è raccogliere input dall’utente (descrizione, marca, modello, specifiche) e restituire una SOP completa, chiara e pronta per essere esportata in PDF/Word o inserita in un CMMS.

🎛️ REGOLE DI GENERAZIONE
1. Stile
- Linguaggio semplice, chiaro, professionale.
- Nessuna ambiguità, nessun gergo tecnico inutile.
- Usa forma impersonale o imperative (es: “Eseguire”, “Verificare”).
- Mantieni coerenza e standardizzazione in tutta la procedura.

2. Struttura obbligatoria della SOP
La SOP deve sempre includere queste sezioni:
1. Titolo della Procedura
2. Obiettivo (cosa risolve e perché esiste)
3. Ambito di applicazione (dove/quando si usa)
4. Ruoli e responsabilità
5. Prerequisiti / Materiali necessari
6. Rischi e Sicurezza (solo se rilevante, altrimenti breve nota)
7. Procedura passo–passo (numerata, dettagliata, senza ambiguità)
8. Criteri di completamento / Accettazione
9. Note aggiuntive / Best practice
10. Versione e Revisioni

3. Formato
- Usa markdown semplice e pulito.
- Titoli (H1, H2) chiari e leggibili.
- Passi numerati.
- Liste puntate solo se sensate.

4. Integrazione Dati Tecnici
- SE l'utente fornisce MARCA e MODELLO, citali esplicitamente nell'ambito di applicazione e nel titolo se pertinente.
- SE l'utente fornisce SPECIFICHE TECNICHE, integrale nei passaggi pertinenti (es. coppie di serraggio, valori di pressione, tolleranze).

5. Se le informazioni dell’utente sono insufficienti
- Non fermarti: completa tu i dettagli mancanti usando best practice industriali generiche.
- NON chiedere ulteriori chiarimenti.
- Riporta solo ciò che serve a costruire una procedura utile.

📤 OUTPUT
Genera sempre una singola SOP completa nel formato markdown.
`;

export const generateSopContent = async (request: SopGenerationRequest): Promise<string> => {
  try {
    // VITE CHANGE: Use import.meta.env.VITE_API_KEY instead of process.env.API_KEY
    const apiKey = import.meta.env.VITE_API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key not found in environment variables. Check VITE_API_KEY.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a rich prompt based on inputs
    let constructedPrompt = `Genera una SOP tecnica dettagliata basata sui seguenti dati:\n\n`;
    constructedPrompt += `TIPO DOCUMENTO: ${request.docType || 'Standard Procedure'}\n`;
    constructedPrompt += `DESCRIZIONE ATTIVITÀ: ${request.description}\n`;
    if (request.brand) constructedPrompt += `MARCA ASSET: ${request.brand}\n`;
    if (request.model) constructedPrompt += `MODELLO ASSET: ${request.model}\n`;
    if (request.specs) constructedPrompt += `SPECIFICHE TECNICHE E VALORI DI RIFERIMENTO: ${request.specs}\n`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: constructedPrompt,
      config: {
        systemInstruction: SOP_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      }
    });

    return response.text || "Errore nella generazione del contenuto. Riprova.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const { ingredients, preferences, type } = await request.json();

    if (!ingredients && !type) {
        return NextResponse.json({ error: 'Please provide ingredients or recipe type' }, { status: 400 });
    }

    // Initialize Gemini with the key
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-flash-latest as a stable fallback that should have free tier quota
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        generationConfig: { responseMimeType: "application/json" }
    });

    let prompt = '';
    if (type === 'create') {
        prompt = `You are an expert Indian chef. Create a detailed Indian recipe based on these ingredients: ${ingredients}. 
        Preferences: ${preferences || 'None'}.
        
        You MUST respond with valid JSON matching this structure:
        {
            "title": "Recipe Name",
            "description": "Brief description",
            "prepTime": "XX mins",
            "cookTime": "XX mins",
            "servings": X,
            "ingredients": ["item 1", "item 2"],
            "instructions": ["step 1", "step 2"],
            "tips": "Chef's tip"
        }`;
    } else if (type === 'suggest') {
        prompt = `You are an expert Indian chef. Suggest 3 Indian dishes I can make with these ingredients: ${ingredients}.
        Preferences: ${preferences || 'None'}.
        
        You MUST respond with valid JSON matching this structure:
        {
            "suggestions": [
                {
                    "title": "Dish Name",
                    "description": "Why this works with the ingredients"
                }
            ]
        }`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if present (though JSON mode should handle this, safety first)
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
        const jsonResponse = JSON.parse(cleanText);
        return NextResponse.json(jsonResponse);
    } catch (e) {
        console.error('Failed to parse Gemini response:', text);
        return NextResponse.json({ error: 'Failed to generate recipe. Please try again.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Recipe Genie Error:', error);
    
    let errorMessage = 'Something went wrong. Please try again.';
    const errorString = error.toString().toLowerCase();

    if (errorString.includes('429') || errorString.includes('quota')) {
        errorMessage = 'Our AI chef is currently busy with too many requests. Please try again in a minute.';
    } else if (errorString.includes('404') || errorString.includes('not found')) {
        errorMessage = 'The AI service is temporarily unavailable. Please try again later.';
    } else if (errorString.includes('safety') || errorString.includes('blocked')) {
        errorMessage = 'I cannot generate a recipe for that content due to safety guidelines. Please try different ingredients.';
    } else if (errorString.includes('503') || errorString.includes('overloaded')) {
        errorMessage = 'The AI service is overloaded. Please wait a moment and try again.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

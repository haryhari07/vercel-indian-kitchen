
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'data', 'recipes.ts');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already updated to avoid duplication
  if (content.includes('rating: 5')) {
    console.log('File already contains ratings.');
  } else {
    // Add rating and reviewCount before dietary field
    // Matching "dietary: [" and adding fields before it
    const updatedContent = content.replace(
      /dietary: \[/g, 
      'rating: 5,\n    reviewCount: 10,\n    dietary: ['
    );
    
    fs.writeFileSync(filePath, updatedContent);
    console.log('Successfully added rating fields to recipes.');
  }
} catch (error) {
  console.error('Error updating recipes:', error);
}

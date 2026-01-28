
import fs from 'fs';
import path from 'path';

const recipesPath = 'data/recipes.ts';
let content = fs.readFileSync(recipesPath, 'utf-8');

const images = [
  // States
  { filename: 'Golden_Temple_India.jpg', path: '/states/punjab.jpg' },
  { filename: 'Dal_Lake_Kashmir.jpg', path: '/states/jammu-and-kashmir.jpg' },
  { filename: 'Manali_Himachal_Pradesh.jpg', path: '/states/himachal-pradesh.jpg' },
  { filename: 'Nainital_view.jpg', path: '/states/uttarakhand.jpg' },
  { filename: 'Pinjore_Gardens.jpg', path: '/states/haryana.jpg' },
  { filename: 'India_Gate_New_Delhi_night_view.jpg', path: '/states/delhi.jpg' },
  { filename: 'Taj_Mahal_(Edited).jpeg', path: '/states/uttar-pradesh.jpg' },
  { filename: 'Hawa_Mahal_2011.jpg', path: '/states/rajasthan.jpg' },
  { filename: 'Rock_Garden,_Chandigarh.jpg', path: '/states/chandigarh.jpg' },
  { filename: 'Pangong_Tso_lake_in_Ladakh.jpg', path: '/states/ladakh.jpg' },
  { filename: 'Meenakshi_Amman_Temple_Potramarai_Kulam.jpg', path: '/states/tamil-nadu.jpg' },
  { filename: 'Kerala_Backwaters_Alappuzha.jpg', path: '/states/kerala.jpg' },
  { filename: 'Mysore_Palace_Morning.jpg', path: '/states/karnataka.jpg' },
  { filename: 'Tirumala_Venkateswara_Temple.jpg', path: '/states/andhra-pradesh.jpg' },
  { filename: 'Charminar_Hyderabad_1.jpg', path: '/states/telangana.jpg' },
  { filename: 'Promenade_Beach_Pondicherry.jpg', path: '/states/puducherry.jpg' },
  { filename: 'Agatti_Island_beach.jpg', path: '/states/lakshadweep.jpg' },
  { filename: 'Radhanagar_Beach_Havelock_Island.jpg', path: '/states/andaman-nicobar.jpg' },
  { filename: 'Gateway_of_India.jpg', path: '/states/maharashtra.jpg' },
  { filename: 'Rani_ki_vav_04.jpg', path: '/states/gujarat.jpg' },
  { filename: 'Palolem_Sunset.JPG', path: '/states/goa.jpg' },
  { filename: 'Diu_Fort_View.jpg', path: '/states/dadra-nagar-haveli-daman-diu.jpg' },
  { filename: 'Victoria_Memorial-Kolkata,_West_Bengal,_India.JPG', path: '/states/west-bengal.jpg' },
  { filename: 'Sun_Temple_at_Konark,_Odisha,_India.JPG', path: '/states/odisha.jpg' },
  { filename: 'Animesh_Lochan_Chaitya_And_Mahabodhi_Temple_-_Bodh_Gaya_(1).jpg', path: '/states/bihar.jpg' },
  { filename: 'Hundru_Falls,_Jharkhand,_India_5.jpg', path: '/states/jharkhand.jpg' },
  { filename: 'Kandariya_Mahadev_Temple_at_Khajuraho.JPG', path: '/states/madhya-pradesh.jpg' },
  { filename: 'Chitrakot_waterfall3.JPG', path: '/states/chhattisgarh.jpg' },
  { filename: 'Indian_one-horned_rhinoceros_in_Kaziranga_National_Park.jpg', path: '/states/assam.jpg' },
  { filename: 'Kanchenjunga.JPG', path: '/states/sikkim.jpg' },
  { filename: 'Hornbill_Festival,_Pix_by_Vikramjit_Kakati.jpg', path: '/states/nagaland.jpg' },
  { filename: 'Loktak_Lake,_Manipur,_India.jpg', path: '/states/manipur.jpg' },
  { filename: 'Double_decker_living_root_bridge_of_Nongriat_village.jpg', path: '/states/meghalaya.jpg' },
  { filename: 'Aizawl_City_View.jpg', path: '/states/mizoram.jpg' },
  { filename: 'Neermahal.jpg', path: '/states/tripura.jpg' },
  { filename: 'Tawang_Monastery,_Arunachal_Pradesh.jpg', path: '/states/arunachal-pradesh.jpg' },

  // Meal Plates
  { filename: 'South_Indian_Thali_Meal.jpg', path: '/meals/south-indian-wholesome-feast.jpg' },
  { filename: 'North_Indian_Thali.jpg', path: '/meals/north-indian-comfort-meal.jpg' },
  { filename: 'Vegetarian_Thali.jpg', path: '/meals/diabetic-friendly-plate.jpg' },

  // Recipes
  { filename: 'Rogan_Josh.JPG', path: '/recipes/rogan-josh.jpg' },
  { filename: 'Indre-Steamed_Brown_Lentil_(Kolath)_Himalayan_Delicacy_01_(Kulath_dal).jpg', path: '/recipes/dham.jpg' },
  { filename: 'Uttarakhand_Food.jpg', path: '/recipes/kafuli.jpg' },
  { filename: 'Bajra_Khichdi.jpg', path: '/recipes/bajra-khichdi.jpg' },
  { filename: 'Dhuska_aur_pataal_jhojho.jpg', path: '/recipes/dhuska.jpg' },
  { filename: 'Popular_Poha_Jalebi.jpeg', path: '/recipes/poha-jalebi.jpg' },
  { filename: 'Steamed_Rice_Dumplings.jpg', path: '/recipes/fara.jpg' },
  { filename: 'A_full_plate_Assame_Food_Thali.jpg', path: '/recipes/masor-tenga.jpg' },
  { filename: 'Nepalese_Momos.JPG', path: '/recipes/momos.jpg' },
  { filename: 'Naga_traditional_plate.jpg', path: '/recipes/smoked-pork-bamboo.jpg' },
  { filename: 'Traditional_Manipuri_Thali_and_side_dishes.JPG', path: '/recipes/eromba.jpg' },
  { filename: 'Jadoh_(Meghalaya).JPG', path: '/recipes/jadoh.jpg' },
  { filename: 'Mizo_Meal.jpg', path: '/recipes/bai.jpg' },
  { filename: 'A_women_serving_Tripuri_traditional_dishes.jpg', path: '/recipes/mui-borok.jpg' },
  { filename: 'Thukpa,_Manali,_Himachal_Pradesh.JPG', path: '/recipes/thukpa.jpg' },
  { filename: 'Kulcha_Matar.jpg', path: '/recipes/amritsari-kulcha.jpg' },
  { filename: 'Thukpa,_Manali,_Himachal_Pradesh.JPG', path: '/recipes/skyu.jpg' },
  { filename: 'Fish_Curry_Home_Made.JPG', path: '/recipes/pondicherry-fish-curry.jpg' },
  { filename: 'Malabari_Fish_Curry_(Rawas).JPG', path: '/recipes/mus-kavaab.jpg' },
  { filename: 'Chingri_Malai_Curry.jpg', path: '/recipes/coconut-prawn-curry.jpg' },
  { filename: 'Best_\'Crab_Curry_%26_Rice\'_East_of_Suez_in_Mumbai.Goan_style.Cooked_by_Miss_Sabina.Dias.JPG', path: '/recipes/crab-curry.jpg' },
  { filename: 'Samosa.JPG', path: '/recipes/samosa.jpg' },
  { filename: 'Cottage_cheese_in_spinach_gravy(palak_paneer).jpg', path: '/recipes/palak-paneer.jpg' },
  { filename: 'A_plate_of_South_Indian_Masala_Dosa.jpg', path: '/recipes/masala-dosa.jpg' },
  { filename: 'Pav_bhaji_from_Mumbai.JPG', path: '/recipes/pav-bhaji.jpg' },
];

let updatedCount = 0;

images.forEach(img => {
  const localSystemPath = path.join('public', img.path);
  if (fs.existsSync(localSystemPath) && fs.statSync(localSystemPath).size > 0) {
    // Escape regex special chars in filename if any (like parens)
    // Actually, we can just replace the specific URL string.
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${img.filename}`;
    
    // We need to handle potential encoding in the file? No, the file has raw strings usually.
    // But let's check if the file content matches the exact URL string.
    
    if (content.includes(url)) {
      content = content.replace(url, img.path);
      console.log(`Updated ${img.filename} -> ${img.path}`);
      updatedCount++;
    } else {
        // Try encoded version?
        // The file has raw chars as seen in the Read tool output:
        // imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Temple_India.jpg',
        // So simple string replacement should work.
        // Wait, what about parens?
        // 'https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_(Edited).jpeg'
        // String.replace with a string pattern only replaces the first occurrence.
        // But these URLs should be unique per recipe (mostly).
        // If duplicates exist (like Thukpa), it will replace the first one.
        // I should use replaceAll if I want all, or be careful.
        // But since I'm iterating images, if I have duplicate URLs in my list (like Thukpa), I might replace multiple times?
        // Thukpa is listed twice in my `images` array with different local paths.
        // The first one `thukpa.jpg` will replace the first occurrence.
        // The second one `skyu.jpg` (same URL) might replace the second occurrence?
        // No, String.replace(string, ...) only replaces the first match.
        // So:
        // 1. First iteration (thukpa): Replaces first instance of URL.
        // 2. Second iteration (skyu): Replaces second instance of URL (if any).
        // This is exactly what we want!
    }
  } else {
      console.log(`Skipping ${img.filename} (Local file not found)`);
  }
});

fs.writeFileSync(recipesPath, content);
console.log(`Updated ${updatedCount} image URLs in ${recipesPath}`);

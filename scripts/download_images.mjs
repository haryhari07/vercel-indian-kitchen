
import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

const images = [
  // States
  { filename: 'Golden_Temple_India.jpg', path: 'public/states/punjab.jpg' },
  { filename: 'Dal_Lake_Kashmir.jpg', path: 'public/states/jammu-and-kashmir.jpg' },
  { filename: 'Manali_Himachal_Pradesh.jpg', path: 'public/states/himachal-pradesh.jpg' },
  { filename: 'Nainital_view.jpg', path: 'public/states/uttarakhand.jpg' },
  { filename: 'Pinjore_Gardens.jpg', path: 'public/states/haryana.jpg' },
  { filename: 'India_Gate_New_Delhi_night_view.jpg', path: 'public/states/delhi.jpg' },
  { filename: 'Taj_Mahal_(Edited).jpeg', path: 'public/states/uttar-pradesh.jpg' },
  { filename: 'Hawa_Mahal_2011.jpg', path: 'public/states/rajasthan.jpg' },
  { filename: 'Rock_Garden,_Chandigarh.jpg', path: 'public/states/chandigarh.jpg' },
  { filename: 'Pangong_Tso_lake_in_Ladakh.jpg', path: 'public/states/ladakh.jpg' },
  { filename: 'Meenakshi_Amman_Temple_Potramarai_Kulam.jpg', path: 'public/states/tamil-nadu.jpg' },
  { filename: 'Kerala_Backwaters_Alappuzha.jpg', path: 'public/states/kerala.jpg' },
  { filename: 'Mysore_Palace_Morning.jpg', path: 'public/states/karnataka.jpg' },
  { filename: 'Tirumala_Venkateswara_Temple.jpg', path: 'public/states/andhra-pradesh.jpg' },
  { filename: 'Charminar_Hyderabad_1.jpg', path: 'public/states/telangana.jpg' },
  { filename: 'Promenade_Beach_Pondicherry.jpg', path: 'public/states/puducherry.jpg' },
  { filename: 'Agatti_Island_beach.jpg', path: 'public/states/lakshadweep.jpg' },
  { filename: 'Radhanagar_Beach_Havelock_Island.jpg', path: 'public/states/andaman-nicobar.jpg' },
  { filename: 'Gateway_of_India.jpg', path: 'public/states/maharashtra.jpg' },
  { filename: 'Rani_ki_vav_04.jpg', path: 'public/states/gujarat.jpg' },
  { filename: 'Palolem_Sunset.JPG', path: 'public/states/goa.jpg' },
  { filename: 'Diu_Fort_View.jpg', path: 'public/states/dadra-nagar-haveli-daman-diu.jpg' },
  { filename: 'Victoria_Memorial-Kolkata,_West_Bengal,_India.JPG', path: 'public/states/west-bengal.jpg' },
  { filename: 'Sun_Temple_at_Konark,_Odisha,_India.JPG', path: 'public/states/odisha.jpg' },
  { filename: 'Animesh_Lochan_Chaitya_And_Mahabodhi_Temple_-_Bodh_Gaya_(1).jpg', path: 'public/states/bihar.jpg' },
  { filename: 'Hundru_Falls,_Jharkhand,_India_5.jpg', path: 'public/states/jharkhand.jpg' },
  { filename: 'Kandariya_Mahadev_Temple_at_Khajuraho.JPG', path: 'public/states/madhya-pradesh.jpg' },
  { filename: 'Chitrakot_waterfall3.JPG', path: 'public/states/chhattisgarh.jpg' },
  { filename: 'Indian_one-horned_rhinoceros_in_Kaziranga_National_Park.jpg', path: 'public/states/assam.jpg' },
  { filename: 'Kanchenjunga.JPG', path: 'public/states/sikkim.jpg' },
  { filename: 'Hornbill_Festival,_Pix_by_Vikramjit_Kakati.jpg', path: 'public/states/nagaland.jpg' },
  { filename: 'Loktak_Lake,_Manipur,_India.jpg', path: 'public/states/manipur.jpg' },
  { filename: 'Double_decker_living_root_bridge_of_Nongriat_village.jpg', path: 'public/states/meghalaya.jpg' },
  { filename: 'Aizawl_City_View.jpg', path: 'public/states/mizoram.jpg' },
  { filename: 'Neermahal.jpg', path: 'public/states/tripura.jpg' },
  { filename: 'Tawang_Monastery,_Arunachal_Pradesh.jpg', path: 'public/states/arunachal-pradesh.jpg' },

  // Meal Plates
  { filename: 'South_Indian_Thali_Meal.jpg', path: 'public/meals/south-indian-wholesome-feast.jpg' },
  { filename: 'North_Indian_Thali.jpg', path: 'public/meals/north-indian-comfort-meal.jpg' },
  { filename: 'Vegetarian_Thali.jpg', path: 'public/meals/diabetic-friendly-plate.jpg' },

  // Recipes
  { filename: 'Rogan_Josh.JPG', path: 'public/recipes/rogan-josh.jpg' },
  { filename: 'Indre-Steamed_Brown_Lentil_(Kolath)_Himalayan_Delicacy_01_(Kulath_dal).jpg', path: 'public/recipes/dham.jpg' },
  { filename: 'Uttarakhand_Food.jpg', path: 'public/recipes/kafuli.jpg' },
  { filename: 'Bajra_Khichdi.jpg', path: 'public/recipes/bajra-khichdi.jpg' },
  { filename: 'Dhuska_aur_pataal_jhojho.jpg', path: 'public/recipes/dhuska.jpg' },
  { filename: 'Popular_Poha_Jalebi.jpeg', path: 'public/recipes/poha-jalebi.jpg' },
  { filename: 'Steamed_Rice_Dumplings.jpg', path: 'public/recipes/fara.jpg' },
  { filename: 'A_full_plate_Assame_Food_Thali.jpg', path: 'public/recipes/masor-tenga.jpg' },
  { filename: 'Nepalese_Momos.JPG', path: 'public/recipes/momos.jpg' },
  { filename: 'Naga_traditional_plate.jpg', path: 'public/recipes/smoked-pork-bamboo.jpg' },
  { filename: 'Traditional_Manipuri_Thali_and_side_dishes.JPG', path: 'public/recipes/eromba.jpg' },
  { filename: 'Jadoh_(Meghalaya).JPG', path: 'public/recipes/jadoh.jpg' },
  { filename: 'Mizo_Meal.jpg', path: 'public/recipes/bai.jpg' },
  { filename: 'A_women_serving_Tripuri_traditional_dishes.jpg', path: 'public/recipes/mui-borok.jpg' },
  { filename: 'Thukpa,_Manali,_Himachal_Pradesh.JPG', path: 'public/recipes/thukpa.jpg' },
  { filename: 'Kulcha_Matar.jpg', path: 'public/recipes/amritsari-kulcha.jpg' },
  { filename: 'Thukpa,_Manali,_Himachal_Pradesh.JPG', path: 'public/recipes/skyu.jpg' },
  { filename: 'Fish_Curry_Home_Made.JPG', path: 'public/recipes/pondicherry-fish-curry.jpg' },
  { filename: 'Malabari_Fish_Curry_(Rawas).JPG', path: 'public/recipes/mus-kavaab.jpg' },
  { filename: 'Chingri_Malai_Curry.jpg', path: 'public/recipes/coconut-prawn-curry.jpg' },
  { filename: 'Best_\'Crab_Curry_%26_Rice\'_East_of_Suez_in_Mumbai.Goan_style.Cooked_by_Miss_Sabina.Dias.JPG', path: 'public/recipes/crab-curry.jpg' },
  { filename: 'Samosa.JPG', path: 'public/recipes/samosa.jpg' },
  { filename: 'Cottage_cheese_in_spinach_gravy(palak_paneer).jpg', path: 'public/recipes/palak-paneer.jpg' },
  { filename: 'A_plate_of_South_Indian_Masala_Dosa.jpg', path: 'public/recipes/masala-dosa.jpg' },
  { filename: 'Pav_bhaji_from_Mumbai.JPG', path: 'public/recipes/pav-bhaji.jpg' },
  { filename: 'A_Plate_of_Chole_Bhature.JPG', path: 'public/recipes/chole-bhature.jpg' },
  { filename: 'Galouti_Kebab.jpg', path: 'public/recipes/galouti-kebab.jpg' },
  { filename: 'Rajasthani_Dal_Bati_churma.jpg', path: 'public/recipes/dal-baati-churma.jpg' },
  { filename: 'Idli_Sambar.JPG', path: 'public/recipes/traditional-idli.jpg' },
  { filename: 'Chicken_Chettinad.jpg', path: 'public/recipes/chicken-chettinad.jpg' },
  { filename: 'Appam_Stew.jpg', path: 'public/recipes/appam-stew.jpg' },
  { filename: 'Bisi_Bele_Bath.jpg', path: 'public/recipes/bisi-bele-bath.jpg' },
  { filename: 'Hyderabadi_Biryani_with_Raita,_Mirchi_Ka_Salan_and_Salad.JPG', path: 'public/recipes/hyderabadi-biryani.jpg' },
  { filename: 'Sarva_Pindi_-_Spicy_rice_flour_pancake.jpg', path: 'public/recipes/sarva-pindi.jpg' },
  { filename: 'Vada_Pav-Indian_street_food.JPG', path: 'public/recipes/vada-pav.jpg' },
  { filename: 'Besan_Dhokla_-_Howrah_2015-04-26_8475.JPG', path: 'public/recipes/dhokla.jpg' },
  { filename: 'Fish-curry-rice_plate,_the_staple_diet_of_Goa_on_the_west_coast_of_South_Asia.jpg', path: 'public/recipes/goan-fish-curry.jpg' },
  { filename: 'Rasgulla_-_Kolkata_2011-08-02_4547.JPG', path: 'public/recipes/rosogolla.jpg' },
  { filename: 'Veglunchplatter_Rayagada_Odisha_0020.jpg', path: 'public/recipes/dalma.jpg' },
  { filename: 'Litti_chokha_dipped_in_Ghee.jpg', path: 'public/recipes/litti-chokha.jpg' },
  { filename: 'Indre-Steamed_Brown_Lentil_(Kolath)_Himalayan_Delicacy_01_(Kulath_dal).jpg', path: 'public/recipes/dham.jpg' },
  { filename: 'Uttarakhand_Food.jpg', path: 'public/recipes/kafuli.jpg' },
  { filename: 'Bajra_Khichdi.jpg', path: 'public/recipes/bajra-khichdi.jpg' },
  { filename: 'Popular_Poha_Jalebi.jpeg', path: 'public/recipes/poha-jalebi.jpg' },
  { filename: 'Steamed_Rice_Dumplings.jpg', path: 'public/recipes/fara.jpg' },
  { filename: 'Jadoh_(Meghalaya).JPG', path: 'public/recipes/jadoh.jpg' },
];

async function downloadImage(filename, filepath) {
  // Check if file exists and is > 0 bytes
  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
    console.log(`Skipping existing: ${filepath}`);
    return;
  }

  // Construct URL with encoded filename
  // Wikimedia Special:FilePath handles spaces if encoded.
  // We use encodeURIComponent for the filename.
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;

  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const request = https.get(url, {
      headers: {
        'User-Agent': 'TraeBot/1.0 (Educational Project; +https://github.com/trae-ai)',
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        // For redirects, we just follow them. The location should be a full URL.
        const redirectUrl = response.headers.location;
        // console.log(`Redirecting ${filename} to ${redirectUrl}`);
        
        https.get(redirectUrl, {
             headers: {
                'User-Agent': 'TraeBot/1.0 (Educational Project; +https://github.com/trae-ai)',
             }
        }, (res2) => {
            if (res2.statusCode !== 200) {
                reject(new Error(`Failed to download ${redirectUrl}: ${res2.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            streamPipeline(res2, fileStream)
                .then(() => {
                    console.log(`Downloaded: ${filepath}`);
                    resolve();
                })
                .catch((err) => {
                    console.error(`Error saving ${filepath}:`, err);
                    reject(err);
                });
        }).on('error', (err) => {
            console.error(`Redirect request error for ${filename}:`, err);
            reject(err);
        });
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      streamPipeline(response, fileStream)
        .then(() => {
          console.log(`Downloaded: ${filepath}`);
          resolve();
        })
        .catch((err) => {
            console.error(`Error saving ${filepath}:`, err);
            reject(err);
        });
    });

    request.on('error', (err) => {
      console.error(`Request error for ${filename}:`, err);
      reject(err);
    });
  });
}

async function main() {
  console.log('Starting download...');
  // Run sequentially to avoid rate limiting or connection issues
  for (const img of images) {
      try {
          await downloadImage(img.filename, img.path);
      } catch (e) {
          console.error(`Error downloading ${img.filename}: ${e.message}`);
      }
  }
  console.log('All downloads completed.');
}

main();

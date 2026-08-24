export interface EmojiDecoderItem {
  id: string;
  category: 'Movies' | 'Food' | 'Activities' | 'Places' | 'Everyday Phrases';
  emojis: string;
  answer: string;
  hint: string;
  acceptedVariations: string[];
  region: 'india' | 'global';
}

export const EMOJI_DECODER_PUZZLES: EmojiDecoderItem[] = [
  // Movies
  {
    id: 'ed1',
    category: 'Movies',
    emojis: '🚢 ❄️ 💔 🚪',
    answer: 'Titanic',
    hint: 'A romantic epic on an ill-fated luxury ship',
    region: 'global',
    acceptedVariations: ['titanic']
  },
  {
    id: 'ed2',
    category: 'Movies',
    emojis: '🦁 👑 🌅 🐗',
    answer: 'The Lion King',
    hint: 'Circle of life in the savannah',
    region: 'global',
    acceptedVariations: ['the lion king', 'lion king']
  },
  {
    id: 'ed3',
    category: 'Movies',
    emojis: '👻 🚫 🔫 🏢',
    answer: 'Ghostbusters',
    hint: 'Who ya gonna call?',
    region: 'global',
    acceptedVariations: ['ghostbusters', 'ghost busters']
  },
  {
    id: 'ed4',
    category: 'Movies',
    emojis: '🕷️ 🧑 🕸️ 🏙️',
    answer: 'Spider-Man',
    hint: 'Friendly neighborhood web slinger',
    region: 'global',
    acceptedVariations: ['spider man', 'spiderman', 'spider-man']
  },
  {
    id: 'ed5',
    category: 'Movies',
    emojis: '🧙‍♂️ 💍 🌋 🧝',
    answer: 'Lord of the Rings',
    hint: 'One ring to rule them all',
    region: 'global',
    acceptedVariations: ['lord of the rings', 'the lord of the rings', 'lotr']
  },
  {
    id: 'ed6',
    category: 'Movies',
    emojis: '🦖 🚙 🏝️ 🧬',
    answer: 'Jurassic Park',
    hint: 'Dinosaurs brought back by DNA on an island',
    region: 'global',
    acceptedVariations: ['jurassic park', 'jurassic world']
  },
  {
    id: 'ed7',
    category: 'Movies',
    emojis: '🎈 🏠 👴 👦',
    answer: 'Up',
    hint: 'Pixar movie about floating a house to Paradise Falls',
    region: 'global',
    acceptedVariations: ['up']
  },
  {
    id: 'ed8',
    category: 'Movies',
    emojis: '🍫 🏭 🎫 🎩',
    answer: 'Willy Wonka & the Chocolate Factory',
    hint: 'Golden tickets to a magical confectionery',
    region: 'global',
    acceptedVariations: ['willy wonka', 'charlie and the chocolate factory', 'willy wonka and the chocolate factory', 'wonka']
  },

  // Food
  {
    id: 'ed9',
    category: 'Food',
    emojis: '🍕 🧀 🍅 🌿',
    answer: 'Margherita Pizza',
    hint: 'Classic Italian pizza with tomato, mozzarella, and basil',
    region: 'global',
    acceptedVariations: ['margherita pizza', 'pizza margherita', 'margherita', 'cheese pizza']
  },
  {
    id: 'ed10',
    category: 'Food',
    emojis: '🥑 🍞 🍳 🌶️',
    answer: 'Avocado Toast',
    hint: 'Popular brunch favorite on toasted sourdough',
    region: 'global',
    acceptedVariations: ['avocado toast', 'avo toast']
  },
  {
    id: 'ed11',
    category: 'Food',
    emojis: '🌮 🥑 🥩 🍋',
    answer: 'Beef Tacos',
    hint: 'Mexican handheld street food with lime and cilantro',
    region: 'global',
    acceptedVariations: ['beef tacos', 'tacos', 'taco', 'steak tacos']
  },
  {
    id: 'ed12',
    category: 'Food',
    emojis: '🥞 🧈 🍁 🥓',
    answer: 'Pancakes with Maple Syrup',
    hint: 'Fluffy stack for breakfast',
    region: 'global',
    acceptedVariations: ['pancakes', 'pancake', 'pancakes with maple syrup', 'pancakes and syrup']
  },
  {
    id: 'ed13',
    category: 'Food',
    emojis: '🍣 🥢 🍱 🍙',
    answer: 'Sushi Platter',
    hint: 'Japanese delicacy with raw fish and seasoned rice',
    region: 'global',
    acceptedVariations: ['sushi', 'sushi platter', 'sushi roll', 'sashimi']
  },
  {
    id: 'ed14',
    category: 'Food',
    emojis: '🍓 🍌 🥛 🧊',
    answer: 'Strawberry Banana Smoothie',
    hint: 'Blended cold fruit beverage',
    region: 'global',
    acceptedVariations: ['strawberry banana smoothie', 'fruit smoothie', 'smoothie']
  },
  {
    id: 'ed15',
    category: 'Food',
    emojis: '🍝 🧆 🍅 🧀',
    answer: 'Spaghetti and Meatballs',
    hint: 'Classic Italian-American comfort pasta dish',
    region: 'global',
    acceptedVariations: ['spaghetti and meatballs', 'spaghetti with meatballs', 'spaghetti', 'pasta and meatballs']
  },

  // Activities
  {
    id: 'ed16',
    category: 'Activities',
    emojis: '⛺ 🔥 🌲 🌌',
    answer: 'Camping under the stars',
    hint: 'Pitching a tent in nature by a campfire',
    region: 'global',
    acceptedVariations: ['camping', 'camping under the stars', 'camp fire', 'campfire']
  },
  {
    id: 'ed17',
    category: 'Activities',
    emojis: '🍿 🎬 🛋️ 📺',
    answer: 'Movie Night at Home',
    hint: 'Cozy evening streaming films on the couch',
    region: 'global',
    acceptedVariations: ['movie night', 'movie night at home', 'watching movies', 'watching a movie']
  },
  {
    id: 'ed18',
    category: 'Activities',
    emojis: '🚗 🛣️ 🎶 🗺️',
    answer: 'Road Trip',
    hint: 'Cruising down scenic highways with playlists',
    region: 'global',
    acceptedVariations: ['road trip', 'roadtrip', 'scenic drive']
  },
  {
    id: 'ed19',
    category: 'Activities',
    emojis: '🎤 🎶 🍻 👯',
    answer: 'Karaoke Night',
    hint: 'Singing along with lyrics on a screen with friends',
    region: 'global',
    acceptedVariations: ['karaoke', 'karaoke night', 'singing karaoke']
  },
  {
    id: 'ed20',
    category: 'Activities',
    emojis: '🧺 🥪 🌳 🍇',
    answer: 'Park Picnic',
    hint: 'Spreading a blanket on the grass with a basket of snacks',
    region: 'global',
    acceptedVariations: ['picnic', 'park picnic', 'picnic date', 'picnic in the park']
  },
  {
    id: 'ed21',
    category: 'Activities',
    emojis: '🎳 👟 🎳 🏆',
    answer: 'Bowling Date',
    hint: 'Renting shoes and aiming for a strike',
    region: 'global',
    acceptedVariations: ['bowling', 'bowling date', 'ten pin bowling']
  },
  {
    id: 'ed22',
    category: 'Activities',
    emojis: '🧁 👩‍🍳 🥣 ⏲️',
    answer: 'Baking Cupcakes',
    hint: 'Mixing batter and frosting sweet treats',
    region: 'global',
    acceptedVariations: ['baking', 'baking cupcakes', 'baking cakes', 'making cupcakes']
  },

  // Places
  {
    id: 'ed23',
    category: 'Places',
    emojis: '🗼 🥐 🥖 🎨',
    answer: 'Paris',
    hint: 'The City of Light in France',
    region: 'global',
    acceptedVariations: ['paris', 'france']
  },
  {
    id: 'ed24',
    category: 'Places',
    emojis: '🗽 🚕 🏢 🍕',
    answer: 'New York City',
    hint: 'The Big Apple with yellow cabs and skyline',
    region: 'global',
    acceptedVariations: ['new york', 'new york city', 'nyc']
  },
  {
    id: 'ed25',
    category: 'Places',
    emojis: '🏰 🐭 🎡 🎆',
    answer: 'Disneyland',
    hint: 'The happiest theme park on earth',
    region: 'global',
    acceptedVariations: ['disneyland', 'disney world', 'walt disney world', 'disney']
  },
  {
    id: 'ed26',
    category: 'Places',
    emojis: '🏝️ 🌺 🥥 🌋',
    answer: 'Hawaii',
    hint: 'Tropical Pacific island paradise with volcanoes and leis',
    region: 'global',
    acceptedVariations: ['hawaii', 'honolulu', 'maui']
  },
  {
    id: 'ed27',
    category: 'Places',
    emojis: '🍕 🏛️ 🛵 ☕',
    answer: 'Rome',
    hint: 'Eternal City with ancient Colosseum and espresso',
    region: 'global',
    acceptedVariations: ['rome', 'italy']
  },
  {
    id: 'ed28',
    category: 'Places',
    emojis: '🍣 🌸 🚄 🗻',
    answer: 'Tokyo / Japan',
    hint: 'Cherry blossoms, bullet trains, and Mt. Fuji',
    region: 'global',
    acceptedVariations: ['tokyo', 'japan', 'kyoto']
  },

  // Everyday Phrases
  {
    id: 'ed29',
    category: 'Everyday Phrases',
    emojis: '❤️ 🔒 🗝️ ✨',
    answer: 'Key to My Heart',
    hint: 'Something you hold that opens my love',
    region: 'global',
    acceptedVariations: ['key to my heart', 'key to your heart', 'unlock my heart']
  },
  {
    id: 'ed30',
    category: 'Everyday Phrases',
    emojis: '🦋 🦋 🫄 💓',
    answer: 'Butterflies in My Stomach',
    hint: 'Excited nervous feeling when in love',
    region: 'global',
    acceptedVariations: ['butterflies in my stomach', 'butterflies in your stomach', 'butterflies']
  },
  {
    id: 'ed31',
    category: 'Everyday Phrases',
    emojis: '🌧️ 🐈 🐕 ☔',
    answer: 'Raining Cats and Dogs',
    hint: 'A heavy downpour of rain',
    region: 'global',
    acceptedVariations: ['raining cats and dogs', 'rain cats and dogs']
  },
  {
    id: 'ed32',
    category: 'Everyday Phrases',
    emojis: '🧁 🎂 🍰 😋',
    answer: 'Piece of Cake',
    hint: 'Something that is super easy to do',
    region: 'global',
    acceptedVariations: ['piece of cake', 'a piece of cake']
  },
  {
    id: 'ed33',
    category: 'Everyday Phrases',
    emojis: '☕ 🌅 ☀️ 🔋',
    answer: 'Morning Coffee Boost',
    hint: 'Essential ritual to start the morning alive',
    region: 'global',
    acceptedVariations: ['morning coffee', 'morning coffee boost', 'coffee break']
  },
  {
    id: 'ed34',
    category: 'Everyday Phrases',
    emojis: '👀 ❤️ 💘 🏹',
    answer: 'Love at First Sight',
    hint: 'Instant romantic attraction the moment eyes meet',
    region: 'global',
    acceptedVariations: ['love at first sight']
  },
  {
    id: 'ed35',
    category: 'Everyday Phrases',
    emojis: '🌙 🔙 💖 ✨',
    answer: 'Love you to the moon and back',
    hint: 'Infinite expression of deep affection',
    region: 'global',
    acceptedVariations: ['love you to the moon and back', 'to the moon and back', 'i love you to the moon and back']
  },
  { id: 'ed36', category: 'Movies', emojis: '🚂 🌾 💑 🇮🇳', answer: 'Dilwale Dulhania Le Jayenge', hint: 'A classic train-and-mustard-fields romance', region: 'india', acceptedVariations: ['ddlj', 'dilwale dulhania le jayenge'] },
  { id: 'ed37', category: 'Movies', emojis: '3️⃣ 🎓 🤝 💡', answer: '3 Idiots', hint: 'Three engineering friends', region: 'india', acceptedVariations: ['3 idiots', 'three idiots'] },
  { id: 'ed38', category: 'Movies', emojis: '🚗 🇪🇸 🤿 🪂', answer: 'Zindagi Na Milegi Dobara', hint: 'Friends take a life-changing road trip', region: 'india', acceptedVariations: ['znmd', 'zindagi na milegi dobara'] },
  { id: 'ed39', category: 'Movies', emojis: '👑 ✈️ 🇫🇷 💃', answer: 'Queen', hint: 'A solo honeymoon becomes self-discovery', region: 'india', acceptedVariations: ['queen'] },
  { id: 'ed40', category: 'Movies', emojis: '🤼‍♀️ 👨‍👧‍👧 🏅 🇮🇳', answer: 'Dangal', hint: 'A family wrestling story', region: 'india', acceptedVariations: ['dangal'] },
  { id: 'ed41', category: 'Movies', emojis: '⭐ 🌍 🎨 👦', answer: 'Taare Zameen Par', hint: 'A gifted child finds an inspiring teacher', region: 'india', acceptedVariations: ['taare zameen par', 'stars on earth'] },
  { id: 'ed42', category: 'Movies', emojis: '🚂 💬 ❤️ 🗺️', answer: 'Jab We Met', hint: 'Two strangers meet on a train', region: 'india', acceptedVariations: ['jab we met'] },
  { id: 'ed43', category: 'Movies', emojis: '🏏 🌧️ 🏘️ 🏆', answer: 'Lagaan', hint: 'A village plays a historic cricket match', region: 'india', acceptedVariations: ['lagaan'] },
  { id: 'ed44', category: 'Movies', emojis: '👧 🗺️ 🤝 🏠', answer: 'Bajrangi Bhaijaan', hint: 'A man helps a lost child return home', region: 'india', acceptedVariations: ['bajrangi bhaijaan', 'bajrangi'] },
  { id: 'ed45', category: 'Movies', emojis: '🏑 👩‍👩‍👧‍👧 🇮🇳 🏆', answer: 'Chak De India', hint: 'A national hockey team chases victory', region: 'india', acceptedVariations: ['chak de india', 'chakde india'] },
  { id: 'ed46', category: 'Movies', emojis: '🌲 🐗 🎭 🔥', answer: 'Kantara', hint: 'A Kannada forest drama', region: 'india', acceptedVariations: ['kantara'] },
  { id: 'ed47', category: 'Movies', emojis: '🎓 🎉 ❤️ 🎸', answer: 'Kirik Party', hint: 'A Kannada campus favourite', region: 'india', acceptedVariations: ['kirik party'] },
  { id: 'ed48', category: 'Movies', emojis: '🚜 ❤️ 🎶 🏃', answer: 'Sairat', hint: 'A Marathi countryside romance', region: 'india', acceptedVariations: ['sairat'] },
  { id: 'ed49', category: 'Movies', emojis: '🎭 👑 👴 👏', answer: 'Natsamrat', hint: 'A celebrated Marathi stage drama', region: 'india', acceptedVariations: ['natsamrat'] },
  { id: 'ed50', category: 'Movies', emojis: '9️⃣6️⃣ 📸 ❤️ 🎒', answer: '96', hint: 'A Tamil school reunion romance', region: 'india', acceptedVariations: ['96', 'ninety six'] },
  { id: 'ed51', category: 'Movies', emojis: '🕵️‍♂️ 🔥 🚚 ⌚', answer: 'Vikram', hint: 'A Tamil action thriller', region: 'india', acceptedVariations: ['vikram'] },
  { id: 'ed52', category: 'Movies', emojis: '🏰 💪 ⚔️ 🌊', answer: 'Baahubali', hint: 'An epic Telugu kingdom saga', region: 'india', acceptedVariations: ['baahubali', 'bahubali'] },
  { id: 'ed53', category: 'Movies', emojis: '🏍️ 🐎 🤝 🔥', answer: 'RRR', hint: 'Two heroes form a powerful friendship', region: 'india', acceptedVariations: ['rrr'] },
  { id: 'ed54', category: 'Movies', emojis: '🌸 ❤️ 🎓 🦋', answer: 'Premam', hint: 'A Malayalam coming-of-age romance', region: 'india', acceptedVariations: ['premam'] },
  { id: 'ed55', category: 'Movies', emojis: '3️⃣ 🏙️ 🏍️ 🤝', answer: 'Bangalore Days', hint: 'Cousins begin new lives in Bengaluru', region: 'india', acceptedVariations: ['bangalore days', 'bengaluru days'] },
  { id: 'ed56', category: 'Movies', emojis: '🚂 🌾 👧 👦', answer: 'Pather Panchali', hint: 'A Bengali village classic', region: 'india', acceptedVariations: ['pather panchali'] },
  { id: 'ed57', category: 'Movies', emojis: '🕵️‍♂️ 📚 🔎 🏙️', answer: 'Feluda', hint: 'Bengal’s beloved detective', region: 'india', acceptedVariations: ['feluda'] },
  { id: 'ed58', category: 'Food', emojis: '🥞 🥔 🌶️ 🥥', answer: 'Masala Dosa', hint: 'A crisp South Indian favourite', region: 'india', acceptedVariations: ['masala dosa', 'dosa'] },
  { id: 'ed59', category: 'Food', emojis: '🟤 💧 🌶️ 😋', answer: 'Pani Puri', hint: 'Crisp shells filled with tangy water', region: 'india', acceptedVariations: ['pani puri', 'panipuri', 'golgappa', 'puchka'] },
  { id: 'ed60', category: 'Food', emojis: '🍞 🥘 🧈 🧅', answer: 'Pav Bhaji', hint: 'Buttered bread with spiced vegetables', region: 'india', acceptedVariations: ['pav bhaji', 'pavbhaji'] },
  { id: 'ed61', category: 'Food', emojis: '🍚 🌶️ 🍗 🥘', answer: 'Biryani', hint: 'Fragrant layered rice', region: 'india', acceptedVariations: ['biryani', 'biriyani'] },
  { id: 'ed62', category: 'Food', emojis: '⚪ ⚪ 🥣 🌶️', answer: 'Idli Sambar', hint: 'Steamed cakes with lentil stew', region: 'india', acceptedVariations: ['idli sambar', 'idly sambar', 'idli'] },
  { id: 'ed63', category: 'Food', emojis: '🫘 🍛 🫓 😋', answer: 'Chole Bhature', hint: 'Spiced chickpeas with fluffy bread', region: 'india', acceptedVariations: ['chole bhature', 'chhole bhature'] },
  { id: 'ed64', category: 'Food', emojis: '🍔 🥔 🌶️ 🚉', answer: 'Vada Pav', hint: 'Mumbai’s popular potato snack', region: 'india', acceptedVariations: ['vada pav', 'wadapav', 'vada pao'] },
  { id: 'ed65', category: 'Food', emojis: '🫘 🍛 🍚 ❤️', answer: 'Rajma Chawal', hint: 'Kidney bean curry with rice', region: 'india', acceptedVariations: ['rajma chawal', 'rajma rice'] },
  { id: 'ed66', category: 'Food', emojis: '🌀 🧡 🍯 😋', answer: 'Jalebi', hint: 'A bright spiral sweet', region: 'india', acceptedVariations: ['jalebi', 'jilebi'] },
  { id: 'ed67', category: 'Food', emojis: '☕ 🥛 🌫️ 🥄', answer: 'Filter Coffee', hint: 'A frothy South Indian brew', region: 'india', acceptedVariations: ['filter coffee', 'kaapi', 'coffee'] },
  { id: 'ed68', category: 'Places', emojis: '🕌 🤍 🌙 📸', answer: 'Taj Mahal', hint: 'The famous white marble monument in Agra', region: 'india', acceptedVariations: ['taj mahal', 'tajmahal', 'taj'] },
  { id: 'ed69', category: 'Places', emojis: '🚪 🇮🇳 🌊 ⛴️', answer: 'Gateway of India', hint: 'Mumbai’s waterfront arch', region: 'india', acceptedVariations: ['gateway of india', 'gateway'] },
  { id: 'ed70', category: 'Places', emojis: '🏛️ 🇮🇳 🌳 🌆', answer: 'India Gate', hint: 'A landmark avenue monument in Delhi', region: 'india', acceptedVariations: ['india gate'] },
  { id: 'ed71', category: 'Places', emojis: '🏰 🪟 🌬️ 🩷', answer: 'Hawa Mahal', hint: 'Jaipur’s Palace of Winds', region: 'india', acceptedVariations: ['hawa mahal', 'palace of winds'] },
  { id: 'ed72', category: 'Places', emojis: '🏰 💡 🐘 🌙', answer: 'Mysore Palace', hint: 'A grand illuminated Karnataka palace', region: 'india', acceptedVariations: ['mysore palace', 'mysuru palace'] },
  { id: 'ed73', category: 'Places', emojis: '🌊 🛣️ 🌙 📿', answer: 'Marine Drive', hint: 'Mumbai’s seaside Queen’s Necklace', region: 'india', acceptedVariations: ['marine drive', 'queens necklace'] },
  { id: 'ed74', category: 'Places', emojis: '🏖️ 🌴 🛵 🌅', answer: 'Goa', hint: 'Beaches and scooter rides', region: 'india', acceptedVariations: ['goa'] },
  { id: 'ed75', category: 'Places', emojis: '🛶 🌴 💧 🏠', answer: 'Kerala Backwaters', hint: 'Houseboats through palm-lined canals', region: 'india', acceptedVariations: ['kerala backwaters', 'backwaters', 'alleppey'] },
  { id: 'ed76', category: 'Places', emojis: '🍵 🚂 ⛰️ 🌫️', answer: 'Darjeeling', hint: 'Tea gardens and a toy train', region: 'india', acceptedVariations: ['darjeeling'] },
  { id: 'ed77', category: 'Places', emojis: '🤍 🏜️ 🌕 🐪', answer: 'Rann of Kutch', hint: 'Gujarat’s white salt desert', region: 'india', acceptedVariations: ['rann of kutch', 'kutch', 'white rann'] },
  { id: 'ed78', category: 'Activities', emojis: '🏏 🏟️ 👏 📣', answer: 'Cricket Match', hint: 'An afternoon cheering every boundary', region: 'india', acceptedVariations: ['cricket match', 'cricket'] },
  { id: 'ed79', category: 'Activities', emojis: '🏏 6️⃣ 🚀 🙌', answer: 'Six', hint: 'The ball clears the boundary', region: 'india', acceptedVariations: ['six', 'sixer'] },
  { id: 'ed80', category: 'Activities', emojis: '🏏 3️⃣ 🎯 🎩', answer: 'Hat Trick', hint: 'Three wickets in three balls', region: 'india', acceptedVariations: ['hat trick', 'hattrick'] },
  { id: 'ed81', category: 'Activities', emojis: '🏏 🏘️ 🚗 👦', answer: 'Gully Cricket', hint: 'A neighbourhood street game', region: 'india', acceptedVariations: ['gully cricket', 'street cricket'] },
  { id: 'ed82', category: 'Activities', emojis: '🌍 🏆 🏏 🇮🇳', answer: 'World Cup', hint: 'Cricket’s global trophy', region: 'india', acceptedVariations: ['world cup', 'cricket world cup'] },
  { id: 'ed83', category: 'Activities', emojis: '🏏 ⏱️ 🔥 1️⃣', answer: 'Super Over', hint: 'A tie-breaking cricket finish', region: 'india', acceptedVariations: ['super over', 'superover'] },
  { id: 'ed84', category: 'Everyday Phrases', emojis: '🪔 ✨ 🏠 🎁', answer: 'Diwali Lights', hint: 'Homes glowing during a festival of lights', region: 'india', acceptedVariations: ['diwali', 'deepavali', 'diwali lights'] },
  { id: 'ed85', category: 'Everyday Phrases', emojis: '🌈 💦 🎨 😄', answer: 'Holi Celebration', hint: 'A joyful festival of colours', region: 'india', acceptedVariations: ['holi', 'holi celebration'] },
  { id: 'ed86', category: 'Everyday Phrases', emojis: '🪁 ☀️ 🏠 🎉', answer: 'Kite Festival', hint: 'Colourful kites fill the sky', region: 'india', acceptedVariations: ['kite festival', 'uttarayan', 'makar sankranti'] },
  { id: 'ed87', category: 'Everyday Phrases', emojis: '🌼 🍌 🍚 🥘', answer: 'Onam Sadya', hint: 'A festive Kerala feast', region: 'india', acceptedVariations: ['onam sadya', 'sadya', 'onam sadhya'] },
  { id: 'ed88', category: 'Everyday Phrases', emojis: '🎨 🏛️ 👨‍👩‍👧‍👦 ✨', answer: 'Durga Puja Pandal', hint: 'Festive art displays and community visits', region: 'india', acceptedVariations: ['durga puja pandal', 'puja pandal', 'pandal hopping'] },
  { id: 'ed89', category: 'Everyday Phrases', emojis: '🎨 🥁 🌺 🎉', answer: 'Ganesh Festival', hint: 'A colourful community celebration', region: 'india', acceptedVariations: ['ganesh festival', 'ganesh chaturthi'] },
  { id: 'ed90', category: 'Everyday Phrases', emojis: '☕ 🫖 🍪 💬', answer: 'Chai Break', hint: 'Tea and conversation', region: 'india', acceptedVariations: ['chai break', 'tea break', 'chai'] },
  { id: 'ed91', category: 'Everyday Phrases', emojis: '🛺 🚦 🏙️ 💨', answer: 'Auto Rickshaw Ride', hint: 'A familiar three-wheeler journey', region: 'india', acceptedVariations: ['auto rickshaw ride', 'auto ride', 'rickshaw ride'] },
  { id: 'ed92', category: 'Everyday Phrases', emojis: '🌧️ ☂️ 🚶‍♀️ 🌿', answer: 'Monsoon Walk', hint: 'A stroll in fresh rain', region: 'india', acceptedVariations: ['monsoon walk', 'rain walk'] },
  { id: 'ed93', category: 'Everyday Phrases', emojis: '☀️ 🏏 👟 🤝', answer: 'Sunday Cricket', hint: 'A relaxed weekend game', region: 'india', acceptedVariations: ['sunday cricket', 'weekend cricket'] },
  { id: 'ed94', category: 'Everyday Phrases', emojis: '🎬 🔺 ☕ 😋', answer: 'Movie and Samosa', hint: 'A film with a favourite snack', region: 'india', acceptedVariations: ['movie and samosa', 'samosa movie', 'movie snack'] },
  { id: 'ed95', category: 'Everyday Phrases', emojis: '🚂 🪟 ☕ 🏞️', answer: 'Train Journey', hint: 'Watching scenery from an Indian train', region: 'india', acceptedVariations: ['train journey', 'train ride'] },
  { id: 'ed96', category: 'Everyday Phrases', emojis: '🌆 🥣 🌶️ 😋', answer: 'Evening Chaat', hint: 'A tangy street-food outing', region: 'india', acceptedVariations: ['evening chaat', 'chaat', 'street food'] },
  { id: 'ed97', category: 'Everyday Phrases', emojis: '🚗 🎶 🛣️ 🌅', answer: 'Long Drive', hint: 'Music and an open road', region: 'india', acceptedVariations: ['long drive', 'road trip'] },
];

export interface EmojiDecoderItem {
  id: string;
  category: 'Movies' | 'Food' | 'Activities' | 'Places' | 'Everyday Phrases';
  emojis: string;
  answer: string;
  hint: string;
  acceptedVariations: string[];
}

export const EMOJI_DECODER_PUZZLES: EmojiDecoderItem[] = [
  // Movies
  {
    id: 'ed1',
    category: 'Movies',
    emojis: '🚢 ❄️ 💔 🚪',
    answer: 'Titanic',
    hint: 'A romantic epic on an ill-fated luxury ship',
    acceptedVariations: ['titanic']
  },
  {
    id: 'ed2',
    category: 'Movies',
    emojis: '🦁 👑 🌅 🐗',
    answer: 'The Lion King',
    hint: 'Circle of life in the savannah',
    acceptedVariations: ['the lion king', 'lion king']
  },
  {
    id: 'ed3',
    category: 'Movies',
    emojis: '👻 🚫 🔫 🏢',
    answer: 'Ghostbusters',
    hint: 'Who ya gonna call?',
    acceptedVariations: ['ghostbusters', 'ghost busters']
  },
  {
    id: 'ed4',
    category: 'Movies',
    emojis: '🕷️ 🧑 🕸️ 🏙️',
    answer: 'Spider-Man',
    hint: 'Friendly neighborhood web slinger',
    acceptedVariations: ['spider man', 'spiderman', 'spider-man']
  },
  {
    id: 'ed5',
    category: 'Movies',
    emojis: '🧙‍♂️ 💍 🌋 🧝',
    answer: 'Lord of the Rings',
    hint: 'One ring to rule them all',
    acceptedVariations: ['lord of the rings', 'the lord of the rings', 'lotr']
  },
  {
    id: 'ed6',
    category: 'Movies',
    emojis: '🦖 🚙 🏝️ 🧬',
    answer: 'Jurassic Park',
    hint: 'Dinosaurs brought back by DNA on an island',
    acceptedVariations: ['jurassic park', 'jurassic world']
  },
  {
    id: 'ed7',
    category: 'Movies',
    emojis: '🎈 🏠 👴 👦',
    answer: 'Up',
    hint: 'Pixar movie about floating a house to Paradise Falls',
    acceptedVariations: ['up']
  },
  {
    id: 'ed8',
    category: 'Movies',
    emojis: '🍫 🏭 🎫 🎩',
    answer: 'Willy Wonka & the Chocolate Factory',
    hint: 'Golden tickets to a magical confectionery',
    acceptedVariations: ['willy wonka', 'charlie and the chocolate factory', 'willy wonka and the chocolate factory', 'wonka']
  },

  // Food
  {
    id: 'ed9',
    category: 'Food',
    emojis: '🍕 🧀 🍅 🌿',
    answer: 'Margherita Pizza',
    hint: 'Classic Italian pizza with tomato, mozzarella, and basil',
    acceptedVariations: ['margherita pizza', 'pizza margherita', 'margherita', 'cheese pizza']
  },
  {
    id: 'ed10',
    category: 'Food',
    emojis: '🥑 🍞 🍳 🌶️',
    answer: 'Avocado Toast',
    hint: 'Popular brunch favorite on toasted sourdough',
    acceptedVariations: ['avocado toast', 'avo toast']
  },
  {
    id: 'ed11',
    category: 'Food',
    emojis: '🌮 🥑 🥩 🍋',
    answer: 'Beef Tacos',
    hint: 'Mexican handheld street food with lime and cilantro',
    acceptedVariations: ['beef tacos', 'tacos', 'taco', 'steak tacos']
  },
  {
    id: 'ed12',
    category: 'Food',
    emojis: '🥞 🧈 🍁 🥓',
    answer: 'Pancakes with Maple Syrup',
    hint: 'Fluffy stack for breakfast',
    acceptedVariations: ['pancakes', 'pancake', 'pancakes with maple syrup', 'pancakes and syrup']
  },
  {
    id: 'ed13',
    category: 'Food',
    emojis: '🍣 🥢 🍱 🍙',
    answer: 'Sushi Platter',
    hint: 'Japanese delicacy with raw fish and seasoned rice',
    acceptedVariations: ['sushi', 'sushi platter', 'sushi roll', 'sashimi']
  },
  {
    id: 'ed14',
    category: 'Food',
    emojis: '🍓 🍌 🥛 🧊',
    answer: 'Strawberry Banana Smoothie',
    hint: 'Blended cold fruit beverage',
    acceptedVariations: ['strawberry banana smoothie', 'fruit smoothie', 'smoothie']
  },
  {
    id: 'ed15',
    category: 'Food',
    emojis: '🍝 🧆 🍅 🧀',
    answer: 'Spaghetti and Meatballs',
    hint: 'Classic Italian-American comfort pasta dish',
    acceptedVariations: ['spaghetti and meatballs', 'spaghetti with meatballs', 'spaghetti', 'pasta and meatballs']
  },

  // Activities
  {
    id: 'ed16',
    category: 'Activities',
    emojis: '⛺ 🔥 🌲 🌌',
    answer: 'Camping under the stars',
    hint: 'Pitching a tent in nature by a campfire',
    acceptedVariations: ['camping', 'camping under the stars', 'camp fire', 'campfire']
  },
  {
    id: 'ed17',
    category: 'Activities',
    emojis: '🍿 🎬 🛋️ 📺',
    answer: 'Movie Night at Home',
    hint: 'Cozy evening streaming films on the couch',
    acceptedVariations: ['movie night', 'movie night at home', 'watching movies', 'watching a movie']
  },
  {
    id: 'ed18',
    category: 'Activities',
    emojis: '🚗 🛣️ 🎶 🗺️',
    answer: 'Road Trip',
    hint: 'Cruising down scenic highways with playlists',
    acceptedVariations: ['road trip', 'roadtrip', 'scenic drive']
  },
  {
    id: 'ed19',
    category: 'Activities',
    emojis: '🎤 🎶 🍻 👯',
    answer: 'Karaoke Night',
    hint: 'Singing along with lyrics on a screen with friends',
    acceptedVariations: ['karaoke', 'karaoke night', 'singing karaoke']
  },
  {
    id: 'ed20',
    category: 'Activities',
    emojis: '🧺 🥪 🌳 🍇',
    answer: 'Park Picnic',
    hint: 'Spreading a blanket on the grass with a basket of snacks',
    acceptedVariations: ['picnic', 'park picnic', 'picnic date', 'picnic in the park']
  },
  {
    id: 'ed21',
    category: 'Activities',
    emojis: '🎳 👟 🎳 🏆',
    answer: 'Bowling Date',
    hint: 'Renting shoes and aiming for a strike',
    acceptedVariations: ['bowling', 'bowling date', 'ten pin bowling']
  },
  {
    id: 'ed22',
    category: 'Activities',
    emojis: '🧁 👩‍🍳 🥣 ⏲️',
    answer: 'Baking Cupcakes',
    hint: 'Mixing batter and frosting sweet treats',
    acceptedVariations: ['baking', 'baking cupcakes', 'baking cakes', 'making cupcakes']
  },

  // Places
  {
    id: 'ed23',
    category: 'Places',
    emojis: '🗼 🥐 🥖 🎨',
    answer: 'Paris',
    hint: 'The City of Light in France',
    acceptedVariations: ['paris', 'france']
  },
  {
    id: 'ed24',
    category: 'Places',
    emojis: '🗽 🚕 🏢 🍕',
    answer: 'New York City',
    hint: 'The Big Apple with yellow cabs and skyline',
    acceptedVariations: ['new york', 'new york city', 'nyc']
  },
  {
    id: 'ed25',
    category: 'Places',
    emojis: '🏰 🐭 🎡 🎆',
    answer: 'Disneyland',
    hint: 'The happiest theme park on earth',
    acceptedVariations: ['disneyland', 'disney world', 'walt disney world', 'disney']
  },
  {
    id: 'ed26',
    category: 'Places',
    emojis: '🏝️ 🌺 🥥 🌋',
    answer: 'Hawaii',
    hint: 'Tropical Pacific island paradise with volcanoes and leis',
    acceptedVariations: ['hawaii', 'honolulu', 'maui']
  },
  {
    id: 'ed27',
    category: 'Places',
    emojis: '🍕 🏛️ 🛵 ☕',
    answer: 'Rome',
    hint: 'Eternal City with ancient Colosseum and espresso',
    acceptedVariations: ['rome', 'italy']
  },
  {
    id: 'ed28',
    category: 'Places',
    emojis: '🍣 🌸 🚄 🗻',
    answer: 'Tokyo / Japan',
    hint: 'Cherry blossoms, bullet trains, and Mt. Fuji',
    acceptedVariations: ['tokyo', 'japan', 'kyoto']
  },

  // Everyday Phrases
  {
    id: 'ed29',
    category: 'Everyday Phrases',
    emojis: '❤️ 🔒 🗝️ ✨',
    answer: 'Key to My Heart',
    hint: 'Something you hold that opens my love',
    acceptedVariations: ['key to my heart', 'key to your heart', 'unlock my heart']
  },
  {
    id: 'ed30',
    category: 'Everyday Phrases',
    emojis: '🦋 🦋 🫄 💓',
    answer: 'Butterflies in My Stomach',
    hint: 'Excited nervous feeling when in love',
    acceptedVariations: ['butterflies in my stomach', 'butterflies in your stomach', 'butterflies']
  },
  {
    id: 'ed31',
    category: 'Everyday Phrases',
    emojis: '🌧️ 🐈 🐕 ☔',
    answer: 'Raining Cats and Dogs',
    hint: 'A heavy downpour of rain',
    acceptedVariations: ['raining cats and dogs', 'rain cats and dogs']
  },
  {
    id: 'ed32',
    category: 'Everyday Phrases',
    emojis: '🧁 🎂 🍰 😋',
    answer: 'Piece of Cake',
    hint: 'Something that is super easy to do',
    acceptedVariations: ['piece of cake', 'a piece of cake']
  },
  {
    id: 'ed33',
    category: 'Everyday Phrases',
    emojis: '☕ 🌅 ☀️ 🔋',
    answer: 'Morning Coffee Boost',
    hint: 'Essential ritual to start the morning alive',
    acceptedVariations: ['morning coffee', 'morning coffee boost', 'coffee break']
  },
  {
    id: 'ed34',
    category: 'Everyday Phrases',
    emojis: '👀 ❤️ 💘 🏹',
    answer: 'Love at First Sight',
    hint: 'Instant romantic attraction the moment eyes meet',
    acceptedVariations: ['love at first sight']
  },
  {
    id: 'ed35',
    category: 'Everyday Phrases',
    emojis: '🌙 🔙 💖 ✨',
    answer: 'Love you to the moon and back',
    hint: 'Infinite expression of deep affection',
    acceptedVariations: ['love you to the moon and back', 'to the moon and back', 'i love you to the moon and back']
  }
];

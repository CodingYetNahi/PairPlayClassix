export interface KnowMeQuestion {
  id: string;
  category: 'favourites' | 'habits' | 'memories' | 'personality' | 'future';
  prompt: string; // e.g. "What is my absolute favorite comfort food?"
  options?: string[]; // optional suggested options for quick play
}

export const KNOW_ME_QUESTIONS: KnowMeQuestion[] = [
  { id: 'k1', category: 'favourites', prompt: 'What is my absolute go-to comfort food when feeling tired?' },
  { id: 'k2', category: 'favourites', prompt: 'What is my favorite hot or iced beverage order?' },
  { id: 'k3', category: 'favourites', prompt: 'Which movie could I watch ten times without getting bored?' },
  { id: 'k4', category: 'favourites', prompt: 'What is my favorite type of music to listen to when driving?' },
  { id: 'k5', category: 'favourites', prompt: 'What is my all-time favorite dessert or sweet treat?' },
  { id: 'k6', category: 'favourites', prompt: 'Which season of the year makes me happiest?' },
  { id: 'k7', category: 'favourites', prompt: 'What is my favorite room or spot in the house to relax?' },
  { id: 'k8', category: 'favourites', prompt: 'What is my absolute favorite pizza topping combination?' },
  { id: 'k9', category: 'favourites', prompt: 'Which animal would I choose if I could keep any harmless pet?' },
  { id: 'k10', category: 'favourites', prompt: 'What is my favorite scent or fragrance (e.g. vanilla, coffee, rain, pine)?' },

  { id: 'k11', category: 'habits', prompt: 'What is the very first thing I usually do after waking up?' },
  { id: 'k12', category: 'habits', prompt: 'What small habit of mine do I do without even noticing?' },
  { id: 'k13', category: 'habits', prompt: 'Am I a morning lark or a nighttime night owl?' },
  { id: 'k14', category: 'habits', prompt: 'How do I behave when I get very hungry (hangry)?' },
  { id: 'k15', category: 'habits', prompt: 'What app on my phone do I open the most often?' },
  { id: 'k16', category: 'habits', prompt: 'Do I pack my bags days in advance or at the very last minute?' },
  { id: 'k17', category: 'habits', prompt: 'What is my usual reaction when an alarm rings in the morning?' },
  { id: 'k18', category: 'habits', prompt: 'How many unread notifications or emails do I normally tolerate?' },
  { id: 'k19', category: 'habits', prompt: 'What do I tend to do when I am deep in thought or concentrating?' },
  { id: 'k20', category: 'habits', prompt: 'What is my go-to coping mechanism after a stressful day?' },

  { id: 'k21', category: 'memories', prompt: 'What was our funniest shared moment or inside joke together?' },
  { id: 'k22', category: 'memories', prompt: 'What is my favorite memory from our travels or dates together?' },
  { id: 'k23', category: 'memories', prompt: 'What was my initial impression of you when we first met?' },
  { id: 'k24', category: 'memories', prompt: 'What is the most thoughtful gift you have ever given me?' },
  { id: 'k25', category: 'memories', prompt: 'What is a childhood memory I have mentioned to you fondly?' },
  { id: 'k26', category: 'memories', prompt: 'What meal that we cooked together turned out the best (or the funniest disaster)?' },
  { id: 'k27', category: 'memories', prompt: 'Where were we the hardest we have ever laughed together?' },
  { id: 'k28', category: 'memories', prompt: 'What song immediately reminds me of a special time with you?' },
  { id: 'k29', category: 'memories', prompt: 'What is the first movie or show we watched together?' },
  { id: 'k30', category: 'memories', prompt: 'What was the first road trip or excursion we took together?' },

  { id: 'k31', category: 'personality', prompt: 'What is my biggest pet peeve that annoys me quickly?' },
  { id: 'k32', category: 'personality', prompt: 'What is a hidden talent or surprising skill I possess?' },
  { id: 'k33', category: 'personality', prompt: 'Am I more logical and analytical, or intuitive and spontaneous?' },
  { id: 'k34', category: 'personality', prompt: 'What kind of compliment makes me smile the brightest?' },
  { id: 'k35', category: 'personality', prompt: 'What is a topic or hobby I could talk about for hours?' },
  { id: 'k36', category: 'personality', prompt: 'What is my primary love language (words, quality time, gifts, acts, touch)?' },
  { id: 'k37', category: 'personality', prompt: 'How do I handle surprises (love them, tolerate them, or hate them)?' },
  { id: 'k38', category: 'personality', prompt: 'What fictional character is most like my personality?' },
  { id: 'k39', category: 'personality', prompt: 'What is something that always cheers me up no matter what?' },
  { id: 'k40', category: 'personality', prompt: 'What is a quirky fear or phobia of mine (e.g. spiders, heights, balloons)?' },

  { id: 'k41', category: 'future', prompt: 'What is the #1 bucket list country or destination I want to visit next?' },
  { id: 'k42', category: 'future', prompt: 'What new skill or hobby would I love to learn together?' },
  { id: 'k43', category: 'future', prompt: 'What does my ideal dream home look like (city penthouse, cozy cabin, beach house)?' },
  { id: 'k44', category: 'future', prompt: 'What is a project or adventure I want us to accomplish in the next five years?' },
  { id: 'k45', category: 'future', prompt: 'What concert, show, or sporting event do I dream of attending?' },
  { id: 'k46', category: 'future', prompt: 'If we could retire somewhere peaceful right now, where would I choose?' },
  { id: 'k47', category: 'future', prompt: 'What is something exciting I want us to celebrate together this year?' },
  { id: 'k48', category: 'future', prompt: 'What type of home garden, patio, or kitchen upgrade is on my wishlist?' }
];

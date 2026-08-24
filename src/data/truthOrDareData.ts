export type TruthOrDareType = 'truth' | 'dare';
export type TruthOrDareCategory = 'funny' | 'romantic' | 'conversation' | 'challenges';

export interface TruthOrDareCard {
  id: string;
  type: TruthOrDareType;
  category: TruthOrDareCategory;
  prompt: string;
}

export const TRUTH_OR_DARE_CARDS: TruthOrDareCard[] = [
  // FUNNY TRUTHS
  { id: 'td1', type: 'truth', category: 'funny', prompt: 'What is the most embarrassing thing you have searched on the internet recently?' },
  { id: 'td2', type: 'truth', category: 'funny', prompt: 'What silly nickname did your family call you growing up?' },
  { id: 'td3', type: 'truth', category: 'funny', prompt: 'What is a weird food combination that you secretly love?' },
  { id: 'td4', type: 'truth', category: 'funny', prompt: 'Have you ever practiced a dramatic speech or conversation in front of a bathroom mirror?' },
  { id: 'td5', type: 'truth', category: 'funny', prompt: 'What childish habit or superstition do you still secretly hold on to?' },
  { id: 'td6', type: 'truth', category: 'funny', prompt: 'What is the most clumsy accident or stumble you have had in public?' },

  // FUNNY DARES
  { id: 'td7', type: 'dare', category: 'funny', prompt: 'Do your best dramatic impression of me when I lose my phone or keys!' },
  { id: 'td8', type: 'dare', category: 'funny', prompt: 'Speak in a royal Victorian British accent for the next two rounds.' },
  { id: 'td9', type: 'dare', category: 'funny', prompt: 'Invent a 15-second commercial enthusiastically selling a random object in this room.' },
  { id: 'td10', type: 'dare', category: 'funny', prompt: 'Make 3 ridiculous facial expressions in 5 seconds and hold the last one.' },
  { id: 'td11', type: 'dare', category: 'funny', prompt: 'Sing the chorus of your favorite pop song in an opera singer style.' },
  { id: 'td12', type: 'dare', category: 'funny', prompt: 'Do a funny robot dance for 15 seconds without laughing.' },

  // ROMANTIC TRUTHS
  { id: 'td13', type: 'truth', category: 'romantic', prompt: 'What is your favorite physical feature of mine?' },
  { id: 'td14', type: 'truth', category: 'romantic', prompt: 'What was the exact moment you realized you had strong feelings for me?' },
  { id: 'td15', type: 'truth', category: 'romantic', prompt: 'What is your favorite memory of us from the past month?' },
  { id: 'td16', type: 'truth', category: 'romantic', prompt: 'What is one cute little thing I do that makes your heart flutter?' },
  { id: 'td17', type: 'truth', category: 'romantic', prompt: 'If you had to describe our relationship in 3 loving words, which would you pick?' },
  { id: 'td18', type: 'truth', category: 'romantic', prompt: 'What romantic gesture from a movie or book would you love us to recreate?' },

  // ROMANTIC DARES
  { id: 'td19', type: 'dare', category: 'romantic', prompt: 'Look into my eyes for 30 seconds straight without speaking or breaking eye contact.' },
  { id: 'td20', type: 'dare', category: 'romantic', prompt: 'Give me a warm 30-second hug and whisper a genuine compliment.' },
  { id: 'td21', type: 'dare', category: 'romantic', prompt: 'Give me a gentle hand or shoulder massage for 1 full minute.' },
  { id: 'td22', type: 'dare', category: 'romantic', prompt: 'Recite a 4-line spontaneous poem about how wonderful I am.' },
  { id: 'td23', type: 'dare', category: 'romantic', prompt: 'Slow-dance with me in place for 30 seconds to an imaginary romantic tune.' },
  { id: 'td24', type: 'dare', category: 'romantic', prompt: 'Plant 3 sweet kisses on my forehead, nose, and cheek.' },

  // CONVERSATION TRUTHS
  { id: 'td25', type: 'truth', category: 'conversation', prompt: 'What is a dream or passion you hope we pursue together in the future?' },
  { id: 'td26', type: 'truth', category: 'conversation', prompt: 'What life lesson or mindset change has had the biggest positive impact on you?' },
  { id: 'td27', type: 'truth', category: 'conversation', prompt: 'What is one topic you are deeply curious about and want to learn more of?' },
  { id: 'td28', type: 'truth', category: 'conversation', prompt: 'What does a truly meaningful and fulfilling day look like in your eyes?' },
  { id: 'td29', type: 'truth', category: 'conversation', prompt: 'If you could give your 16-year-old self one piece of gentle advice, what would it be?' },
  { id: 'td30', type: 'truth', category: 'conversation', prompt: 'What is a value or principle that guides how you treat people?' },

  // CONVERSATION DARES
  { id: 'td31', type: 'dare', category: 'conversation', prompt: 'Share a story from your childhood that you have never told me before.' },
  { id: 'td32', type: 'dare', category: 'conversation', prompt: 'Tell me 3 distinct things you are deeply grateful for right now in life.' },
  { id: 'td33', type: 'dare', category: 'conversation', prompt: 'Describe in vivid detail where you see us taking our dream anniversary trip.' },
  { id: 'td34', type: 'dare', category: 'conversation', prompt: 'Confess a hobby or quirky interest you have always wanted to secretly try.' },
  { id: 'td35', type: 'dare', category: 'conversation', prompt: 'Explain the plot of your favorite movie in under 30 seconds as excitedly as possible.' },

  // SILLY CHALLENGES DARES
  { id: 'td36', type: 'dare', category: 'challenges', prompt: 'Balance an object (like a spoon or pillow) on your head and walk across the room.' },
  { id: 'td37', type: 'dare', category: 'challenges', prompt: 'Do 10 rapid jumping jacks while cheering like a cheerleader!' },
  { id: 'td38', type: 'dare', category: 'challenges', prompt: 'Try not to blink or smile for 20 seconds while I make silly faces at you.' },
  { id: 'td39', type: 'dare', category: 'challenges', prompt: 'Try to juggle 2 small soft items for 10 seconds without dropping them.' },
  { id: 'td40', type: 'dare', category: 'challenges', prompt: 'Pretend you are a runway supermodel and strut across the room with maximum drama.' },
  { id: 'td41', type: 'dare', category: 'challenges', prompt: 'Recite the alphabet backwards as fast as you can until you get stuck.' },
  { id: 'td42', type: 'dare', category: 'challenges', prompt: 'Hold a yoga tree pose on one foot for 20 seconds while whistling or humming.' },
  { id: 'td43', type: 'dare', category: 'challenges', prompt: 'Give a 20-second motivational speech inspiring me to conquer the day.' },
  { id: 'td44', type: 'dare', category: 'challenges', prompt: 'Hum a famous pop song and have me guess which song it is in under 20 seconds.' },
  { id: 'td45', type: 'truth', category: 'conversation', prompt: 'What local food could you happily eat every week?' },
  { id: 'td46', type: 'truth', category: 'conversation', prompt: 'Which travel plan of ours excites you most?' },
  { id: 'td47', type: 'truth', category: 'conversation', prompt: 'What tiny kindness do you notice immediately?' },
  { id: 'td48', type: 'truth', category: 'conversation', prompt: 'Which habit would you most like to improve?' },
  { id: 'td49', type: 'truth', category: 'conversation', prompt: 'What song always changes your mood?' },
  { id: 'td50', type: 'truth', category: 'conversation', prompt: 'What is your funniest public-transport story?' },
  { id: 'td51', type: 'truth', category: 'conversation', prompt: 'Which childhood game should we play again?' },
  { id: 'td52', type: 'truth', category: 'conversation', prompt: 'What makes a home feel welcoming to you?' },
  { id: 'td53', type: 'truth', category: 'conversation', prompt: 'Which compliment do you remember most?' },
  { id: 'td54', type: 'truth', category: 'conversation', prompt: 'What would your ideal phone-free day include?' },
  { id: 'td55', type: 'truth', category: 'conversation', prompt: 'Which Indian city surprised you most?' },
  { id: 'td56', type: 'truth', category: 'conversation', prompt: 'What is a goal you want us to cheer for?' },
  { id: 'td57', type: 'truth', category: 'conversation', prompt: 'What harmless fear makes you laugh at yourself?' },
  { id: 'td58', type: 'truth', category: 'conversation', prompt: 'Which family recipe would you like to learn?' },
  { id: 'td59', type: 'truth', category: 'conversation', prompt: 'What spontaneous choice worked out brilliantly?' },
  { id: 'td60', type: 'truth', category: 'conversation', prompt: 'What do you value most in a good conversation?' },
  { id: 'td61', type: 'dare', category: 'challenges', prompt: 'Describe our last meal like a dramatic cricket commentator.' },
  { id: 'td62', type: 'dare', category: 'challenges', prompt: 'Perform a ten-second Bollywood-style victory dance.' },
  { id: 'td63', type: 'dare', category: 'challenges', prompt: 'Invent a catchy slogan for our relationship team.' },
  { id: 'td64', type: 'dare', category: 'challenges', prompt: 'Balance a cushion on your head for twenty seconds.' },
  { id: 'td65', type: 'dare', category: 'challenges', prompt: 'Give your partner three compliments beginning with different letters.' },
  { id: 'td66', type: 'dare', category: 'challenges', prompt: 'Act out ordering chai without using words.' },
  { id: 'td67', type: 'dare', category: 'challenges', prompt: 'Hum a film tune and let your partner guess it.' },
  { id: 'td68', type: 'dare', category: 'challenges', prompt: 'Create a two-line rhyme about today.' },
  { id: 'td69', type: 'dare', category: 'challenges', prompt: 'Do your best slow-motion celebration.' },
  { id: 'td70', type: 'dare', category: 'challenges', prompt: 'Tell a joke using only five words.' },
  { id: 'td71', type: 'dare', category: 'challenges', prompt: 'Pose like a movie poster for a photo-free ten seconds.' },
  { id: 'td72', type: 'dare', category: 'challenges', prompt: 'Name five foods in five seconds.' },
  { id: 'td73', type: 'dare', category: 'challenges', prompt: 'Imitate a train announcement for our dream destination.' },
  { id: 'td74', type: 'dare', category: 'challenges', prompt: 'Make up a handshake with your partner.' },
  { id: 'td75', type: 'dare', category: 'challenges', prompt: 'Speak like a sports commentator until your next turn.' },
  { id: 'td76', type: 'dare', category: 'challenges', prompt: 'Draw an imaginary heart in the air using your elbow.' },
];

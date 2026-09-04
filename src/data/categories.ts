export interface CategoryData {
  name: string;
  emoji: string;
  description: string;
  words: string[];
}

export const CATEGORIES: CategoryData[] = [
  {
    name: 'Animals',
    emoji: '🦁',
    description: 'Creatures of land, sky, and sea',
    words: [
      'Lion', 'Elephant', 'Penguin', 'Dolphin', 'Giraffe',
      'Kangaroo', 'Octopus', 'Cheetah', 'Owl', 'Wolf',
      'Chameleon', 'Platypus', 'Koala', 'Gorilla', 'Flamingo',
      'Hedgehog', 'Otter', 'Eagle', 'Panda', 'Shark',
      'Sloth', 'Tiger', 'Zebra', 'Fox', 'Rhinoceros',
      'Beaver', 'Walrus', 'Meerkat', 'Hummingbird', 'Crocodile',
      'Hyena', 'Armadillo', 'Leopard', 'Falcon', 'Seahorse',
      'Lemur', 'Pelican', 'Jaguar', 'Badger', 'Pufferfish'
    ]
  },
  {
    name: 'Food',
    emoji: '🍕',
    description: 'Dishes, snacks, and delicious treats',
    words: [
      'Pizza', 'Sushi', 'Tacos', 'Burger', 'Pancakes',
      'Ramen', 'Croissant', 'Lasagna', 'Donut', 'Burrito',
      'Spaghetti', 'Waffles', 'Guacamole', 'Curry', 'Cheesecake',
      'Sandwich', 'Paella', 'Dim Sum', 'Falafel', 'Brownie',
      'Fondue', 'Nuggets', 'Risotto', 'Pretzel', 'Nachos',
      'Crepes', 'Gelato', 'Shawarma', 'Dumplings', 'Enchiladas',
      'Baguette', 'Quesadilla', 'Tiramisu', 'Pad Thai', 'Omelette',
      'Macaron', 'Samosa', 'Churros', 'Hot Dog', 'Bao Bun'
    ]
  },
  {
    name: 'Countries',
    emoji: '🌍',
    description: 'Nations across the continents',
    words: [
      'Japan', 'Brazil', 'Canada', 'Egypt', 'France',
      'Australia', 'Germany', 'Mexico', 'Italy', 'India',
      'Iceland', 'Argentina', 'Norway', 'Spain', 'South Korea',
      'Greece', 'Morocco', 'Thailand', 'New Zealand', 'Switzerland',
      'Portugal', 'Kenya', 'Peru', 'Ireland', 'Vietnam',
      'Sweden', 'Chile', 'Jamaica', 'Turkey', 'Cuba',
      'Netherlands', 'Colombia', 'Austria', 'Finland', 'Singapore',
      'Madagascar', 'Croatia', 'Poland', 'South Africa', 'Philippines'
    ]
  },
  {
    name: 'Cities',
    emoji: '🏙️',
    description: 'Iconic world capitals and metropolises',
    words: [
      'Tokyo', 'Paris', 'New York', 'London', 'Rome',
      'Sydney', 'Cairo', 'Rio de Janeiro', 'Berlin', 'Barcelona',
      'Amsterdam', 'Dubai', 'Seoul', 'Venice', 'Toronto',
      'Istanbul', 'Bangkok', 'Kyoto', 'Buenos Aires', 'San Francisco',
      'Singapore', 'Vienna', 'Havana', 'Prague', 'Athens',
      'Cape Town', 'Dublin', 'Reykjavik', 'Lisbon', 'Chicago',
      'Hong Kong', 'Mumbai', 'Marrakech', 'Vancouver', 'Stockholm',
      'Edinburgh', 'Mexico City', 'Budapest', 'Miami', 'Oslo'
    ]
  },
  {
    name: 'Cars',
    emoji: '🏎️',
    description: 'Automakers, hypercars, and iconic rides',
    words: [
      'Ferrari', 'Porsche', 'Tesla', 'Lamborghini', 'Mustang',
      'Bugatti', 'Corvette', 'BMW', 'Mercedes', 'Aston Martin',
      'McLaren', 'Jeep', 'Audi', 'Rolls Royce', 'Maserati',
      'Bentley', 'Toyota', 'Subaru', 'Ford', 'Honda',
      'Alfa Romeo', 'Volvo', 'Cadillac', 'Jaguar', 'Land Rover',
      'Viper', 'Mini Cooper', 'Pagani', 'Koenigsegg', 'Volkswagen',
      'Lotus', 'Hyundai', 'Mazda', 'Chevrolet', 'Dodge',
      'Nissan GTR', 'Range Rover', 'Challenger', 'Supra', 'Camaro'
    ]
  },
  {
    name: 'Brands',
    emoji: '✨',
    description: 'Famous global brands and logos',
    words: [
      'Apple', 'Nike', 'Coca Cola', 'Lego', 'Google',
      'Disney', 'McDonalds', 'Nintendo', 'Sony', 'Amazon',
      'Starbucks', 'Adidas', 'Gucci', 'Netflix', 'IKEA',
      'Spotify', 'Rolex', 'PlayStation', 'Red Bull', 'Ferrari',
      'Samsung', 'Zara', 'Puma', 'Prada', 'Microsoft',
      'Instagram', 'YouTube', 'Chanel', 'Louis Vuitton', 'Pepsi',
      'Sephora', 'Marvel', 'Tesla', 'KFC', 'Subway',
      'Harley Davidson', 'Target', 'Uber', 'Airbnb', 'Nintendo Switch'
    ]
  },
  {
    name: 'Sports',
    emoji: '⚽',
    description: 'Athletics, games, and competitions',
    words: [
      'Soccer', 'Basketball', 'Tennis', 'Surfing', 'Boxing',
      'Volleyball', 'Golf', 'Baseball', 'Snowboarding', 'Swimming',
      'Rugby', 'Skateboarding', 'Gymnastics', 'Ice Hockey', 'Badminton',
      'Archery', 'Fencing', 'Cricket', 'Wrestling', 'Cycling',
      'Rowing', 'Skiing', 'Table Tennis', 'Rock Climbing', 'Karate',
      'Bowling', 'Judo', 'Track & Field', 'Water Polo', 'BMX',
      'Lacrosse', 'Handball', 'Dodgeball', 'Curling', 'Bobsled',
      'Weightlifting', 'Kayaking', 'Horse Racing', 'Polo', 'Padel'
    ]
  },
  {
    name: 'Movies',
    emoji: '🎬',
    description: 'Blockbusters, classics, and cinematic icons',
    words: [
      'Titanic', 'Inception', 'Avatar', 'Jurassic Park', 'The Matrix',
      'Star Wars', 'Gladiator', 'The Godfather', 'Pulp Fiction', 'Shrek',
      'Harry Potter', 'Interstellar', 'Jaws', 'The Avengers', 'Back to the Future',
      'Fight Club', 'Forrest Gump', 'Spider-Man', 'The Dark Knight', 'Lion King',
      'Ghostbusters', 'Toy Story', 'Alien', 'Indiana Jones', 'Lord of the Rings',
      'Finding Nemo', 'Coco', 'Up', 'Terminator', 'Top Gun',
      'Barbie', 'Oppenheimer', 'Pirates of the Caribbean', 'Rocky', 'Home Alone',
      'The Shining', 'Monsters Inc', 'Iron Man', 'Casablanca', 'Goodfellas'
    ]
  },
  {
    name: 'Video Games',
    emoji: '🎮',
    description: 'Legendary games and franchises',
    words: [
      'Minecraft', 'Super Mario', 'Zelda', 'Pokemon', 'Fortnite',
      'Grand Theft Auto', 'Tetris', 'Call of Duty', 'Sonic', 'Pac-Man',
      'Overwatch', 'Apex Legends', 'Elden Ring', 'Portal', 'God of War',
      'The Sims', 'League of Legends', 'Roblox', 'Skyrim', 'Halo',
      'Among Us', 'Dark Souls', 'Cyberpunk', 'Final Fantasy', 'Witcher',
      'Street Fighter', 'Mortal Kombat', 'Red Dead Redemption', 'Counter-Strike', 'Fallout',
      'Assassins Creed', 'Rocket League', 'Animal Crossing', 'Donkey Kong', 'Valorant',
      'Resident Evil', 'Super Smash Bros', 'Crash Bandicoot', 'Tomb Raider', 'Doom'
    ]
  },
  {
    name: 'Professions',
    emoji: '💼',
    description: 'Careers, vocations, and occupations',
    words: [
      'Astronaut', 'Doctor', 'Detective', 'Chef', 'Architect',
      'Pilot', 'Firefighter', 'Artist', 'Judge', 'Archaeologist',
      'Veterinarian', 'Photographer', 'Surgeon', 'Electrician', 'Scientist',
      'Journalist', 'Musician', 'Carpenter', 'Sailor', 'Librarian',
      'Diver', 'Barista', 'Paramedic', 'Choreographer', 'Mechanic',
      'Dentist', 'Plumber', 'Biologist', 'Actor', 'Flight Attendant',
      'Software Engineer', 'Professor', 'Sculptor', 'Florist', 'Sommelier',
      'Astronomer', 'Blacksmith', 'Meteorologist', 'Geologist', 'Magician'
    ]
  },
  {
    name: 'Objects',
    emoji: '📦',
    description: 'Everyday things and household items',
    words: [
      'Compass', 'Umbrella', 'Hourglass', 'Telescope', 'Guitar',
      'Camera', 'Mirror', 'Bicycle', 'Typewriter', 'Key',
      'Lantern', 'Scissors', 'Backpack', 'Microphone', 'Clock',
      'Binoculars', 'Sunglasses', 'Headphones', 'Lighter', 'Flashlight',
      'Candle', 'Teapot', 'Pocketknife', 'Briefcase', 'Globe',
      'Skateboard', 'Stapler', 'Boomerang', 'Padlock', 'Microscope',
      'Whistle', 'Magnifying Glass', 'Thermos', 'Chessboard', 'Metronome',
      'Palette', 'Stethoscope', 'Prism', 'Kaleidoscope', 'Canteen'
    ]
  },
  {
    name: 'Places',
    emoji: '🗺️',
    description: 'Locations, landscapes, and landmarks',
    words: [
      'Lighthouse', 'Pyramid', 'Colosseum', 'Eiffel Tower', 'Taj Mahal',
      'Grand Canyon', 'Castle', 'Subway Station', 'Observatory', 'Amusement Park',
      'Library', 'Museum', 'Airport', 'Harbor', 'Aquarium',
      'Volcano', 'Windmill', 'Cathedral', 'Skyscraper', 'Casino',
      'Palace', 'Zen Garden', 'Glacier', 'Oasis', 'Opera House',
      'Treehouse', 'Space Station', 'Vineyard', 'Bunker', 'Clock Tower',
      'Temple', 'Canyon', 'Ski Resort', 'Marketplace', 'Planetarium',
      'Monastery', 'Cavern', 'Bridge', 'Amphitheater', 'Ruins'
    ]
  },
  {
    name: 'Famous People',
    emoji: '⭐',
    description: 'Historical figures, icons, and legends',
    words: [
      'Einstein', 'Leonardo da Vinci', 'Shakespeare', 'Cleopatra', 'Mozart',
      'Beethoven', 'Picasso', 'Newton', 'Marie Curie', 'Frida Kahlo',
      'Darwin', 'Steve Jobs', 'Charlie Chaplin', 'Marilyn Monroe', 'Elvis Presley',
      'Michael Jackson', 'Julius Caesar', 'Napoleon', 'Vincent van Gogh', 'Alexander the Great',
      'Aristotle', 'Galileo', 'Jane Austen', 'Walt Disney', 'Nikola Tesla',
      'Nelson Mandela', 'Stephen Hawking', 'Amelia Earhart', 'Bob Marley', 'Freddie Mercury',
      'Mahatma Gandhi', 'Abraham Lincoln', 'Ada Lovelace', 'Marco Polo', 'Confucius',
      'Audrey Hepburn', 'Homer', 'Michelangelo', 'Louis Armstrong', 'Babe Ruth'
    ]
  },
  {
    name: 'Technology',
    emoji: '⚡',
    description: 'Inventions, hardware, and digital world',
    words: [
      'Smartphone', 'Robot', 'Drone', 'Satellite', 'Microchip',
      'Artificial Intelligence', 'Virtual Reality', 'Fiber Optics', 'Quantum Computer', 'Bluetooth',
      'Radar', 'Laser', '3D Printer', 'Solar Panel', 'Hologram',
      'Electric Battery', 'Cybernetics', 'Antenna', 'Router', 'Supercomputer',
      'Microprocessor', 'Cryptocurrency', 'Jet Engine', 'Semiconductor', 'Smartwatch',
      'Augmented Reality', 'Touchscreen', 'Gyroscope', 'GPS', 'Transistor',
      'Nanotechnology', 'Hovercraft', 'Neural Network', 'Sonar', 'Barcode',
      'Infrared', 'Biometrics', 'Fiberglass', 'Submersible', 'Magnetron'
    ]
  },
  {
    name: 'Nature',
    emoji: '🌿',
    description: 'Natural phenomena, wonders, and flora',
    words: [
      'Waterfall', 'Rainbow', 'Aurora Borealis', 'Lightning', 'Tornado',
      'Coral Reef', 'Rainforest', 'Desert', 'Glacier', 'Volcano',
      'Redwood Tree', 'Canyon', 'Hot Spring', 'Geyser', 'Tsunami',
      'Sand Dune', 'Bonsai', 'Meteor Shower', 'Sunflower', 'Orchid',
      'Stalactite', 'Bamboo', 'Wildfire', 'Eclipse', 'Fjord',
      'Mangrove', 'Evergreen', 'Avalanche', 'Lilypad', 'Sequoia',
      'Savanna', 'Cactus', 'Thunderstorm', 'Whirlpool', 'Lagoon',
      'Moss', 'Alpine Meadow', 'Shooting Star', 'Tundra', 'Petrified Forest'
    ]
  }
];

export function getRandomCategory(): CategoryData {
  const index = Math.floor(Math.random() * CATEGORIES.length);
  return CATEGORIES[index];
}

export function selectRoundWords(category: CategoryData): { words: string[]; secretWord: string; secretIndex: number } {
  // Shuffle words without mutating original
  const pool = [...category.words];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick exactly 20 words
  const words = pool.slice(0, 20);
  const secretIndex = Math.floor(Math.random() * 20);
  const secretWord = words[secretIndex];

  return { words, secretWord, secretIndex };
}

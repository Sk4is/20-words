export interface CategoryData {
  name: string;
  nameEs: string;
  emoji: string;
  description: string;
  words: string[];
}

export const CATEGORIES: CategoryData[] = [
  {
    name: 'Animals',
    nameEs: 'Animales',
    emoji: '🦁',
    description: 'Criaturas de tierra, cielo y mar',
    words: [
      'Tiburón', 'Pingüino', 'Gorila', 'Cocodrilo', 'Águila', 'León', 'Tigre', 'Elefante', 'Jirafa', 'Mono',
      'Delfín', 'Ballena', 'Pulpo', 'Serpiente', 'Lobo', 'Oso', 'Canguro', 'Tortuga', 'Caballo', 'Pollo',
      'Vaca', 'Cerdo', 'Oveja', 'Cabra', 'Perro', 'Gato', 'Conejo', 'Rata', 'Ratón', 'Hámster',
      'Pato', 'Ganso', 'Cisne', 'Loro', 'Paloma', 'Cuervo', 'Búho', 'Halcón', 'Flamenco', 'Avestruz',
      'Cebra', 'Rinoceronte', 'Hipopótamo', 'Guepardo', 'Leopardo', 'Pantera', 'Jaguar', 'Hiena', 'Zorro', 'Ciervo',
      'Alce', 'Camello', 'Dromedario', 'Llama', 'Perezoso', 'Koala', 'Ornitorrinco', 'Erizo', 'Nutria', 'Castor',
      'Morsa', 'Foca', 'Medusa', 'Estrella de mar', 'Cangrejo', 'Langosta', 'Calamar', 'Orca', 'Pez globo', 'Caballito de mar',
      'Camaleón', 'Iguana', 'Rana', 'Sapo', 'Murciélago', 'Abeja', 'Avispa', 'Hormiga', 'Mariposa', 'Escarabajo',
      'Araña', 'Escorpión', 'Búfalo', 'Suricata', 'Panda'
    ]
  },
  {
    name: 'Spanish Streamers & YouTubers',
    nameEs: 'Streamers y YouTubers españoles',
    emoji: '🎮',
    description: 'Creadores de contenido y streamers hispanos',
    words: [
      'Ibai Llanos', 'AuronPlay', 'ElRubius', 'IlloJuan', 'TheGrefg', 'DjMaRiiO', 'Alexby11', 'Mangel', 'Willyrex', 'Vegetta777',
      'Cristinini', 'Biyín', 'Rivers GG', 'Spursito', 'Knekro', 'Reven', 'Carola', 'ElXokas', 'Nil Ojeda', 'Plex',
      'Folagor', 'BarbeQ', 'Werlyb', 'Ander Cortés', 'Mayichi', 'Aroyitt', 'Siro López', 'Gerard Romero', 'Guanyar', 'Misho',
      'ViruZz', 'Ampeter', 'Vicens', 'Agustin51', 'Tarifa', 'AlphaSniper', 'Salva', 'Tiparraco', 'Wismichu', 'Loulogio',
      'Jordi Wild', 'Tri-line', 'Dalas Review', 'Paula Gonu', 'Marta Díaz', 'Lola Lolita', 'RoEnLaRed', 'JPelirrojo', 'YellowMellow', 'Celopan',
      'Nexxuz', 'Duxorethethird', 'Menos Trece', 'Outconsumer', 'Chuso Montero', 'Silithur', 'BaityBait', 'DayoScript', 'Alexelcapo', 'Felipez360',
      'Lynx Reviewer', 'Cheeto', 'Dario Eme Hache', 'Orslok', 'Mister Jägger', 'SpokSponha', 'Maximus', 'Pol Turrents', 'Keroro', 'Kolderiu',
      'Cacho01', 'RobertPG', 'Vituber', 'Toniemcee', 'Mostopapi', 'Peereira7', 'Luzu', 'Staxx', 'Zorman', 'Ales Gibaja',
      'YoSoyPlex', 'Ben Yart'
    ]
  },
  {
    name: 'Famous Movies',
    nameEs: 'Películas famosas',
    emoji: '🎬',
    description: 'Grandes clásicos y éxitos del cine',
    words: [
      'Titanic', 'Shrek', 'Avatar', 'Gladiator', 'Cars', 'Toy Story', 'Jurassic Park', 'The Matrix', 'Interstellar', 'Frozen',
      'El Rey León', 'Harry Potter', 'Star Wars', 'El Señor de los Anillos', 'Spider-Man', 'El Caballero Oscuro', 'Los Vengadores', 'Oppenheimer', 'Barbie', 'Coco',
      'Up', 'Buscando a Nemo', 'Monstruos S.A.', 'Los Increíbles', 'Ratatouille', 'WALL-E', 'Regreso al Futuro', 'Indiana Jones', 'Piratas del Caribe', 'Tiburón',
      'E.T.', 'Forrest Gump', 'Pulp Fiction', 'El Padrino', 'El Silencio de los Corderos', 'Cadena Perpetua', 'El Club de la Lucha', 'Origen (Inception)', 'El Show de Truman', 'La La Land',
      'Whiplash', 'Django Desencadenado', 'Malditos Bastardos', 'Salvar al Soldado Ryan', 'Terminator', 'Alien', 'Blade Runner', 'El Gran Showman', 'Bohemian Rhapsody', 'Joker',
      'El Lobo de Wall Street', 'Memento', 'Gran Torino', 'Scarface', 'Cazafantasmas', 'Solo en Casa', 'Los Juegos del Hambre', 'Crepúsculo', 'Fast & Furious', 'Misión Imposible',
      'John Wick', 'Top Gun', 'Rocky', 'Creed', 'Dune', 'Mad Max', 'El Pianista', 'La Vida es Bella', 'El Laberinto del Fauno', 'Lo Imposible',
      'Ocho Apellidos Vascos', 'La Sociedad de la Nieve', 'Torrente', 'Rec', 'Celda 211', 'Tesis', 'Campeones', 'Amélie', 'Parásitos', 'El Resplandor',
      'Psicosis', 'Scream', 'Saw', 'Pesadilla en Elm Street'
    ]
  },
  {
    name: 'Video Games',
    nameEs: 'Videojuegos',
    emoji: '🕹️',
    description: 'Juegos y sagas legendarias',
    words: [
      'Minecraft', 'GTA V', 'Fortnite', 'Among Us', 'Call of Duty', 'FIFA', 'Mario Kart', 'Pokémon', 'The Last of Us', 'Red Dead Redemption',
      'League of Legends', 'Valorant', 'Rocket League', 'Super Mario Bros', 'Zelda', 'World of Warcraft', 'Counter-Strike', 'Overwatch', 'Apex Legends', 'Clash Royale',
      'Brawl Stars', 'Fall Guys', 'Roblox', 'Elden Ring', 'Dark Souls', 'God of War', 'Cyberpunk 2077', 'Assassin\'s Creed', 'Halo', 'Fallout',
      'The Witcher 3', 'Skyrim', 'Resident Evil', 'Silent Hill', 'Tomb Raider', 'Uncharted', 'Metal Gear Solid', 'Final Fantasy', 'Street Fighter', 'Tekken',
      'Mortal Kombat', 'Super Smash Bros', 'Sonic', 'Pac-Man', 'Tetris', 'Space Invaders', 'Doom', 'Half-Life', 'Portal', 'BioShock',
      'Far Cry', 'Rainbow Six', 'Rust', 'ARK', 'Terraria', 'Stardew Valley', 'Animal Crossing', 'Los Sims', 'Hollow Knight', 'Celeste',
      'Cuphead', 'Undertale', 'Genshin Impact', 'Clash of Clans', 'Subway Surfers', 'Candy Crush', 'Geometry Dash', 'Need for Speed', 'Gran Turismo', 'Forza Horizon',
      'Dead by Daylight', 'Phasmophobia', 'Left 4 Dead', 'Payday', 'Subnautica', 'Sea of Thieves', 'Palworld', 'Baldur\'s Gate 3', 'Helldivers 2', 'Monster Hunter',
      'Dragon Ball FighterZ', 'Sekiro'
    ]
  },
  {
    name: 'Car Brands',
    nameEs: 'Marcas de coches',
    emoji: '🏎️',
    description: 'Fabricantes de coches y superdeportivos',
    words: [
      'Ferrari', 'BMW', 'Porsche', 'Lamborghini', 'Mercedes-Benz', 'Audi', 'Toyota', 'Honda', 'Ford', 'Tesla',
      'Nissan', 'McLaren', 'Bugatti', 'Bentley', 'Volkswagen', 'SEAT', 'Cupra', 'Renault', 'Peugeot', 'Citroën',
      'Fiat', 'Alfa Romeo', 'Maserati', 'Aston Martin', 'Rolls-Royce', 'Land Rover', 'Range Rover', 'Jaguar', 'Volvo', 'Mini Cooper',
      'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Chevrolet', 'Dodge', 'Jeep', 'Cadillac',
      'Chrysler', 'Lexus', 'Infiniti', 'Koenigsegg', 'Pagani', 'Lotus', 'Genesis', 'Dacia', 'Skoda', 'Opel',
      'DS Automobiles', 'Alpine', 'Abarth', 'Polestar', 'Lancia', 'Smart', 'Saab', 'Hummer', 'Pontiac', 'Lincoln',
      'GMC', 'RAM', 'Lucid', 'Rivian', 'BYD', 'MG', 'Geely', 'Chery', 'NIO', 'XPeng',
      'SsangYong', 'Tata', 'Lada', 'Morgan', 'Caterham', 'Viper', 'Mustang', 'Corvette', 'Camaro', 'Supra'
    ]
  },
  {
    name: 'Food & Dishes',
    nameEs: 'Comida y platos',
    emoji: '🍕',
    description: 'Gastronomía, platos típicos y delicias',
    words: [
      'Pizza', 'Sushi', 'Paella', 'Hamburguesa', 'Kebab', 'Tacos', 'Pasta', 'Ramen', 'Croquetas', 'Tortilla de patatas',
      'Lasaña', 'Chuletón', 'Churros', 'Burrito', 'Jamón ibérico', 'Gazpacho', 'Salmorejo', 'Fabada asturiana', 'Cocido madrileño', 'Pulpo a la gallega',
      'Patatas bravas', 'Calamares a la romana', 'Ensaladilla rusa', 'Empanada', 'Canelones', 'Risotto', 'Espaguetis carbonara', 'Tiramisú', 'Crepes', 'Gofres',
      'Tarta de queso', 'Brownie', 'Helado', 'Donut', 'Croissant', 'Hot Dog', 'Nachos', 'Guacamole', 'Quesadilla', 'Fajitas',
      'Enchiladas', 'Ceviche', 'Arepas', 'Empanadas argentinas', 'Asado', 'Choripán', 'Feijoada', 'Shawarma', 'Falafel', 'Hummus',
      'Cuscús', 'Moussaka', 'Curry', 'Pad Thai', 'Rollito de primavera', 'Dumplings', 'Dim Sum', 'Pollo frito', 'Costillas barbacoa', 'Albóndigas',
      'Lentejas', 'Callos', 'Rabo de toro', 'Huevos rotos', 'Torrijas', 'Arroz con leche', 'Flan', 'Crema catalana', 'Natillas', 'Churrasco',
      'Tartar de salmón', 'Tartar de atún', 'Carpaccio', 'Fondue', 'Baguette', 'Sandwich mixto', 'Nuggets', 'Alitas de pollo', 'Salchipapas', 'Pisto',
      'Cachopo', 'Solomillo al punto'
    ]
  },
  {
    name: 'Countries',
    nameEs: 'Países',
    emoji: '🌍',
    description: 'Naciones de todo el mundo',
    words: [
      'España', 'Japón', 'Brasil', 'Australia', 'Egipto', 'Estados Unidos', 'Italia', 'Francia', 'Alemania', 'Argentina',
      'México', 'China', 'Canadá', 'Marruecos', 'Noruega', 'Reino Unido', 'Portugal', 'Grecia', 'Países Bajos', 'Bélgica',
      'Suiza', 'Austria', 'Suecia', 'Dinamarca', 'Finlandia', 'Irlanda', 'Polonia', 'República Checa', 'Hungría', 'Rumanía',
      'Croacia', 'Turquía', 'Rusia', 'Ucrania', 'India', 'Corea del Sur', 'Tailandia', 'Vietnam', 'Indonesia', 'Filipinas',
      'Singapur', 'Malasia', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia',
      'Cuba', 'República Dominicana', 'Costa Rica', 'Panamá', 'Jamaica', 'Sudáfrica', 'Nigeria', 'Kenia', 'Senegal', 'Ghana',
      'Argelia', 'Túnez', 'Arabia Saudí', 'Emiratos Árabes', 'Qatar', 'Israel', 'Jordania', 'Nueva Zelanda', 'Islandia', 'Mónaco',
      'Andorra', 'Vaticano', 'Luxemburgo', 'Chipre', 'Malta', 'Líbano', 'Escocia', 'Gales', 'Serbia', 'Eslovaquia',
      'Bulgaria', 'Georgia'
    ]
  },
  {
    name: 'Fictional Characters',
    nameEs: 'Personajes ficticios',
    emoji: '🦸',
    description: 'Héroes, villanos y personajes míticos',
    words: [
      'Batman', 'Shrek', 'Goku', 'Spider-Man', 'Darth Vader', 'Mario', 'Homer Simpson', 'Harry Potter', 'Superman', 'Pikachu',
      'Iron Man', 'Deadpool', 'Bob Esponja', 'Mickey Mouse', 'Joker', 'Sherlock Holmes', 'James Bond', 'Jack Sparrow', 'Gandalf', 'Frodo',
      'Legolas', 'Gollum', 'Luke Skywalker', 'Yoda', 'Han Solo', 'Princesa Leia', 'Voldemort', 'Hermione Granger', 'Ron Weasley', 'Capitán América',
      'Thor', 'Hulk', 'Lobezno (Wolverine)', 'Thanos', 'Flash', 'Wonder Woman', 'Harley Quinn', 'Venom', 'Sonic', 'Luigi',
      'Bowser', 'Yoshi', 'Link', 'Zelda', 'Donkey Kong', 'Kratos', 'Geralt de Rivia', 'Master Chief', 'Lara Croft', 'Arthur Morgan',
      'Carl Johnson (CJ)', 'Nathan Drake', 'Steve', 'Pac-Man', 'Crash Bandicoot', 'Spyro', 'Ash Ketchum', 'Naruto', 'Sasuke', 'Luffy',
      'Zoro', 'Vegeta', 'Sailor Moon', 'Doraemon', 'Shin-chan', 'Patricio Estrella', 'Calamardo', 'Bart Simpson', 'Peter Griffin', 'Stewie Griffin',
      'Shaggy', 'Scooby-Doo', 'Buzz Lightyear', 'Woody', 'Elsa', 'Fiona', 'Asno', 'Gru', 'Los Minions', 'El Grinch',
      'Wall-E', 'Tarzán'
    ]
  },
  {
    name: 'Football Players',
    nameEs: 'Futbolistas',
    emoji: '⚽',
    description: 'Estrellas y leyendas del fútbol',
    words: [
      'Messi', 'Cristiano Ronaldo', 'Mbappé', 'Haaland', 'Lamine Yamal', 'Neymar', 'Vinícius Jr.', 'Modrić', 'Iniesta', 'Xavi',
      'Zidane', 'Ronaldinho', 'Maradona', 'Pelé', 'Bellingham', 'Rodri', 'De Bruyne', 'Benzema', 'Lewandowski', 'Luis Suárez',
      'Sergio Ramos', 'Casillas', 'Buffon', 'Neuer', 'Courtois', 'Ter Stegen', 'Alisson', 'Carvajal', 'Kroos', 'Busquets',
      'Casemiro', 'Gavi', 'Pedri', 'Valverde', 'Camavinga', 'Tchouaméni', 'Griezmann', 'Morata', 'Nico Williams', 'Julián Álvarez',
      'Lautaro Martínez', 'Dybala', 'Di María', 'Dibu Martínez', 'Bernardo Silva', 'Bruno Fernandes', 'Salah', 'Mané', 'Son Heung-min', 'Harry Kane',
      'Saka', 'Foden', 'Palmer', 'Declan Rice', 'Van Dijk', 'Rüdiger', 'Saliba', 'Theo Hernández', 'Alphonso Davies', 'Hakimi',
      'Puyol', 'Piqué', 'Roberto Carlos', 'Cafú', 'Dani Alves', 'Maldini', 'Cannavaro', 'Beckenbauer', 'Cruyff', 'Ronaldo Nazário',
      'Romário', 'Henry', 'Kaká', 'Rivaldo', 'Figo', 'Raúl González', 'David Villa', 'Fernando Torres', 'Agüero', 'Ibrahimović',
      'Rooney', 'Beckham'
    ]
  },
  {
    name: 'Famous Brands',
    nameEs: 'Marcas famosas',
    emoji: '✨',
    description: 'Marcas y empresas reconocidas mundialmente',
    words: [
      'Apple', 'Nike', 'IKEA', 'Red Bull', 'Netflix', 'Adidas', 'Google', 'Microsoft', 'Amazon', 'Pepsi',
      'Coca-Cola', 'Spotify', 'YouTube', 'Rolex', 'Disney', 'McDonald\'s', 'Burger King', 'KFC', 'Subway', 'Starbucks',
      'Zara', 'Mango', 'Pull&Bear', 'Bershka', 'Stradivarius', 'H&M', 'Primark', 'Shein', 'Gucci', 'Louis Vuitton',
      'Prada', 'Chanel', 'Balenciaga', 'Dior', 'Versace', 'Hermès', 'Cartier', 'Sephora', 'L\'Oréal', 'Nivea',
      'Gillette', 'PlayStation', 'Xbox', 'Nintendo', 'Samsung', 'Sony', 'LG', 'Huawei', 'Xiaomi', 'Intel',
      'AMD', 'Nvidia', 'HP', 'Dell', 'Lenovo', 'Asus', 'Canon', 'GoPro', 'Lego', 'Hasbro',
      'Mattel', 'Barbie', 'Hot Wheels', 'Monster Energy', 'Heineken', 'Corona', 'Nespresso', 'Nestlé', 'Danone', 'Nutella',
      'Oreo', 'Doritos', 'Lay\'s', 'Pringles', 'Mercadona', 'Carrefour', 'Lidl', 'El Corte Inglés', 'Uber', 'Airbnb',
      'Visa', 'Mastercard'
    ]
  },
  {
    name: 'Everyday Objects',
    nameEs: 'Objetos cotidianos',
    emoji: '📦',
    description: 'Artículos del día a día y del hogar',
    words: [
      'Paraguas', 'Microondas', 'Martillo', 'Espejo', 'Aspiradora', 'Cepillo de dientes', 'Mando a distancia', 'Almohada', 'Tijeras', 'Nevera',
      'Mochila', 'Llave', 'Lámpara', 'Tenedor', 'Cuchillo', 'Cuchara', 'Sartén', 'Olla', 'Plancha', 'Secador de pelo',
      'Toalla', 'Peine', 'Champú', 'Jabón', 'Papel higiénico', 'Grifo', 'Ducha', 'Lavadora', 'Lavavajillas', 'Tostadora',
      'Cafetera', 'Batidora', 'Abrebotellas', 'Sacacorchos', 'Reloj de pulsera', 'Despertador', 'Gafas de sol', 'Cartera', 'Monedero', 'Cinturón',
      'Zapatos', 'Zapatillas', 'Calcetines', 'Sombrero', 'Gorra', 'Chaqueta', 'Abrigo', 'Bolígrafo', 'Lápiz', 'Goma de borrar',
      'Cuaderno', 'Cinta adhesiva', 'Destornillador', 'Alicates', 'Llave inglesa', 'Linterna', 'Vela', 'Mechero', 'Cerillas', 'Cubo de basura',
      'Escoba', 'Fregona', 'Recogedor', 'Cojín', 'Manta', 'Sábana', 'Colchón', 'Percha', 'Maleta', 'Felpudo',
      'Termo', 'Taza', 'Vaso', 'Copa', 'Plato', 'Servilleta', 'Mantel', 'Maceta', 'Regadera', 'Grapadora',
      'Tijeras de papel', 'Pinzas'
    ]
  },
  {
    name: 'Places',
    nameEs: 'Lugares',
    emoji: '📍',
    description: 'Espacios y lugares donde puedes estar',
    words: [
      'Hospital', 'Discoteca', 'Aeropuerto', 'Gimnasio', 'Cárcel', 'Colegio', 'Playa', 'Supermercado', 'Cine', 'Hotel',
      'Restaurante', 'Estadio', 'Iglesia', 'Oficina', 'Parque de atracciones', 'Biblioteca', 'Museo', 'Teatro', 'Zoológico', 'Acuario',
      'Farmacia', 'Gasolinera', 'Estación de tren', 'Estación de autobús', 'Puerto', 'Faro', 'Comisaría', 'Parque de bomberos', 'Centro comercial', 'Cementerio',
      'Banco', 'Ayuntamiento', 'Juzgado', 'Universidad', 'Guardería', 'Bar', 'Cafetería', 'Pizzería', 'Panadería', 'Carnicería',
      'Pescadería', 'Frutería', 'Taller mecánico', 'Peluquería', 'Spa', 'Casino', 'Castillo', 'Palacio', 'Fortaleza', 'Cueva',
      'Montaña', 'Volcán', 'Bosque', 'Selva', 'Desierto', 'Isla', 'Río', 'Lago', 'Cascada', 'Pantano',
      'Mirador', 'Plaza mayor', 'Calle peatonal', 'Autopista', 'Túnel', 'Puente', 'Rascacielos', 'Terraza', 'Azotea', 'Sótano',
      'Ático', 'Cocina', 'Baño', 'Dormitorio', 'Salón', 'Garaje', 'Jardín', 'Piscina', 'Pista de pádel', 'Cabaña',
      'Campamento', 'Refugio'
    ]
  },
  {
    name: 'Professions',
    nameEs: 'Profesiones',
    emoji: '💼',
    description: 'Oficios, carreras y trabajos',
    words: [
      'Policía', 'Médico', 'Astronauta', 'Profesor', 'Piloto', 'Bombero', 'Cocinero', 'Abogado', 'Mecánico', 'Arquitecto',
      'Agricultor', 'Dentista', 'Actor', 'Programador', 'Fotógrafo', 'Enfermero', 'Cirujano', 'Farmacéutico', 'Veterinario', 'Psicólogo',
      'Juez', 'Fiscal', 'Detective', 'Militar', 'Guardia Civil', 'Marinero', 'Camionero', 'Taxista', 'Conductor de autobús', 'Maquinista',
      'Fontanero', 'Electricista', 'Carpintero', 'Albañil', 'Pintor', 'Soldador', 'Cerrajero', 'Jardinero', 'Basurero', 'Barrendero',
      'Camarero', 'Barista', 'Sommelier', 'Panadero', 'Pastelero', 'Carnicero', 'Pescadero', 'Cajero', 'Dependiente', 'Diseñador gráfico',
      'Periodista', 'Escritor', 'Traductor', 'Músico', 'Cantante', 'Bailarín', 'Escultor', 'Director de cine', 'Locutor', 'Presentador',
      'Científico', 'Biólogo', 'Químico', 'Físico', 'Astrónomo', 'Geólogo', 'Arqueólogo', 'Historiador', 'Filósofo', 'Economista',
      'Contable', 'Banquero', 'Agente inmobiliario', 'Entrenador personal', 'Árbitro', 'Guía turístico', 'Azafata de vuelo', 'Recepcionista', 'Guardaespaldas', 'Barbero',
      'Fisioterapeuta', 'Carpintero de ribera'
    ]
  },
  {
    name: 'Famous Artists',
    nameEs: 'Artistas famosos',
    emoji: '🎤',
    description: 'Cantantes y estrellas de la música mundial y en español',
    words: [
      'Post Malone',
      'Michael Jackson',
      'Eminem',
      'The Weeknd',
      'Taylor Swift',
      'Drake',
      'Justin Bieber',
      'Bruno Mars',
      'Rihanna',
      'Beyoncé',
      'Lady Gaga',
      'Ariana Grande',
      'Billie Eilish',
      'Ed Sheeran',
      'Kanye West',
      'Travis Scott',
      'Shakira',
      'Bad Bunny',
      'Rosalía',
      'Freddie Mercury'
    ]
  },
  {
    name: 'Random Things',
    nameEs: 'Cosas random',
    emoji: '🎲',
    description: 'Conceptos inesperados, divertidos y variados',
    words: [
      'Wi-Fi', 'Resaca', 'Tatuaje', 'Multa', 'OVNI', 'Ataúd', 'Preservativo', 'Semáforo', 'Lotería', 'Boda',
      'Retrete', 'Tinder', 'Alarma', 'Dinero', 'Fantasma', 'Examen', 'Casino', 'Helicóptero', 'Grafiti', 'Resbalón',
      'Siesta', 'Apuesta', 'Pesadilla', 'Vómito', 'Divorcio', 'Funeral', 'Bautizo', 'Dentadura postiza', 'Hipoteca', 'Cono de tráfico',
      'Maniquí', 'Dron', 'Píldora del día después', 'Papelera', 'Chicle pegado', 'Bucle temporal', 'Parálisis del sueño', 'Déjà vu', 'Karma', 'Spoiler',
      'Meme', 'TikTok', 'Filtro de Instagram', 'Cuenta en números rojos', 'Criptomoneda', 'Hacker', 'Terraplanista', 'Zombi', 'Apocalipsis', 'Agujero negro',
      'Máquina del tiempo', 'Cápsula del tiempo', 'Mensaje en una botella', 'Naufragio', 'Ruleta rusa', 'Detector de mentiras', 'Espía', 'Secuestro', 'Rescate', 'Paracaídas',
      'Puenting', 'Cirugía estética', 'Bótox', 'Peluca', 'Tatuaje carcelario', 'Calvicie', 'Ronquido', 'Sonambulismo', 'Ataque de risa', 'Tierra trágame',
      'Trillizos', 'Falsa alarma', 'Cuarentena', 'Confinamiento', 'Terremoto', 'Lluvia de meteoritos', 'Eclipse solar', 'Pirámide alienígena', 'Espejismo', 'Gordo de Navidad',
      'Borrachera', 'Pelea de bar'
    ]
  }
];

export function getRandomCategory(previousCategoryName?: string | null): CategoryData {
  let available = CATEGORIES;
  if (previousCategoryName && CATEGORIES.length > 1) {
    const filtered = CATEGORIES.filter(
      c => c.name !== previousCategoryName && c.nameEs !== previousCategoryName
    );
    if (filtered.length > 0) {
      available = filtered;
    }
  }
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

export function selectRoundWords(
  category: CategoryData,
  recentSecretWords: string[] = []
): { words: string[]; secretWord: string; secretIndex: number } {
  // Fisher-Yates shuffle of the entire category pool
  const pool = [...category.words];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Select exactly 20 unique words from the larger pool
  const words = pool.slice(0, 20);

  // Additional independent shuffle of the 20 words for grid placement
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }

  // Prioritize choosing a secret word that was not recently used
  const recentSet = new Set(recentSecretWords.map(w => w.toLowerCase()));
  const candidateIndices: number[] = [];
  for (let i = 0; i < words.length; i++) {
    if (!recentSet.has(words[i].toLowerCase())) {
      candidateIndices.push(i);
    }
  }

  const secretIndex = candidateIndices.length > 0
    ? candidateIndices[Math.floor(Math.random() * candidateIndices.length)]
    : Math.floor(Math.random() * words.length);

  const secretWord = words[secretIndex];

  return { words, secretWord, secretIndex };
}

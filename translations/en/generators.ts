
import { ActorAge } from '../../types';
import { TranslationType } from '../types';

export const generators: Pick<TranslationType, 'scriptGen'> = {
  scriptGen: {
      adjectives: [
        'Silent', 'Quantum', 'Galactic', 'Last', 'Ashen', 'Neon', 'Fractured', 'Solaris', 'Steelheart', 'Diamond', 'Winter\'s', 'Cybernetic', 'Gilded', 'Crimson', 'Forgotten', 'Eternal', 'Hollow', 'Obsidian', 'Sunken', 'Whispering',
        'Scarlet', 'Ivory', 'Jade', 'Azure', 'Midnight', 'Electric', 'Zero', 'Final', 'Broken', 'Lost', 'Seventh', 'Ebon', 'Hunted', 'Shattered', 'Frozen', 'Burning', 'Secret', 'Perfect', 'Human', 'Dark', 'Blind', 'Glass',
        'Chrome', 'Deadly', 'Invisible', 'Unspoken', 'Fallen', 'Golden', 'Iron', 'Crystal', 'Shadow', 'Twisted', 'Scarred', 'Distant', 'Ancient', 'First', 'Second', 'Third', 'Bleeding', 'Empty', 'Cold', 'Red', 'White',
        'Black', 'Blue', 'Green', 'Gray', 'Furious', 'Unforgiven', 'Unbound', 'Terminal', 'Omega', 'Alpha', 'Deep', 'Rogue', 'Primal', 'Savage', 'Digital', 'Virtual'
    ],
      nouns: [
        'Echo', 'Signal', 'Horizon', 'Renegade', 'Serenade', 'Drift', 'Empire', 'Cipher', 'Ghost', 'Rebellion', 'Protocol', 'Abyss', 'Dragon', 'Paradox', 'Serpent', 'Solstice', 'Gate', 'Dawn', 'Behemoth', 'Void', 'Titan',
        'Samurai', 'Pact', 'Mandate', 'Legacy', 'Prophecy', 'Labyrinth', 'Neptune', 'Cage', 'Skies', 'Witness', 'Sanctum', 'Nemesis', 'Vanguard', 'Exodus', 'Requiem', 'Gambit', 'Covenant', 'Paradigm', 'Nexus', 'Harbinger',
        'Oracle', 'Zenith', 'Vertex', 'Odyssey', 'Mirage', 'Sentinel', 'Machine', 'Child', 'Man', 'Woman', 'Heir', 'Throne', 'Key', 'Star', 'Sun', 'Moon', 'Planet', 'Comet', 'Nebula', 'Galaxy', 'Universe', 'Heart', 'Soul',
        'Mind', 'Memory', 'Dream', 'Nightmare', 'War', 'Peace', 'Love', 'Hate', 'Fear', 'Hope', 'Destiny', 'Fate', 'Curse', 'Blessing', 'Game', 'Player', 'Pawn', 'King', 'Queen', 'Soldier', 'Thief', 'Hunter', 'Angel', 'Demon'
    ],
      concepts: [
        'Rising', 'Gambit', 'Anomaly', 'Initiative', 'Requiem', 'Legacy', 'Curse', 'Awakening', 'Ascension', 'Descent', 'Redemption', 'Vendetta', 'Retribution', 'Illusion', 'Directive', 'Uprising', 'Extinction', 'Protocol',
        'Sanction', 'Variante', 'Agenda', 'Manifesto', 'Hypothesis', 'Theorem', 'Equation', 'Incident', 'Reckoning', 'Judgement', 'Fall', 'Dawn', 'Endgame', 'Beginning', 'Revolution', 'Evolution', 'Genesis', 'Exodus',
        'Conspiracy', 'Theory', 'Experiment', 'Variable', 'Constant', 'Paradox', 'Truth', 'Lie', 'Secret', 'Revelation'
    ],
      templates: [
        'The {a} {n}',
        '{n}\'s {c}',
        '{a} {c}',
        'Project: {n}',
        'The {n} Protocol',
        'Chronicles of the {a} {n}',
    ],
      plots: {
          "Action": [
            {
                text: "A retired agent must return from retirement to uncover a global conspiracy. His hunt takes him across Europe and forces him to confront his own past.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A group of elite soldiers is sent on an impossible mission behind enemy lines. When the mission fails, they must not only fight for survival but also against each other.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A cop is falsely accused of a crime and must flee. To prove his innocence, he must find the real perpetrator while being hunted by the police and the mafia.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "When terrorists occupy a skyscraper, a delivery girl who happens to be present becomes the only hope for the hostages. She must summon all her courage to thwart the criminals' plans.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A master thief plans one last, spectacular heist. But an unpredictable rival and a tenacious Interpol agent make his life difficult.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A retired assassin is reactivated when his family is threatened. He leaves a trail of devastation in search of those responsible.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
                supportingRole: { gender: 'weiblich', age: ActorAge.Child }
            },
        ],
          "Abenteuer": [
            {
                text: "A young archaeologist discovers an ancient map that leads her on a hunt for a legendary lost treasure. However, a rival collector is hot on her heels.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A cartographer is stranded on a mysterious, unexplored island full of prehistoric creatures. He must find a way to escape the island with the other survivors.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "An orphan boy discovers that he is the descendant of a famous pirate. Together with an old sailor, he sets out in search of his ancestor's cursed treasure.",
                mainRole: { gender: 'männlich', age: ActorAge.Child },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A historian accidentally travels back in time to ancient Egypt. She must find a way back to her time without changing history.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A pilot crashes in the Amazon jungle and must make his way through the wilderness alone. He fights against wild animals and the elements to find his way back to civilization.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "Two rival explorers race to the North Pole. It is a race against time and merciless nature to be the first to reach a legendary place.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
        ],
          "Komödie": [
            {
                text: "Two disparate misfits have to pose as babysitters for a hyperactive child. It's a weekend full of disasters that tests their friendship.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A stressed family father decides to go on a road trip with his dysfunctional family. What was planned as a relaxing holiday ends in total chaos.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A shy office worker is accidentally mistaken for a super spy. He must now save the world without having the slightest idea what he is doing.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A group of friends wakes up after a night of partying with no memory. They have to reconstruct the events to explain a missing friend and a tiger in the bathroom.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "An ambitious journalist has to go undercover back to her old high school. She realizes that nothing has changed and she is still an outsider.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A cursed lawyer cannot lie for a day. This puts his career and his relationships in danger, but also leads to hilarious truths.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
        ],
          "Krimi": [
            {
                text: "A brilliant but tormented detective hunts a cunning serial killer who leaves cryptic clues. As he delves deeper into the case, the killer begins a personal game with him.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A group of master thieves plans to break into the world's most secure vault. But betrayal within their own ranks threatens to destroy the perfect plan.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A young lawyer defends a man accused of murder. Soon she doubts his innocence and uncovers a conspiracy that puts herself in danger.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "An undercover cop infiltrates a powerful mafia family. He gets into a deep conflict between his duty and his new loyalty to the godfather's family.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A private investigator in the 1940s is hired by a mysterious femme fatale. She becomes entangled in a web of lies, corruption, and murder in high society.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A retired investigator is caught up by an unsolved case when a copycat killer appears. He must face his old demons to catch the new killer.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
        ],
          "Dokumentation": [
            {
                text: "An in-depth investigation into the life of a reclusive billionaire. Interviews with former employees paint a picture of a genius on the brink of madness.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
            },
            {
                text: "The true story of a group of mountaineers who dared an impossible first ascent. With original footage and emotional interviews of the survivors.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
            },
            {
                text: "A look behind the scenes of the development of a revolutionary video game. The film shows the pressure and passion of the small development team.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
            },
            {
                text: "The chronicle of the rise and fall of an ancient civilization. State-of-the-art CGI reconstructions bring a lost world back to life.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
            },
        ],
          "Drama": [
            {
                text: "A family is torn apart by a tragic secret. Years later, the estranged siblings must pull themselves together to find the truth.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A dedicated teacher fights the system to inspire a group of disadvantaged students. He risks his career to give them a future.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "The true story of a man who was wrongly convicted and spends decades in prison. His unwavering fight for freedom becomes an inspiration for a whole nation.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "An aging musician gets one last chance at fame. He discovers a young, talented singer and has to decide whether to promote her or use her ideas for himself.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A Wall Street broker is consumed by his greed and risks everything for a deal. He loses not only his money but also his family and has to start over.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A young woman in the 19th century fights against social conventions. She wants to become a doctor and has to assert herself against her family and the male-dominated university.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
        ],
          "Fantasy": [
            {
                text: "A simple farm boy discovers that he is the chosen one to defeat a dark empire. An old wizard becomes his mentor on this dangerous journey.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A young sorceress must embark on a journey to find a rare ingredient for a potion. She is accompanied by a charming but unreliable thief.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "An aging dragon hunter is recruited for one last mission. He must kill a beast terrorizing a kingdom and is supported by the young queen.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A girl falls through a portal into a parallel world where magic is real. To get home, she must help an overthrown prince reclaim his throne.",
                mainRole: { gender: 'weiblich', age: ActorAge.Child },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A group of disparate heroes - an elf, a dwarf, and a human - must join forces. They must destroy a powerful, dark artifact before it annihilates the world.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A fairy is banished from her realm and must survive in the world of humans. She befriends a cynical journalist who helps her find her way back.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
        ],
          "Horror": [
            {
                text: "A group of friends accidentally unleashes an ancient demon in a remote cabin. The night turns into a bloody fight for survival against an overpowering force.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A family moves into an old house and soon realizes that it is haunted by a vengeful spirit. The spirit targets their youngest child and terrorizes the family.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Child }
            },
            {
                text: "A team of paranormal investigators gets locked in an abandoned asylum. What starts as a routine investigation turns into a nightmare when the history of the place comes to life.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A man finds an old videotape that triggers a curse. He has only seven days to solve the mystery before a ghostly girl haunts him.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A serial killer with supernatural powers terrorizes a small town on Halloween. A young babysitter must face him to protect the children and herself.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "After a car accident, a woman wakes up in the basement of a man who claims the outside world is uninhabitable. She must find out if he is telling the truth or is a psychopath.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
        ],
          "Musical": [
            {
                text: "An aspiring singer and a disillusioned jazz pianist fall in love in L.A. Their careers develop in different directions and put their love to the test.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A poor poet in 19th century Paris falls in love with the star of a nightclub. Their love is threatened by a jealous duke who does everything to separate them.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A young woman invites three men from her mother's past to a Greek island. She wants to find out who her father is before she gets married.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "An ambitious ringmaster puts together the greatest show on earth. He fights against prejudice and financial problems to realize his dream.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
        ],
          "Romanze": [
            {
                text: "Two people from different social classes meet by chance and fall in love. They have to fight against the prejudices of their families and friends to be together.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A man and a woman who have known each other since childhood only realize after years that they are meant for each other. But life and other partners have repeatedly separated them.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A cynical greeting card writer who doesn't believe in love falls in love with a man. He is the exact opposite of her and shows her what it means to truly love.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "Two fierce professional rivals are forced to work together on a project. An unexpected attraction slowly develops from initial dislike.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A woman travels to Italy after the end of a long relationship to find herself. There she falls in love with a charming local and learns to enjoy life again.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A man with the ability to time travel keeps trying to create the perfect moment. He wants to win the woman of his dreams, but fate is complicated.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
        ],
          "Sci-Fi": [
            {
                text: "The crew of a spaceship discovers an alien life form. It turns out to be far more intelligent and dangerous than they thought and begins to decimate the crew.",
                mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "In a dystopian future where feelings are suppressed, a man begins to feel forbidden emotions. He joins a rebellion to overthrow the system.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A scientist invents a time machine to prevent a personal tragedy. But his actions have catastrophic effects on the future of all mankind.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A replicant, an artificial human, is hunted while trying to find his creator. A disillusioned Blade Runner is on his heels.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A hacker discovers that the world is a computer simulation. He joins a group of rebels to free humanity from digital slavery.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "An astronaut is stranded alone on Mars. He must use his wits and engineering skills to survive until a rescue mission can arrive.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
        ],
          "Thriller": [
            {
                text: "A woman wakes up with amnesia and must find out who she is. She is hunted by ruthless killers and uncovers a conspiracy that threatens her life.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "An FBI agent hunts a serial killer who kills his victims according to the seven deadly sins. He must work with an older, experienced colleague to stop the killer.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A lawyer discovers that his firm is deeply involved in Mafia business. He gets into mortal danger when he tries to get out and bring the truth to light.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A young FBI trainee must enlist the help of an incarcerated, cannibalistic serial killer. Only he can help her catch another killer.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A man who becomes the prime suspect after his wife's mysterious disappearance uncovers a series of shocking lies and secrets. The truth is worse than any suspicion.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A man suffering from anterograde amnesia tries to find his wife's killer. He uses tattoos and notes to replace his memory and plan his revenge.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
        ],
          "Kriegsfilm": [
            {
                text: "The story of a group of soldiers trapped behind enemy lines during World War II. Their leader must bring them home safely.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A young German soldier experiences the horrific terrors of trench warfare on the Western Front in World War I. His initial enthusiasm quickly gives way to pure horror.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A US Captain receives orders to liquidate a renegade Colonel during the Vietnam War. The journey up the river becomes a journey into darkness.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "The story of a medic in World War II who refused to carry a weapon. He saved dozens of lives in the Battle of Okinawa and became a hero.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "An entrepreneur in Nazi Germany tries to employ as many Jewish workers as possible. He risks his life to save them from the concentration camp.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
            {
                text: "A bomb disposal team in the Iraq War lives in constant tension. Every mission could be their last as they try to cope with the pressure.",
                mainRole: { gender: 'männlich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
            },
        ],
          "Western": [
            {
                text: "An aging gunslinger takes one last job. He must protect a small town from a ruthless gang of outlaws and face his destiny.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
                supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
            },
            {
                text: "A mysterious stranger teams up with a notorious bandit. Together they want to take revenge on a ruthless railroad baron who destroyed their lives.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A Civil War veteran sets out on a years-long search for his niece. She was abducted by an indigenous tribe, and his search becomes an obsession.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Young }
            },
            {
                text: "A farmer who swears revenge for the murder of his family becomes a feared outlaw. He is hunted by his former friends and the law.",
                mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
            {
                text: "A sheriff must defend his town alone against a gang of criminals. The townspeople refuse to help him out of fear, and he faces an impossible task.",
                mainRole: { gender: 'männlich', age: ActorAge.Old },
                supportingRole: { gender: 'weiblich', age: ActorAge.Young }
            },
            {
                text: "A woman hires a one-eyed, drunken Marshal to hunt down her father's killer. Together they embark on a dangerous journey through Indian Territory.",
                mainRole: { gender: 'weiblich', age: ActorAge.Young },
                supportingRole: { gender: 'männlich', age: ActorAge.Old }
            },
        ],
      }
  }
};

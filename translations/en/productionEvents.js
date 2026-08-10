export const productionEvents = {
    // --- EXISTING HYPE EVENTS ---
    'hype_01_set_leak': {
        title: 'Set Photos Leaked!',
        text: 'A set photo "accidentally" leaked to the press is causing initial speculation. The image shows the lead actor in a key scene, stimulating the fans\' imagination. Wild theories about the plot are already being discussed in letters to the editor and fan magazines. The marketing team is thrilled with this free publicity, as the hype index is measurably rising. We should ride this wave of attention to further fuel interest. Public interest in your movie has visibly increased.',
        actions: { 'accept': 'Interesting!' }
    },
    'hype_02_actor_post': {
        title: 'TV Appearance!',
        text: 'Your star {talentName} showed a funny behind-the-scenes video on a popular evening show. It shows the crew in a lighthearted moment, giving the production a likable, human touch. The next day, people in the office and on the street were talking about nothing else. The movie is suddenly the talk of the town, reaching audiences we never would have reached with traditional advertising. This is gold for our campaign!',
        actions: { 'accept': 'Great PR!' }
    },
    'hype_03_critic_praise': {
        title: 'Critic Praises Dailies',
        text: 'An influential journalist was given an exclusive look at the first raw footage. He is now writing enthusiastically in his column about the "breathtaking cinematography" and the intensity of the acting performance. Such early praise from a respected source is rare and extremely valuable. Expectations in the industry are rising rapidly. Investors and distributors are getting nervous with anticipation.',
        actions: { 'accept': 'Excellent!' }
    },
    'hype_04_fan_encounter': {
        title: 'Fans at the Set',
        text: 'A small group of enthusiastic fans has tracked down the secret filming location. Instead of chasing them away, the actors took a moment to sign autographs. The atmosphere was fantastic, and photos of it are circulating in fan circles. The local press is reporting very positively on our production\'s closeness to the fans. This enormously strengthens the bond with the community.',
        actions: { 'accept': 'Nice!' }
    },
    // --- EXISTING PRODUCTION DELAYS ---
    'prod_delay_drug_rehab': {
        title: 'Dark Sides of Fame',
        text: 'We have a serious problem: Your lead actor {talentName} has succumbed to the temptations of fame. His behavior on set today was intolerable and endangered the safety of the crew. He has realized that he needs professional help and must go to a rehab clinic immediately. This throws the shooting schedule into massive disarray. We face a difficult decision: Do we wait for him, or do we try to work with tricks?',
        actions: { 'pause': 'Pause Production', 'double': 'Use Body Double' }
    },
    'prod_delay_creative_diff': {
        title: 'Creative Differences',
        text: 'The tension on set is at a breaking point. A heated argument has broken out between director {talentName} and the lead actor over the interpretation of a key scene. Both are stubbornly sticking to their artistic vision and refusing to compromise. The crew stands idly by while the two shout at each other. If we don\'t intervene soon, the shooting day threatens to fall apart completely.',
        actions: { 'discuss': 'Allow Discussion', 'force': 'Put Foot Down' }
    },
    'prod_delay_tech_failure': {
        title: 'Technical Failure',
        text: 'In the middle of the most elaborate shot of the day, there was a loud bang. Our main camera has died, and smoke rose from the housing. The technicians suspect irreparable board damage due to overheating. We do not have an equivalent replacement camera on site. Without this equipment, we cannot film the planned sequence in the required quality.',
        actions: { 'express': 'Fly in Spare Part', 'wait': 'Wait for Shipping' }
    },
    // --- EXISTING COST EVENTS ---
    'cost_01_equipment_failure': {
        title: 'Defective Equipment',
        text: 'An important special lens was damaged during a stunt. It is essential for the visual look of the film but extremely expensive to replace. The cinematographer refuses to continue filming with inferior replacements. We must decide quickly whether to burden the budget or improvise. A delay would also be costly.',
        actions: { 'repair': 'Replace Immediately', 'improvise': 'Improvise' }
    },
    'cost_03_permit_issues': {
        title: 'Problem with Filming Permit',
        text: 'The city administration is suddenly causing problems regarding a filming permit already issued for the city center. A bureaucrat has found a formal error and is threatening to clear the set. This would cost us days and blow the schedule. There are hints that an "expedited processing fee" could solve the problem. Alternatively, we would have to move the location on short notice.',
        actions: { 'bribe': 'Pay Processing Fee', 'move': 'Move Location' }
    },
    'cost_11_overtime': {
        title: 'Overtime Ordered',
        text: 'To keep to the tight schedule, director {talentName} has ordered several night shoots. The crew is already exhausted, and union rules require high surcharges for these times. If we don\'t approve this, we won\'t finish the film on time. However, the costs for overtime significantly exceed the calculated daily budget.',
        actions: { 'pay_overtime': 'Approve Overtime', 'cancel_night': 'Cancel Night Shoot' }
    },
    // --- NEW HYPE EVENTS (25) ---
    'hype_new_1': {
        title: 'Talk Show Appearance',
        text: 'Your lead actor has been invited to the country\'s most popular late-night show. The host is known for his provocative questions. Our star has a risky joke on the tip of his tongue that could either delight the audience or trigger a scandal. The live broadcast is starting soon. Should we encourage him to be bold, or play it safe?',
        actions: { 'risk': 'Risky Joke', 'safe': 'Polite Interview' }
    },
    'hype_new_2': {
        title: 'Poster Reveal',
        text: 'The first teaser poster is ready, and it looks absolutely fantastic. The graphics department has outdone itself. We could send it to cinemas immediately to build anticipation. Internal test group reactions were euphoric. This could be the starting signal for massive hype.',
        actions: { 'accept': 'Release!' }
    },
    'hype_new_3': {
        title: 'Rumor Mill',
        text: 'Tabloids are speculating wildly about an alleged affair between the two lead actors on set. It\'s absolutely not true, but it gets us on the front pages daily. Paparazzi are besieging the studio. We could deny the rumors or fuel the fire to stay in the conversation.',
        actions: { 'risk': 'Fuel Rumors', 'safe': 'Deny' }
    },
    'hype_new_4': {
        title: 'Charity Event',
        text: 'The entire team sacrificed a day off to help out at a local soup kitchen. The press was present and took heartwarming pictures. This polishes our image enormously and shows the stars from their human side. Such actions are priceless for public perception.',
        actions: { 'accept': 'Good Karma!' }
    },
    'hype_new_5': {
        title: 'Merchandise Leak',
        text: 'A blurry photo of an action figure for the movie has appeared in a fan magazine way too early. The quality of the figure is being hotly debated and partially criticized in letters to the editor. We could claim it\'s an early prototype to smooth things over, or try to stop the distribution.',
        actions: { 'risk': 'Call it Prototype', 'safe': 'Stop Distribution' }
    },
    'hype_new_6': {
        title: 'MTV Reporter',
        text: 'A famous MTV reporter sneaked onto the set and praised the catering in a segment. Millions of teenagers now know our movie title. While it is a security risk, the free advertising with the young target group is gigantic. We should frame this positively.',
        actions: { 'accept': 'Cool!' }
    },
    'hype_new_7': {
        title: 'Controversial Scene',
        text: 'An extra has publicly complained about an allegedly "too daring" scene. A small scandal is brewing; conservative groups are calling for a boycott. At the same time, interest in the "banned film" is rising massively. Should we defend artistic freedom or cut the scene?',
        actions: { 'risk': 'Defend Scene', 'safe': 'Cut Scene' }
    },
    'hype_new_8': {
        title: 'Trailer Music',
        text: 'A well-known musician saw the raw footage and offered to produce an exclusive song for the trailer. This would give us access to radio stations. It is a unique opportunity to make the film an auditory experience as well.',
        actions: { 'accept': 'Accept!' }
    },
    'hype_new_9': {
        title: 'Fan Art Contest',
        text: 'Fans have started sending impressive posters and drawings of the characters to the studio on their own. The quality is partly better than our official drafts. We could officially support this and turn it into a contest in a magazine. Or we ignore it.',
        actions: { 'risk': 'Start Contest', 'safe': 'Ignore' }
    },
    'hype_new_10': {
        title: 'Set Visit',
        text: 'A school class was allowed to watch the filming today. The children were thrilled, and the teachers took great photos. The local press found it very charming and is running a big article tomorrow. This strengthens our roots in the local community.',
        actions: { 'accept': 'Cute!' }
    },
    'hype_new_11': {
        title: 'Newspaper War',
        text: 'Our director is currently arguing publicly in newspaper interviews with a well-known critic. The tone is sharp but very entertaining. Circulation is rising. It is unprofessional, but it generates attention. Should we stop him?',
        actions: { 'risk': 'Let it run', 'safe': 'Stop him' }
    },
    'hype_new_12': {
        title: 'Cameo Rumor',
        text: 'Rumors persist that an old Hollywood star has a secret guest appearance in the film. Fans are going crazy with curiosity. We could deny the rumor or simply stay silent and maintain the suspense. The mystery is gold.',
        actions: { 'accept': 'Keep Secret!' }
    },
    'hype_new_13': {
        title: 'Interview Marathon',
        text: 'The lead actress is completely exhausted after a 14-hour day, but a major magazine wants an exclusive spontaneous interview. She is irritable and might say something wrong. On the other hand, the cover of this magazine is priceless. Do we risk burnout?',
        actions: { 'risk': 'Force Interview', 'safe': 'Cancel' }
    },
    'hype_new_14': {
        title: 'Making-Of Clip',
        text: 'The editor has put together a short clip showing how much fun the team is having on set. There are bloopers and fits of laughter. The video conveys a great atmosphere and makes the stars relatable. This is sure to go down well on TV.',
        actions: { 'accept': 'Broadcast!' }
    },
    'hype_new_15': {
        title: 'Title Change?',
        text: 'A focus group finds the current working title confusing and unmemorable. Marketing suggests a change. This brings new press but confuses existing fans who already know the old title. A difficult decision at this stage.',
        actions: { 'risk': 'Change Title', 'safe': 'Keep Title' }
    },
    'hype_new_16': {
        title: 'Radio Interview',
        text: 'We spontaneously gave a live interview from the set for a major radio station. Listeners were thrilled and called in. The interaction was authentic and enormously strengthened the bond with the community.',
        actions: { 'accept': 'Wow!' }
    },
    'hype_new_17': {
        title: 'Leaked Script',
        text: 'A page of the script was found in the trash and sold to the press. It contains massive spoilers for the end of the film. We could claim it is a fake version to save the surprise, or try to prevent publication.',
        actions: { 'risk': 'Call it Fake', 'safe': 'Stop Publication' }
    },
    'hype_new_18': {
        title: 'Award Nomination',
        text: 'The project was nominated for a "Most Anticipated Movie" award even before completion. This is a great honor and shows how high expectations are. The team is motivated to the tips of their hair.',
        actions: { 'accept': 'Celebrate!' }
    },
    'hype_new_19': {
        title: 'Fashion Statement',
        text: 'The hero\'s iconic costume surprisingly appeared at Fashion Week, worn by a model. Is this the start of a new trend? We could immediately license a fashion line or just treat it as good PR.',
        actions: { 'risk': 'Start Collection', 'safe': 'Use for PR only' }
    },
    'hype_new_20': {
        title: 'Music Video Dance',
        text: 'The cast learned a dance from a current music video that is playing on repeat on MTV out of boredom during a break. This will look great in the "Behind the Scenes". This is the best kind of likable advertising.',
        actions: { 'accept': 'Dance along!' }
    },
    'hype_new_21': {
        title: 'Hidden Clues',
        text: 'Fans are obsessively searching released press photos for hidden clues about the plot. We could intentionally plant false leads to fuel the discussion in magazines or simply enjoy the interest.',
        actions: { 'risk': 'Plant Clues', 'safe': 'Laugh' }
    },
    'hype_new_22': {
        title: 'Documentary',
        text: 'A renowned TV station has asked to make an accompanying documentary about the filming. This would give us additional airtime and attention but also means cameras everywhere on set.',
        actions: { 'accept': 'Agree!' }
    },
    'hype_new_23': {
        title: 'Poster Vandalism',
        text: 'Someone pasted over our posters in the city in a funny way and drew mustaches on them. People are laughing about it. We could show humor and laugh along, or take the matter seriously and press charges.',
        actions: { 'risk': 'Laugh along', 'safe': 'Press Charges' }
    },
    'hype_new_24': {
        title: 'Radio Countdown',
        text: 'A radio station has started a countdown until the movie release. Every day there is new info. Listeners are excited, and calls to the station are exploding. Pure suspense!',
        actions: { 'accept': 'Suspense!' }
    },
    'hype_new_25': {
        title: 'Legendary Slogan',
        text: 'A line from the movie has already become a household word just from the trailer. We could officially use the phrase as a slogan, even if it is a bit silly, or ignore it.',
        actions: { 'risk': 'Use Slogan', 'safe': 'Ignore' }
    },
    // --- NEW PRODUCTION EVENTS (25) ---
    'prod_new_1': {
        title: 'Weather Chaos',
        text: 'An unexpected storm blew in overnight and partially devastated the elaborate outdoor set. We can wait until the rain stops, which could take days, or rewrite the script and shoot inside. But that would change the look of the film.',
        actions: { 'delay': 'Wait (Duration+)', 'rush': 'Shoot Inside (Quality-)' }
    },
    'prod_new_2': {
        title: 'New Tech',
        text: 'A technician suggests using an experimental new camera that has just come onto the market. It promises fantastic images but is untested and expensive to rent. Should we take the risk?',
        actions: { 'invest': 'Try it (Cost+)', 'ignore': 'Stay Standard' }
    },
    'prod_new_3': {
        title: 'Flu Wave',
        text: 'Half the crew is down with a severe flu. Important positions are unmanned. The schedule is wobbling dangerously. We have to improvise and work double shifts to avoid falling completely behind.',
        actions: { 'ok': 'Grin and bear it' }
    },
    'prod_new_4': {
        title: 'Perfect Light',
        text: 'The "Golden Hour" is lasting unusually long today due to special weather conditions. The light is magical! The cinematographer is begging us to go over schedule to capture these unique images. It costs overtime, but the quality would be unique.',
        actions: { 'delay': 'Shoot longer (Quality+)', 'rush': 'Keep Schedule' }
    },
    'prod_new_5': {
        title: 'Prop Error',
        text: 'An important prop was delivered in the wrong color. It doesn\'t match the set design at all. We could order a new one by express, which is expensive, or use the wrong one and hope no one notices.',
        actions: { 'invest': 'Reorder (Cost+)', 'ignore': 'Use it (Quality-)' }
    },
    'prod_new_6': {
        title: 'Team Spirit',
        text: 'A team dinner yesterday worked wonders for morale. The atmosphere on set is fantastic today. Everyone is working hand in hand, problems are solved immediately. We are progressing much faster than planned.',
        actions: { 'ok': 'Keep it up!' }
    },
    'prod_new_7': {
        title: 'Line Flub',
        text: 'The lead actor keeps stumbling over a long monologue. He finds the words unnatural. We could rewrite and rehearse the scene, which takes time, or force him to speak the text as written in the script.',
        actions: { 'delay': 'Rewrite (Time+)', 'rush': 'Leave it (Quality-)' }
    },
    'prod_new_8': {
        title: 'Local Support',
        text: 'The residents are thrilled about the filming and are voluntarily helping us block the street. This saves us external security costs. We should show our appreciation and give a generous tip to the community fund.',
        actions: { 'invest': 'Tip them (Reputation+)', 'ignore': 'Say thanks' }
    },
    'prod_new_9': {
        title: 'Power Outage',
        text: 'The main generator has failed. We are sitting in the dark. It will take hours for a replacement to arrive. We can only use the time to learn lines or take a forced break. A lost morning.',
        actions: { 'ok': 'Take a break' }
    },
    'prod_new_10': {
        title: 'Improv',
        text: 'An actor improvised in an emotional scene and played it completely differently than planned. The director is thrilled; it is much more intense! We would have to adjust the following scenes. Should we take this version?',
        actions: { 'delay': 'Expand Scene', 'rush': 'Stick to Script' }
    },
    'prod_new_11': {
        title: 'Extra Shoot',
        text: 'The director has a vision for an unplanned but spectacular scene that would enormously enhance the film. But we would have to release extra budget and rebuild the set. Is it worth it?',
        actions: { 'invest': 'Approve (Cost+)', 'ignore': 'Decline' }
    },
    'prod_new_12': {
        title: 'Logistics Miracle',
        text: 'The transport of all vehicles and equipment to the next location went perfectly today, without the usual traffic jam. We are hours ahead of schedule and can start earlier. A rare stroke of luck.',
        actions: { 'ok': 'Perfect!' }
    },
    'prod_new_13': {
        title: 'Noise Pollution',
        text: 'Planes are disturbing the sound recording every minute today. We can either wait after every plane, which takes forever, or dub the sound later in the studio, which never sounds quite as authentic.',
        actions: { 'delay': 'Wait (Time+)', 'rush': 'Dub later (Quality-)' }
    },
    'prod_new_14': {
        title: 'Expert Advice',
        text: 'A renowned historian is on set and offers to check the costumes for historical accuracy. He would find errors, but his consultation costs a fee. It would be good for credibility.',
        actions: { 'invest': 'Hire (Quality+)', 'ignore': 'Not needed' }
    },
    'prod_new_15': {
        title: 'Injury on Set',
        text: 'A stuntman got slightly injured during a rehearsal. It\'s nothing serious, but it gave everyone a scare. We have to check the safety precautions again and be more careful.',
        actions: { 'ok': 'Increase Safety' }
    },
    'prod_new_16': {
        title: 'Magic Moment',
        text: 'The chemistry between the lead actors is electric today. It\'s literally crackling in the air. We should do more takes to capture every nuance of this moment, even if it takes longer.',
        actions: { 'delay': 'More Takes (Quality+)', 'rush': 'It\'s a wrap' }
    },
    'prod_new_17': {
        title: 'Catering Fail',
        text: 'The catering truck broke down and the food didn\'t arrive. The team is hungry and angry. We have to order pizza for everyone immediately, or we\'ll have a mutiny on our hands. This hits the budget.',
        actions: { 'invest': 'Order Pizza (Cost+)', 'ignore': 'Fasting time' }
    },
    'prod_new_18': {
        title: 'Efficient Day',
        text: 'The crew is working like clockwork today. Every move is perfect. We are managing double the planned workload. Such days are gold and save us a lot of stress down the line.',
        actions: { 'ok': 'Yay!' }
    },
    'prod_new_19': {
        title: 'Artist Crisis',
        text: 'The director is having a sudden existential crisis, locking himself in his trailer, and wanting to change the whole concept. We have to give him therapy and calm him down, which takes time. Or we ignore him and continue filming according to plan.',
        actions: { 'delay': 'Therapy (Time+)', 'rush': 'Ignore (Quality-)' }
    },
    'prod_new_20': {
        title: 'Special Effect',
        text: 'A practical effect (an explosion) looks much better on camera than expected. We could include more of it in the film; it costs material but looks fantastic.',
        actions: { 'invest': 'More of that (Quality+)', 'ignore': 'Good enough' }
    },
    'prod_new_21': {
        title: 'Data Loss',
        text: 'A memory card is corrupt. Half a day\'s work is gone. We have to reshoot the scenes tomorrow. The mood is at rock bottom, but we have no choice.',
        actions: { 'ok': 'Damn!' }
    },
    'prod_new_22': {
        title: 'Animal Actor',
        text: 'The dog on set is not listening to commands at all today. He keeps running out of the frame. We can be patient and wait until he does it right, or cut him from the scene.',
        actions: { 'delay': 'Be patient', 'rush': 'Cut the dog' }
    },
    'prod_new_23': {
        title: 'Aerial Shot',
        text: 'The weather is perfect for a spectacular aerial shot of the landscape. We would have to rent a helicopter spontaneously. This was not planned but would visually enhance the film.',
        actions: { 'invest': 'Rent Helicopter', 'ignore': 'Too expensive' }
    },
    'prod_new_24': {
        title: 'Good Prep',
        text: 'Thanks to the excellent storyboard, everyone knows exactly what to do. There are no misunderstandings and no waiting times. Good planning pays off.',
        actions: { 'ok': 'Carry on' }
    },
    'prod_new_25': {
        title: 'Night Shoot',
        text: 'The planned scene looks much more atmospheric at night than during the day. We could spontaneously stay longer and shoot into the darkness. This means overtime, but the look would be brilliant.',
        actions: { 'delay': 'Stay longer', 'rush': 'Abort' }
    },
    // --- NEW COST EVENTS (25) ---
    'cost_new_1': {
        title: 'Royalties',
        text: 'We used a song for a scene whose rights are much more expensive than thought. The rights holder is demanding a hefty additional payment. We can pay or swap the song and re-edit the scene.',
        actions: { 'pay': 'Pay', 'cheap': 'Use other song' }
    },
    'cost_new_2': {
        title: 'Parking Tickets',
        text: 'The production vehicles were parked in a no-stopping zone. The city administration shows no mercy and collects. Dozens of tickets are stuck to the windshields. We\'ll have to pay this willy-nilly.',
        actions: { 'pay_forced': 'Pay up' }
    },
    'cost_new_3': {
        title: 'Insurance',
        text: 'The insurance company is demanding a surcharge at short notice because we are doing more stunts than originally stated. We can pay and be safe, or take the risk and shoot uninsured (bad for reputation).',
        actions: { 'pay': 'Insure', 'cheap': 'Take Risk (Reputation-)' }
    },
    'cost_new_4': {
        title: 'Broken Genny',
        text: 'Our main power generator has died. No power, no shoot. We must rent a replacement unit immediately and have it delivered. This is expensive, but we can\'t continue without it.',
        actions: { 'pay_forced': 'Replace' }
    },
    'cost_new_5': {
        title: 'Overtime Catering',
        text: 'The shoot took three hours longer than planned today. The catering team is demanding a contractually agreed surcharge. We can pay or refuse, which would lower the troop\'s morale.',
        actions: { 'pay': 'Pay', 'cheap': 'Refuse (Morale-)' }
    },
    'cost_new_6': {
        title: 'Rental Damage',
        text: 'A production car got a big scratch while parking. The rental company is billing us for the repair and loss of value. Annoying, but we are insured (with a deductible).',
        actions: { 'pay_forced': 'Pay Repair' }
    },
    'cost_new_7': {
        title: 'Location Rent',
        text: 'The owner of the villa we are filming in suddenly wants more money because we "strained" the lawn. We can pay to avoid trouble or threaten with lawyers (bad for reputation).',
        actions: { 'pay': 'Pay', 'cheap': 'Threaten (Reputation-)' }
    },
    'cost_new_8': {
        title: 'Software Update',
        text: 'We urgently need an update for the editing software to read the camera\'s new file formats. The license is expensive, but we can\'t edit the footage without it.',
        actions: { 'pay_forced': 'Buy' }
    },
    'cost_new_9': {
        title: 'Travel Costs',
        text: 'Flights to the next location have become expensive on short notice. We can book Business Class so the stars arrive relaxed, or put everyone in Economy (bad for morale).',
        actions: { 'pay': 'Business Class', 'cheap': 'Economy (Morale-)' }
    },
    'cost_new_10': {
        title: 'Cleaning Fee',
        text: 'We left the set quite dirty yesterday. The landlord is demanding a professional special cleaning. It\'s in the contract; we can\'t get out of it.',
        actions: { 'pay_forced': 'Pay Cleaning' }
    },
    'cost_new_11': {
        title: 'Make-Up Supply',
        text: 'We ran out of the expensive special make-up for the aliens. We need a resupply via express delivery. Or we improvise with cheap paint, which might be visible on screen.',
        actions: { 'pay': 'Express Delivery', 'cheap': 'Improvise (Quality-)' }
    },
    'cost_new_12': {
        title: 'Legal Fees',
        text: 'A passerby claims to have been in the shot and wants money. We need to have a contract legally checked to be safe. Lawyers charge by the hour.',
        actions: { 'pay_forced': 'Pay Lawyer' }
    },
    'cost_new_13': {
        title: 'Hotel Upgrade',
        text: 'The booked hotel overbooked the rooms. Our stars are left without a suite. We can pay for an upgrade to a 5-star house or put them in standard rooms (bad for morale).',
        actions: { 'pay': 'Pay Upgrade', 'cheap': 'Standard Room (Morale-)' }
    },
    'cost_new_14': {
        title: 'Customs Fees',
        text: 'Our equipment is stuck at customs because forms were missing. To get it released, we have to pay fees and a fine. Otherwise, we can\'t shoot tomorrow.',
        actions: { 'pay_forced': 'Pay Fees' }
    },
    'cost_new_15': {
        title: 'Security',
        text: 'Fans are besieging the set and disturbing the recording. We urgently need more security to cordon off the area. Or we ignore it and risk disturbances in the picture.',
        actions: { 'pay': 'Get Security', 'cheap': 'Ignore (Risk)' }
    },
    'cost_new_16': {
        title: 'Printing Costs',
        text: 'The script was changed at the last minute. We had to have 100 new copies printed and bound overnight. The express service charges a premium for this.',
        actions: { 'pay_forced': 'Pay Printer' }
    },
    'cost_new_17': {
        title: 'Vet',
        text: 'The movie dog ate something wrong on set and needs to go to the vet. We cover the treatment costs, of course. We could also wait, but that is risky.',
        actions: { 'pay': 'Go to Vet', 'cheap': 'Wait it out' }
    },
    'cost_new_18': {
        title: 'Heating Costs',
        text: 'It has become unexpectedly cold on set. The crew is freezing. We have to rent patio heaters and gas bottles to keep working conditions bearable.',
        actions: { 'pay_forced': 'Rent Heaters' }
    },
    'cost_new_19': {
        title: 'Architect',
        text: 'A self-built set looks unstable. We should have a structural engineer come in to check safety. It costs money, but it\'s safer than just hoping it holds.',
        actions: { 'pay': 'Get Inspector', 'cheap': 'Hope it holds' }
    },
    'cost_new_20': {
        title: 'Data Recovery',
        text: 'A magnetic tape with yesterday\'s footage is making strange noises. We need a data recovery specialist to save the material. It\'s very expensive, but cheaper than reshooting.',
        actions: { 'pay_forced': 'Recover Data' }
    },
    'cost_new_21': {
        title: 'Express Courier',
        text: 'An important costume was forgotten at the tailor\'s. It must be brought here overnight by courier, or we can\'t shoot the scene tomorrow. Waiting costs time.',
        actions: { 'pay': 'Pay Express', 'cheap': 'Wait (Time-)' }
    },
    'cost_new_22': {
        title: 'Paint Damage',
        text: 'A wall on the set was damaged during setup. We have to call a painter to repair it overnight so it doesn\'t show in the movie.',
        actions: { 'pay_forced': 'Call Painter' }
    },
    'cost_new_23': {
        title: 'Coffee Emergency',
        text: 'The good coffee is out, only the cheap swill is left. The crew is getting restless. We can reorder expensive premium coffee or force them to drink the cheap stuff (Morale-).',
        actions: { 'pay': 'Premium Coffee', 'cheap': 'Cheap Coffee (Morale-)' }
    },
    'cost_new_24': {
        title: 'Disposal',
        text: 'The SFX department produced hazardous waste that must be disposed of professionally. We can hire a specialist company.',
        actions: { 'pay_forced': 'Dispose properly' }
    },
    'cost_new_25': {
        title: 'Bribe?',
        text: 'A local official hints that he could turn a blind eye to a missing permit if we "help" him. We can pay (fast) or go the official route (slow).',
        actions: { 'pay': 'Bribe', 'cheap': 'Stay Honest (Time-)' }
    },
    effects: {
        quality: 'Quality',
        hype: 'Hype',
        reputation: 'Reputation',
        duration: 'Duration',
        cost: 'Cost',
        days: 'days'
    }
};

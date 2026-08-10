


export const office = {
  office: {
    screen: {
      title: 'Office',
      backToMain: 'Back',
      nav: {
        messages: 'Messages',
        messagesDesc: 'Emails & Events.',
        contacts: 'Contacts',
        contactsDesc: 'Actors & Directors.',
        casting: 'Casting',
        castingDesc: 'Cast Roles & Scout Talent.',
        employees: 'Staff',
        employeesDesc: 'Manage & Hire Team.',
        charts: 'Charts',
        chartsDesc: 'Market Share & Rivals.',
        calendar: 'Calendar',
        calendarDesc: 'Dates & Deadlines.'
      }
    },
    contacts: {
      actors: 'Actors',
      directors: 'Directors',
      showAll: 'Show All',
      showFavorites: 'Favorites',
      sortBy: 'Sort by:',
      sortSkill: 'Skill',
      sortAge: 'Age',
      sortLoyalty: 'Loyalty',
      noActors: 'No talents found.'
    },
    employees: {
      myEmployees: 'My Employees',
      market: 'Job Market',
      filterType: 'Department:',
      allTypes: 'All Departments',
      employeeTypes: {
        autor: 'Screenwriter',
        castingMitarbeiter: 'Casting Agent',
        forscher: 'Researcher',
        marketingmanager: 'Marketing Manager',
        projektPlaner: 'Project Planner'
      },
      noHired: 'You have no employees.',
      noMarket: 'The job market is empty.',
      busyTraining: 'In Training',
      busyWriting: 'Writing Script',
      busyPlanning: 'Planning Project',
      busyCasting: 'Casting',
      busyResearch: 'Researching',
      fireBlockedText: 'Warning: This will terminate the employment immediately.'
    },
    casting: {
      title: 'Casting Department',
      cancelJob: 'Cancel',
      assignJob: 'Assign',
      noStaffHint: 'Hire casting staff to assign tasks.',
      noAssignment: 'No Assignment',
      modal: {
        talent: 'Talent',
        satisfaction: 'Satisfaction',
        salary: 'Salary',
        close: 'Close',
        title: 'Select Task',
        specificCasting: 'Specific Casting',
        specificCastingDesc: 'Improve a specific talent for a role.',
        generalCasting: 'General Casting',
        generalCastingDesc: 'Improve available talents automatically.',
        startCampaign: 'Scouting Campaign',
        startCampaignDesc: 'Discover new talents.'
      },
      cancel: {
        confirmTitle: 'Cancel Task?',
        confirmText: 'Do you really want to cancel this employee\'s current task?'
      },
      general: {
        confirmTitle: 'Start General Casting?',
        confirmText: '{name} will cast available talents automatically to increase their fame.'
      },
      campaign: {
        title: 'Scouting Campaign',
        scope: 'Scope',
        scopes: {
          personal: 'Personal',
          small: 'Small',
          medium: 'Medium',
          large: 'Large'
        },
        targetSkill: 'Target Skill',
        skillLevels: {
          1: 'Beginner (0-1 Stars)',
          2: 'Intermediate (2-3 Stars)',
          3: 'Professional (4-5 Stars)',
          4: 'Expert (6-7 Stars)',
          5: 'World Class (8-10 Stars)'
        },
        targetAge: 'Age Group',
        ageGroups: {
          child: 'Child (6-15)',
          young: 'Young (16-34)',
          middleAged: 'Middle Aged (35-59)',
          old: 'Old (60+)'
        },
        details: {
          cost: 'Cost',
          duration: 'Duration',
          talents: 'Talents'
        },
        start: 'Start Campaign',
        alreadyActive: 'A campaign is already running.'
      },
      setup: {
        title: 'Setup Casting',
        role: 'Role',
        roleActor: 'Actor',
        roleDirector: 'Director',
        roleBoth: 'Both',
        filter: 'Filter',
        all: 'All',
        favorites: 'Favorites',
        selectTalent: 'Select Talent',
        noTalent: 'No Talent Available',
        typeLevel: 'Level Up',
        typePermanent: 'Permanent',
        cost: 'Cost:',
        free: 'Free',
        duration: 'Duration:',
        start: 'Start',
        alreadyActive: 'Employee is already busy.'
      }
    },
    news: {
      title: 'News',
      noEvents: 'No events recorded.'
    },
    calendar: {
        // Calendar content mostly generated dynamically via header.events
    },
    messages: {
      inbox: 'Inbox',
      archive: 'Archive',
      from: 'From:',
      selectMessage: 'Select a message.',
      noMessages: 'No messages.',
      archiveMessage: 'Archive',
      deleteMessage: 'Delete',
      rejectOffer: 'Reject',
      negotiate: 'Negotiate',
      archiveConfirmTitle: 'Archive?',
      archiveConfirmText: 'Archive message "{subject}"?',
      archiveConfirmButton: 'Archive',
      rejectConfirmTitle: 'Reject?',
      rejectConfirmText: 'Really reject this offer?',
      rejectConfirmButton: 'Reject',
      deleteConfirmTitle: 'Delete?',
      deleteConfirmText: 'Delete message "{subject}"?',
      cannotDeleteTitle: 'Not possible',
      cannotDeleteText: 'This message cannot be deleted right now.',
      goToSet: 'Go to Set',
      makeDecision: 'Make Decision',
      decisionMade: 'Decision Made.',
      setDecisionRequired: 'Action Required on Set',
      productionReport: 'Message from Set',
      studioEventEffectsHeader: 'Effects:',
      studioEventCapital: 'Capital',
      studioEventReputation: 'Reputation',
      studioEventResearch: 'Research',
      productionEventBody: 'Event at "{filmTitle}".',
      castingCampaignSubject: 'Campaign Finished',
      castingCampaignBody: '{count} talents found:\n{list}',
      castingSpecificSubject: 'Casting Finished: {talentName}',
      castingSpecificBody: '{talentName} is ready.',
      castingGeneralSubject: 'Casting Update',
      castingGeneralBody: '{talentName} processed.',
      researchFinishedSubject: 'Research: {techName}',
      researchFinishedBody: '{techName} researched by {researcherName}.',
      constructionFinishedSubject: 'Construction: {building}',
      constructionFinishedBody: '{building} (Level {level}) completed.',
      trainingFinishedSubject: 'Training: {name}',
      // NEW ARRAY FOR TRAINING MESSAGES (ENGLISH)
      trainingFinishedBodies: [
        "Dear Studio Management,\n\nwe are pleased to inform you that {name} has successfully completed the intensive training course for {role}. The time invested has clearly paid off: through the new expertise, the talent has been increased by a remarkable {yellow:{gain}} points. {name} is now highly motivated and eager to bring the new skills to the next big project. We are convinced that this increase will noticeably influence the quality of our future productions. The current talent value now stands at {yellow:{total}}.\n\nSincerely,\nPersonnel Development",
        "Hello,\n\ngood news from the training department: {name} is back! The further training in the area of {role} was a complete success. The talent was able to improve by {yellow:{gain}} points and thus reaches a new peak value of {yellow:{total}}. During the time at the institute, {name} not only deepened theoretical knowledge but also learned new practical tricks that will help us enormously on set or in the office. We have already updated the profile in our database. Welcome back to the team!\n\nBest regards,\nHR Department",
        "Valued Management,\n\nwe hereby confirm the successful completion of the measures for {name}. The course for {role} was completed with flying colors. We record an increase of {yellow:{gain}} talent points, raising the new total value to {yellow:{total}}. It is nice to see with how much zeal our employees work on their professional development. Such investments secure the long-term success of our studio in the competitive market. {name} is now fully available for tasks again.\n\nWarm regards,\nBuilding Management",
        "Good day,\n\nthe final report for the further training of {name} is now available. The training in the {role} category was extremely effective. We were able to determine a talent increase of {yellow:{gain}} points, resulting in a new value of {yellow:{total}}. {name} particularly impressed with creative problem-solving approaches during the courses and is ready to take on more responsibility in the studio. We recommend utilizing this new potential in a demanding project soon. An excellent result for our training budget.\n\nSincerely,\nTraining Management",
        "Dear Sir or Madam,\n\nwe can report the successful completion of the further training of {name} today. The intensive engagement with the contents of {role} has borne fruit. With a plus of {yellow:{gain}} points, the talent now stands at a strong {yellow:{total}}. This development confirms our strategy of specifically investing in the skills of our key personnel. {name} feels encouraged by the studio's appreciation and is full of drive for upcoming tasks. We look forward to future collaboration.\n\nBest regards,\nHR Department"
      ],
      bankruptcyWarningSubject: 'WARNING: Bankruptcy',
      bankruptcyWarningBody: 'Your account is overdrawn. Please balance it by {date}.',
      campaignFinishedSubject: 'Campaign: {campaignName}',
      campaignFinishedBody: [
        "Our marketing offensive '{campaignName}' for the project '{filmTitle}' has now been completed as planned. We have noted an enormous response in the media and among the fans. Through these targeted measures, the film has experienced a significant hype increase of {yellow:{hypeGain}} points. The team is more than satisfied with this outcome. We are perfectly positioned for the further course of production.",
        "Good news from the marketing front: The '{campaignName}' campaign has ended successfully. For '{filmTitle}', we were able to massively increase public interest, which is reflected in all metrics. The project generated an additional {yellow:{hypeGain}} hype points through our efforts. The trade press is already showing extreme curiosity about the final result. An excellent result for our current budget.",
        "With the conclusion of the '{campaignName}' campaign, we have reached an important milestone for '{filmTitle}'. The strategic orientation has proven to be absolutely correct and generated the desired attention. We recorded an increase of {yellow:{hypeGain}} hype points, which slightly exceeds our expectations. Anticipation among the audience is growing noticeably every day. We continue to monitor market reactions very closely.",
        "The analysis of the advertising measures for '{filmTitle}' is now available after '{campaignName}' was finished. Our analysts confirm a resounding success with the intended target audience. The hype index has risen by a remarkable {yellow:{hypeGain}} points, which gives us a strong starting position. Feedback from social channels is overwhelmingly positive and full of anticipation. We are now eagerly looking forward to the upcoming production phases.",
        "We are pleased to report the successful completion of the '{campaignName}' campaign for our film '{filmTitle}'. The coordinated action has caused quite a stir in the industry. Overall, the production was able to book a plus of {yellow:{hypeGain}} hype points. This means we are fully on track with our marketing strategy for this year. The foundations for a successful release have thus been laid."
      ],
      scriptFinishedSubject: 'Script: {title}',
      scriptFinishedBody: 'Script "{title}" ready (Quality: {quality}). Writer: {writer}.',
      system: 'System',
      distributor: 'Distributor',
      productionInfo: 'Production Info',
      marketingDepartment: 'Marketing Department',
      scriptDepartment: 'Script Department',
      researchDepartment: 'Research Department',
      buildingManagement: 'Building Management',
      hrDepartment: 'HR Department',
      ceoWelcomeSubject: 'Welcome to {studioName}!',
      ceoWelcomeBody: '{salutation},\n\nWe are delighted to welcome you as the new CEO of {studioName}.\n\nThe Supervisory Board has approved a monthly salary of {salary}, payable at the end of each month.\n\nWe have great confidence in your vision and look forward to a successful cooperation.\n\nSincerely,\nThe Supervisory Board',

      cinemaReleaseBody: [
        "Dear Partners,\n\nthe moment has finally arrived: Today marks the start of the theatrical release of '{title}'! Our entire team at {distributor} has worked tirelessly on the marketing campaign over the last few weeks to ensure a grand opening. The press response is overwhelming, and pre-sales look incredibly promising. We are convinced that we are bringing a true audience favorite to the big screen. Today, the lights go out in hundreds of cinemas as your work begins its journey. We will, of course, keep you updated on the initial box office results.\n\nBest regards,\nYour Team at {distributor}",
        "Hello everyone,\n\nthe time is here! It is with great pleasure that we announce today's theatrical premiere of '{title}'. Last night's preview was a complete success and has already caused quite a stir among critics. We even increased the number of prints at the last minute due to high demand. It is a privilege to bring this extraordinary film to theaters nationwide. We look forward with great optimism to the upcoming opening weekend. Enjoy this significant milestone for your studio!\n\nWarm regards,\n{distributor}",
        "Valued Partners,\n\ntoday is a significant day for our collaboration, as '{title}' celebrates its official theatrical launch. The strategic placement in the current release week ensures maximum visibility. Our market analyses predict a strong performance among the core target group. We have spared no expense or effort to promote the film prominently with a nationwide campaign. The audience is hungry for fresh material of this caliber. We look forward to presenting you with the first attendance figures soon.\n\nTo a successful run,\n{distributor}",
        "Dear Studio Management,\n\nwe are pleased to inform you that '{title}' officially launches in theaters today. After intensive preparation, the project is finally where movies have their greatest impact: on the silver screen. The first reviews are already online, praising the visual power and acting depth of your production. We are monitoring the atmosphere in the lobbies very closely and have received only enthusiastic feedback so far. It is the beginning of an exciting journey for this film in theaters. We are proud to be your partner in this release.\n\nWith best recommendations,\n{distributor}",
        "Good day,\n\ntoday is the day of decision! '{title}' is starting in cinemas, and we are ready to conquer the market. The promotional drums have been beaten loudly over the last few days, and the film's visibility is at a record level. From major metropolises to smaller towns, interest is palpable. We are excited to see how the broad audience will react to the bold staging of this work. For us, one thing is certain: this production will leave a lasting mark. We wish us all full cinemas and enthusiastic viewers!\n\nBest regards,\n{distributor}"
      ],
      homeReleaseBody: [
        "Dear Partners,\n\nthe home entertainment cycle for '{title}' begins today with the official digital and physical launch. The film is now available both on all major digital platforms and at retail. We have launched an exclusive campaign for film enthusiasts to boost sales of special editions. Demand at online retailers is already remarkably high in the first hour after release. Now your masterpiece can be enjoyed anytime and anywhere, which will surely further increase its popularity. We expect a very stable performance in this segment.\n\nSincerely,\nYour Team at {distributor}",
        "Hello,\n\nwe are bringing '{title}' directly into fans' living rooms today! The release for home cinema is officially live. We have placed the film prominently on the homepages of the most important portals to ensure maximum visibility. The bonus material we created together is already being highly praised by the first buyers. This is an excellent opportunity to permanently solidify the film's presence in the market. The digital distribution is starting smoothly worldwide. Good luck with this important step!\n\nBest regards,\n{distributor}",
        "Valued Business Partners,\n\nwe proudly announce today's sales launch of '{title}' in the home entertainment sector. We have rolled out an extensive social media campaign specifically targeting collectors and home cinema fans. The picture and sound quality of the digital masters was rated as reference-worthy in initial tests, which is a major selling point. We are confident that the film will quickly take a top position in the charts. It is nice to see how the story of '{title}' continues in a more private setting. We will keep you updated on sales figures.\n\nSincerely,\n{distributor}",
        "Dear Studio Management,\n\n'{title}' is released for sale and digital consumption starting today. This release marks a crucial financial milestone for the long-term profitability of the project. We have formed partnerships with major chains to maximize physical presence on the shelves. At the same time, digital marketing is in full swing across all channels. Fans have eagerly awaited this moment of availability, as evidenced by the numerous pre-orders. We look forward to a strong result in the coming weeks.\n\nBest regards,\n{distributor}",
        "Good day,\n\ntoday we open the gates to the home cinema market for '{title}'. The response to the announcement was already massive, and expectations are high. We are relying on a hybrid strategy of purchase and rental options to reach the widest possible audience. Your film has the potential to become a real long-runner in digital libraries. We have already placed the advertisements in relevant trade magazines. Let's keep our fingers crossed that '{title}' thrills many in their living rooms!\n\nBest regards,\n{distributor}"
      ],
      payTvReleaseBody: [
        "Dear Partners,\n\ntoday we celebrate the exclusive Pay-TV premiere of '{title}' on our premium channels. The film will be broadcast tonight during prime time and accompanied by massive on-air promotion. We have positioned '{title}' as the cinematic highlight of the month to delight our subscribers. Such exclusive windows without commercial breaks underline the high quality of your production. The editorial feedback was consistently positive, and we expect high ratings within our paying customer base. A brilliant start for this exclusive window!\n\nSincerely,\nYour Team at {distributor}",
        "Hello everyone,\n\nit's time for first-class television: '{title}' starts on our Pay-TV program today! We have announced the film as the 'Movie of the Week' across a wide area. The exclusivity of this window ensures a special appreciation of the title among viewers who value premium entertainment. We are curious to see how the viewing figures on our on-demand platforms develop alongside the broadcast. The first trailers in the current program have already generated a lot of attention. This is an important step to further solidify the '{title}' brand. We look forward to a successful premiere.\n\nBest regards,\n{distributor}",
        "Valued Partners,\n\nwe are very pleased to be able to show '{title}' in our exclusive program from today. The film fits perfectly into our portfolio and will surely be a topic of conversation among our viewers. We previously aired targeted interviews with the cast as part of our magazine shows to peak interest. This additional visibility in a commercial-free environment will have a positive effect on the perception of the film. We value the artistic work behind this project and are proud to present this title. To a good performance on premium TV!\n\nBest regards,\n{distributor}",
        "Dear Studio Management,\n\ntonight at 8:15 PM, the time has come: The Pay-TV premiere of '{title}' takes place. We have embedded the film into an attractive event programming to maximize reach. The promotional drum in our own media was beaten vigorously over the last few days. We see great potential in '{title}' to make a lasting impression in this environment. The contracts with cable network operators guarantee nationwide availability for all our premium customers. We will keep you informed about the reach.\n\nSincerely,\n{distributor}",
        "Good day,\n\nwith today's premiere, '{title}' enters a new, exclusive phase of presentation. We have marked the film as a top recommendation in our current program guide. The high-quality environment of our channel group underlines the special character of your production. Many viewers have been waiting for the opportunity to enjoy this film in brilliant quality and without interruptions. We look forward with great expectation to the upcoming broadcast dates and the response. It is a pleasure to walk this path with you.\n\nWarm regards,\n{distributor}"
      ],
      freeTvReleaseBody: [
        "Dear Partners,\n\ntoday is a big day for the general public, as '{title}' celebrates its Free-TV premiere! We have scheduled the film for the main evening during prime time to reach an audience of millions. The advertising slots in the breaks were sold out in a very short time due to the great interest in this broadcast. This is a massive moment for the visibility of your production across the entire country. With this airing, your film reaches a reach that could set new standards for your studio. We are convinced that we will win the market share battle tonight. Thank you for the cooperation on this project!\n\nSincerely,\nYour Team at {distributor}",
        "Hello,\n\nprepare for a ratings hit: '{title}' is airing for the first time on free television today! We have been running teasers all day to increase the tension among viewers. The film achieved excellent scores in all pre-tests and promises the best entertainment for everyone. It is fascinating to see how a project now achieves this enormous media presence throughout the country. We expect a lively discussion on social media during the entire broadcast. This is a milestone for the awareness of your studio. We wish us all a record-breaking rating!\n\nBest regards,\n{distributor}",
        "Valued Business Partners,\n\ntoday we bring '{title}' into every living room in the country. The Free-TV launch starts tonight with a large event programming we've been preparing for weeks. We have spared no expense to stage the film as the TV event of the weekend. The response from the program guides is consistently positive. This is a wonderful opportunity to massively increase the popularity of the brand once again. We are pleased to complete this successful path together with you. We will be in touch tomorrow with the first preliminary ratings.\n\nSincerely,\n{distributor}",
        "Dear Studio Management,\n\nthe day of the Free-TV premiere of '{title}' has finally arrived. We have placed the film strategically to benefit from the strong lead-in program. Our marketing has launched an intensive offensive in the last 48 hours to ensure that no household misses this date. It is impressive to see how timeless and appealing your film appears to the broad mass of television viewers. We are very confident that we will take the market leadership in the advertising-relevant target group tonight. To a fantastic result!\n\nSincerely,\n{distributor}",
        "Good day,\n\ntonight it's: stage set for '{title}' on Free-TV! We are thrilled to finally be able to present this work to such a broad and diverse audience. The anticipation among viewers is huge, as we can see from the reactions in our online forums. We have set the film in prime time and expect an emotional TV experience for the whole family. This is a worthy starting point for the media presence of this project on free television. We thank you for the trust in our station and the great cooperation.\n\nMany regards,\n{distributor}"
      ],
      
      ceoReviewSubjectLevel0: 'Annual Report {year}: Crisis Meeting Required',
      ceoReviewBodyLevel0: '{salutation},\n\nthe past fiscal year {year} was, frankly, a disaster. A loss of {profit} severely threatens the existence of our studio.\n\nThe Supervisory Board expects immediate measures for consolidation. Despite the result, your salary remains stable at {newSalary} as we believe in a turnaround. A bonus will not be paid this year.\n\nWe expect black numbers next year.\n\nThe Supervisory Board',

      ceoReviewSubjectLevel1: 'Annual Report {year}: Disappointing Result',
      ceoReviewBodyLevel1: '{salutation},\n\nwe have reviewed the numbers for {year}. A loss of {profit} does not meet our expectations and goals.\n\nWe must ask you to rethink your strategy. Your salary remains unchanged at {newSalary}. Bonuses have been cancelled for this year.\n\nWe hope for improvement.\n\nThe Supervisory Board',

      ceoReviewSubjectLevel2: 'Annual Report {year}: Tough Year',
      ceoReviewBodyLevel2: '{salutation},\n\nwe close the year {year} with a loss of {profit}. It was a difficult year, but we see potential in your projects.\n\nAs a sign of trust, we are slightly adjusting your salary to {newSalary}. Let\'s aim for profit together next year.\n\nSincerely,\nThe Supervisory Board',

      ceoReviewSubjectLevel3: 'Annual Report {year}: Solid Start',
      ceoReviewBodyLevel3: '{salutation},\n\ncongratulations on a positive annual result for {year}. A profit of {profit} is a good start.\n\nThe Supervisory Board has approved a bonus of {bonus} ({bonusPercent}%). Your salary increases to {newSalary}.\n\nKeep it up!\n\nThe Supervisory Board',

      ceoReviewSubjectLevel4: 'Annual Report {year}: Satisfactory',
      ceoReviewBodyLevel4: '{salutation},\n\nthe fiscal year {year} was successful. We record a profit of {profit}. The studio is developing well.\n\nWe are pleased to pay you a bonus of {bonus} ({bonusPercent}%). Your new salary is {newSalary}.\n\nWe look optimistically to the future.\n\nThe Supervisory Board',

      ceoReviewSubjectLevel5: 'Annual Report {year}: Good Success',
      ceoReviewBodyLevel5: '{salutation},\n\nyou guided the studio with a steady hand in {year}. A profit of {profit} is a very respectable result.\n\nIn recognition, you receive a bonus of {bonus} ({bonusPercent}%) and a salary increase to {newSalary}.\n\nThank you for your work.\n\nThe Supervisory Board',

      ceoReviewSubjectLevel6: 'Annual Report {year}: Outstanding',
      ceoReviewBodyLevel6: '{salutation},\n\nthe year {year} was a cause for joy for all of us. With a profit of {profit}, we have significantly exceeded our goals.\n\nThe Supervisory Board unanimously decided on a bonus of {bonus} ({bonusPercent}%). Your salary will be raised to {newSalary}.\n\nWe are proud of this development.\n\nThe Supervisory Board',

      ceoReviewSubjectLevel7: 'Annual Report {year}: Excellent Performance',
      ceoReviewBodyLevel7: '{salutation},\n\nunder your leadership, the studio presented impressive numbers in {year}. A profit of {profit} speaks for itself.\n\nYou have earned a bonus of {bonus} ({bonusPercent}%). Your salary increases significantly to {newSalary}.\n\nKeep up the great work!\n\nThe Supervisory Board',

      ceoReviewSubjectLevel8: 'Annual Report {year}: Superb',
      ceoReviewBodyLevel8: '{salutation},\n\nwe are thrilled! The year {year} was one of the best in the company\'s history. A profit of {profit} is an outstanding achievement.\n\nWe are happy to pay out a bonus of {bonus} ({bonusPercent}%). Your salary is now {newSalary}.\n\nYou are an asset to this company.\n\nThe Supervisory Board',

      ceoReviewSubjectLevel9: 'Annual Report {year}: Legendary Year',
      ceoReviewBodyLevel9: '{salutation},\n\nUNBELIEVABLE! The year {year} goes down in history. A record profit of {profit}!\n\nYou have led the studio to Olympus. Enjoy your bonus of {bonus} ({bonusPercent}%) and your new salary of {newSalary}. It has been doubled!\n\nWe bow to this achievement.\n\nThe Supervisory Board',

      anniversarySubject: 'Anniversary',
      anniversaryBody1: 'Happy Anniversary! Another year with you is the greatest gift. Thank you for always being by my side.',
      anniversaryBody2: 'Congratulations on our special day! Time flies when you\'re happy. Looking forward to many more years together.',
      anniversaryBody3: 'To my better half: Even if the studio demands a lot of time, you are always my number one. Happy Anniversary!',
      anniversaryBody4: 'Anniversary! I\'ve reserved a table at our favorite restaurant. Let\'s celebrate just the two of us tonight.',
      anniversaryBody5: 'Honey... did you not check the calendar today? It\'s our anniversary. I was hoping we\'d do something special. I\'m honestly a bit disappointed.',
      salutationMale: 'Mr. {lastName}',
      salutationFemale: 'Ms. {lastName}',
      employeeQuitSubject: 'Resignation',
      employeeQuitBody: 'Dear Management,\n\nI hereby submit my immediate resignation. The current working conditions are no longer acceptable to me.\n\n{noWorkspaceText}\n\nSincerely,\n{name}',
      employeeQuitNoWorkspace: 'In particular, the lack of a professional workspace ({requiredBuildingType}) makes effective work impossible.',
      employeeComplaintSubject: 'Dissatisfaction',
      employeeComplaintReasonDefault: 'I do not feel appreciated in my work.',
      employeeComplaintReasonNoWorkspace: 'I am missing an adequate workspace ({requiredBuildingType}). I cannot work like this!',
      employeeComplaintBody: 'Boss,\n\nI need to let you know that I am very dissatisfied with the current situation.\n\n{reason}\n\nIf nothing changes, I will have to reconsider my future here.',
      ceoBoardSender: 'Supervisory Board'
    },
    birthdaySubject: 'Happy Birthday!',
    birthdayMessages: [
        "Happy Birthday! We wish you good luck, health, and continued success with your projects in the new year of your life.",
        "Congratulations! May all your private and professional wishes come true in the coming year. Enjoy your special day!",
        "Best wishes for your birthday! We thank you for your tireless dedication and look forward to another exciting year with you.",
        "Much love on your birthday! Stay healthy and keep your visions. We hope you can celebrate with your loved ones today.",
        "Happy Birthday! May the new year of your life be as blockbuster-worthy as your movies. Let yourself be celebrated!"
    ]
  }
};

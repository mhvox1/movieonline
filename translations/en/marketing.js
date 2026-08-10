const marketing = {
  marketing: {
    screen: {
      title: "Marketing",
      navMyFilms: "My Movies",
      navMyFilmsDesc: "Manage your releases.",
      navCampaign: "Current Campaign",
      navCampaignDesc: "Marketing for current production.",
      navAnalysis: "Market Analysis",
      navAnalysisDesc: "Trends and genre popularity.",
      navCharts: "Cinema Charts",
      navChartsDesc: "Current Top 20.",
      navFestivals: "Film Festivals",
      navFestivalsDesc: "Submit movies to festivals.",
      backToMain: "Back to Main Menu"
    },
    myFilms: {
      title: "My Movies",
      filterMovies: "Movies",
      filterSeries: "Series",
      financeOverview: "Financial Overview",
      totalCost: "Total Cost:",
      totalRevenue: "Total Revenue:",
      netProfit: "Net Profit:",
      productionDetails: "Production Details",
      director: "Director:",
      mainActor: "Lead Actor:",
      supportingActor: "Supporting Actor:",
      extras: "Extras:",
      awards: "Awards:",
      creativeFocus: "Creative Focus",
      audienceFeedback: "Audience Feedback",
      distribution: "Distribution",
      distributor: "Distributor:",
      contractDate: "Contract Date:",
      lumpSum: "Lump Sum:",
      revenueShare: "Revenue Share:",
      viewersTotal: "Total Viewers:",
      noCinemaDeal: "No active cinema deal.",
      noSeriesDeal: "No active exploitation deals.",
      releaseDate: "Release Date",
      noFilms: "No movies released.",
      noSeriesProduced: "No series released.",
      status: {
        notMarketed: "Not marketed",
        inCinema: "In Theaters",
        homeEnt: "Home Ent. (in {days} days)",
        payTv: "Pay-TV (in {days} days)",
        complete: "Exploitation finished"
      },
      produceFirstFilm: "Produce your first movie to see it here.",
      produceFirstSeries: "Produce your first series to see it here."
    },
    festivals: {
      title: "Film Festivals",
      selectFilm: "Select movie for submission:",
      noEligibleFilms: "No eligible movies available.",
      submissionFee: "Submission Fee:",
      submitFilm: 'Submit "{title}"',
      noFilmSelected: "No movie selected",
      insufficientCapital: "Not enough capital.",
      skip: "Skip",
      ceremonyBegins: "The ceremony begins...",
      ceremonyOpenings: [
        "Welcome to the most prestigious night of the year! The cr\xE8me de la cr\xE8me of the film industry has gathered to honor the most outstanding achievements. Tension is in the air as we wonder who will make history tonight. We look back on a fantastic film year {year}. Let the ceremony begin!",
        "The red carpet is rolled out, and camera flashes light up the night. Today we celebrate the magic of cinema and the visionaries who brought our dreams to the screen. The year {year} gave us unforgettable moments and moving stories. Get ready for great emotions and radiant winners. Curtain up for the Movie Award!",
        "The envelopes are sealed, and the tension in the hall is palpable. In a year full of strong competition, only the very best have prevailed. Who will take home the golden trophy tonight and who will go empty-handed? We honor the cinematic masterpieces of the year {year}. Hold your breath, the show begins!",
        "Good evening, ladies and gentlemen, to a night full of glitz and glory! The whole world is looking at our stage today, where legends are born and new stars are discovered. The cinema year {year} was full of surprises and groundbreaking successes that we now want to celebrate properly. Sit back and enjoy the evening. Welcome to the Movie Award!",
        "Movies have the power to change us, to make us laugh, and to move us to tears. Tonight we honor those artists who achieved exactly that with their passion in the year {year}. It is the crowning conclusion of months of hard work and creative peak performances. Let's review the highlights of the past season together. The stage is set for the winners!"
      ],
      startCeremony: "Start Ceremony",
      andTheAwardFor: "And the award for...",
      goesTo: "goes to...",
      winner: "Winner",
      results: "Results"
    },
    festivalData: {
      summit: { name: "Borealis Summit", description: "A festival in the far north for independent filmmakers under the northern lights." },
      palme_dor: { name: "Aurelia Gala", description: "The sunniest and most prestigious festival in the world on the Gold Coast." },
      genre_blast: { name: "Vortex Genre Fest", description: "The high-energy mecca for Horror, Sci-Fi, and Fantasy fans." },
      golden_lion: { name: "Obsidian Awards", description: "Artistically demanding cinema, dark and noble like volcanic glass." }
    },
    awardCategories: {
      best_film: "Best Picture",
      best_director: "Best Director",
      best_actor: "Best Actor"
    },
    campaigns: {
      title: "Movie Campaigns",
      activeCampaign: "Active Campaign",
      noProduction: "No Production",
      description: "Run marketing campaigns during production to increase <strong>Hype</strong>.",
      startProjectHint: "Start a project to run campaigns.",
      selectedCampaign: "Selected Campaign",
      clickToChange: "Click to Change",
      startCampaign: "Start Campaign",
      singleActiveHint: "Note: One production campaign per film can run at a time; with multiple productions, campaigns can run in parallel.",
      marketingManagerBonus: "Marketing Manager Bonus: -{percent}% cost",
      statusLabel: "Status",
      statusRunning: "Running...",
      campaignEndsPostProductionNote: "Note: The campaign ends automatically shortly after post-production starts.",
      forProjectLabel: "For Project",
      cost: "Cost:",
      hypeBonus: "Hype Bonus:",
      filming: "Filming",
      postProduction: "Post-Production",
      campaignEnds: "Campaign ends automatically.",
      modalSelectTitle: "Select Campaign",
      modalConfirmTitle: "Start Campaign?",
      modalConfirmText: 'Do you want to start the campaign "{campaignName}" for {cost}?',
      campaignFinishedTitle: "Campaign Finished",
      campaignFinishedText: 'The campaign "{campaignName}" for the movie "{filmTitle}" has been successfully completed.',
      disabledReason: {
        active: "A campaign is already running.",
        used: "This campaign has already been used for this project.",
        wrongPhase: "Only available in: {phase}",
        phaseProduction: "Production",
        phasePostProduction: "Post-Production",
        noCapital: "Not enough capital."
      }
    },
    campaignData: {
      word_of_mouth: { name: "Word of Mouth", description: "Spread targeted rumors in fan forums." },
      local_press: { name: "Local Press", description: "Interviews in local newspapers and radio spots." },
      national_campaign: { name: "National Campaign", description: "Cinema trailers and ads in major magazines." },
      international_offensive: { name: "International Offensive", description: "Premieres in key markets and worldwide interviews." },
      global_saturation: { name: "Global Saturation", description: "TV spots in prime time worldwide and huge billboards." }
    },
    trends: {
      title: "Market Analysis",
      subtitle: "Current genre trends and forecasts",
      dataQuality: "Data Quality",
      qualityVeryInaccurate: "Very Inaccurate",
      qualityInaccurate: "Inaccurate",
      qualityAccurate: "Accurate",
      qualityVeryAccurate: "Very Accurate",
      lockedTitle: "Analysis Locked",
      lockedDesc: 'You need the "Market Analysis" technology and a Marketing Manager.',
      reqResearch: "Research: Market Analysis",
      reqDone: "Researched",
      reqMissing: "Missing",
      reqStaff: "Staff: Marketing Manager",
      reqHired: "Hired",
      demand: "Demand",
      trendDirection: "Trend Direction",
      trendTooltip: "Direction unknown",
      status: {
        hype: "HYPE",
        popular: "Popular",
        stable: "Stable",
        niche: "Niche",
        dead: "Dead"
      }
    },
    offerMessage: {
      kinoSubject: 'Offer: Cinema Distribution for "{filmTitle}"',
      freeTvSubject: 'Offer: TV Rights for "{filmTitle}"',
      payTvSubject: 'Offer: Pay-TV Broadcast "{filmTitle}"',
      homeSubject: 'Offer: Home Entertainment "{filmTitle}"',
      cinemaReleaseSubject: "Cinema Release: {title}",
      homeStartSubject: "Home Entertainment Launch: {title}",
      payTvStartSubject: "Pay-TV Premiere: {title}",
      freeTvStartSubject: "Free-TV Premiere: {title}",
      cycleEndSubject: "Exploitation Completed: {title}",
      dealConfirmationSubject: "Contract Confirmation: {filmTitle}",
      dealConfirmationBody: "Dear Sir or Madam,\n\nwe hereby confirm in writing the agreements just made for the distribution of '{filmTitle}'. We are delighted to include this film in our portfolio.\n\nAgreed Terms:\nLump Sum: {yellow:{lumpSum}}\nMonthly Installments: {yellow:{installments}}\nGuaranteed Total: {yellow:{totalSum}}\nRevenue Share: {revenueShare}%\n\nThe agreed lump sum has already been transferred. We will immediately begin planning the release steps.\n\nHere's to a successful cooperation!\n\nSincerely,\n{distributorName}",
      salutationMale: "Dear Mr. {lastName}",
      salutationFemale: "Dear Ms. {lastName}",
      followUpSalutation: "To Whom It May Concern",
      detailsHeader: "Contract Details:",
      lumpSum: "Lump Sum (Upfront)",
      installments: "Installments",
      installmentsDetail: "{amount} / month for {months} months",
      revenueShare: "Revenue Share",
      totalValue: "Estimated Total Value",
      disclaimer: "This offer is valid for 4 weeks.",
      closing: "We look forward to your response.",
      regards: "Sincerely,",
      improvedSubject: 'Improved Offer: "{filmTitle}"',
      reminderSubject: 'Reminder: Offer for "{filmTitle}"',
      withdrawSubject: 'Offer Withdrawn: "{filmTitle}"',
      withdrawBody: 'unfortunately, we must inform you that we are withdrawing our offer for "{filmTitle}" as we have decided otherwise.',
      reminderBody: 'we are writing to follow up on our offer for "{filmTitle}". Is there still interest?'
    },
    negotiation: {
      title: "Negotiation with {distributorName}",
      willingness: "Willingness to Negotiate",
      lastOffer: "Last Offer",
      yourCounter: "Your Counteroffer",
      lumpSum: "Lump Sum",
      revenueShare: "Revenue Share",
      releaseDate: "Release Date",
      monthlyInstallment: "Monthly Installment ({months} months)",
      feedbackDefault: "Make a counteroffer.",
      feedbackBroke: "Our patience has run out. Negotiations have failed. This offer is off the table.",
      feedbackAccepted: "Agreed. We accept your offer.",
      feedbackCounter: "That is too high. Our counteroffer is: {counterOffer}.",
      feedbackRejected: "That is unacceptable. Our patience has run out. Negotiations have failed.",
      feedbacks: [
        "Hmm...",
        "That's borderline.",
        "Alright.",
        "You drive a hard bargain.",
        "We're nearing my limit."
      ],
      feedbackWarning: "I'm warning you, don't push it!",
      close: "Close",
      cancel: "Cancel",
      accept: "Accept Offer",
      submit: "Submit Offer",
      confirmAcceptTitle: "Accept Offer?",
      confirmAcceptTextKino: "Do you really want to accept the offer of {lumpSum} and {revenueShare}%?",
      confirmAcceptText: "Do you really want to accept the offer of {totalValue}?",
      confirmCancelTitle: "Cancel Negotiations?",
      confirmCancelTextKino: "The last offer of {lumpSum} and {revenueShare}% will remain.",
      confirmCancelText: "The last offer of {totalValue} will remain.",
      contractSubject: "Distribution rights for the film {filmTitle}.",
      contractBody: "The company {studioName} assigns complete distribution rights to {distributorName}. In return, {studioName} receives the payments negotiated herein. Planned release: {phases}.",
      phases: {
        cinema: "Cinema",
        home: "Home Entertainment",
        pay: "Pay-TV",
        free: "Free-TV"
      },
      conditions: "Terms",
      statusReport: "Status Report",
      originalOffer: "Original Offer",
      guaranteed: "(Guaranteed)",
      currentValue: "Current Value",
      abortNegotiation: "Abort Negotiation",
      signContract: "Sign Contract",
      sealDeal: "Seal the Deal?",
      totalValueLabel: "Total Value:",
      bonusGain: "You negotiated an additional {amount}.",
      start: "Start:",
      binding: "This contract is binding.",
      abortTitle: "Cancel?",
      abortText: "Negotiations will end...",
      back: "Back",
      sign: "Sign",
      end: "End",
      demandMore: "Demand More",
      lifecyclePhase: "Lifecycle Contract",
      distributionPhase: "Distribution",
      startLabels: {
        default: "Proposed Start:",
        cinema: "Proposed Cinema Release:",
        home: "Home Ent. Launch:",
        pay: "Pay-TV Premiere:",
        free: "Free-TV Broadcast:"
      }
    },
    offerGenerator: {
      strategy: {
        cinema_release: [
          'we have taken a very close look at your latest work "{filmTitle}" and are absolutely thrilled with its cinematic quality. It is rare for a project to convince us so much that we immediately want to launch a major cinema campaign.\n\nOur team of experts sees the potential for a real audience favorite here. We would therefore like to submit a comprehensive offer covering theatrical release as well as subsequent exploitation chains.\n\nAs a sign of our confidence in this film, we offer you a guaranteed total sum of {yellow:{totalValue}}. We very much hope that this offer meets your expectations and that we can write history together.',
          `after screening "{filmTitle}", there was unanimous enthusiasm in our conference room. This work belongs on the big screen! We are convinced that with the right marketing strategy, we will fill the theaters.

We offer you a partnership at eye level and exploitation across all relevant channels, starting with a nationwide theatrical release.

Our financial offer amounts to a guaranteed total sum of {yellow:{totalValue}}. Let's lead this film to success together.`,
          'with "{filmTitle}" you have hit a nerve. The aesthetics, the story, the cast \u2013 everything screams blockbuster. We absolutely want to include this film in our distribution lineup and give it the attention it deserves.\n\nWe are planning a large-scale premiere and a wide release in cinemas.\n\nTo underline our serious interest, we offer you a guaranteed total sum of {yellow:{totalValue}}. We look forward to a fruitful cooperation.',
          'we are proud to submit an offer for the theatrical distribution of "{filmTitle}". Films of this quality are rare, and we see great potential for awards and commercial success.\n\nOur network guarantees you the best possible conditions in movie theaters and beyond.\n\nWe are ready to invest a guaranteed total sum of {yellow:{totalValue}} for these rights. See for yourself.',
          `the market is waiting for a film like "{filmTitle}". After internal analysis, we are sure: This will be a hit. We want to secure exclusive rights for theatrical release and all subsequent windows.

Our marketing department has already developed initial concepts to maximize the hype.

We offer you a package with a guaranteed total sum of {yellow:{totalValue}}. Let's not waste any time.`
        ],
        direct_to_video: [
          `we have analyzed the potential of "{filmTitle}" and see an excellent opportunity in the rapidly growing home entertainment market. A traditional theatrical release carries high risks nowadays, but we see your target audience on streaming platforms and in DVD sales.

We have developed a direct marketing strategy that maximizes your profits and minimizes wasted coverage.

Our offer amounts to a guaranteed total sum of {yellow:{totalValue}}, which is above the market average in this segment. Let's walk this path together.`,
          'the market for direct-to-video is booming, and "{filmTitle}" fits perfectly into the current search profile of consumers. We believe that a direct release in home cinema is the most profitable path for this project.\n\nWe have excellent contacts with all major retailers and streaming services.\n\nTherefore, we offer you a guaranteed total sum of {yellow:{totalValue}} for the exclusive rights. This guarantees you immediate revenue without the risk of a box office flop.',
          `after a thorough examination of "{filmTitle}", we have come to the conclusion that this film could become a cult classic in the home entertainment sector. The target audience is niche but has high purchasing power.

We propose an aggressive digital distribution strategy, flanked by a limited physical collector's edition.

Our offer includes a guaranteed total sum of {yellow:{totalValue}}. Trust in our expertise in the home cinema segment.`,
          'we see "{filmTitle}" as a strong product for the rental and sales market. Instead of burning money on expensive cinema campaigns, we would rather put the budget directly into your pocket and into targeted online marketing.\n\nOur forecasts for digital exploitation are extremely positive.\n\nWe are ready to pay you a guaranteed total sum of {yellow:{totalValue}}. This is the safest way to profit.',
          `for "{filmTitle}", the direct route to the customer is the best. The competition in the cinema is murderous, but in streaming and the DVD market, we see a clear niche for your work.

We offer you an uncomplicated acquisition of all rights for the home entertainment sector.

As a sign of our commitment, we offer a guaranteed total sum of {yellow:{totalValue}}. Let's bring the film directly into the living rooms of the fans.`
        ],
        tv_premiere: [
          `we are constantly looking for exclusive content for our evening program, and "{filmTitle}" fits our profile perfectly. The storyline and cast promise high ratings during prime time.

We want to secure the premiere rights before the competition does, guaranteeing you a wide audience.

Therefore, we have put together a package that gives you immediate planning security. We are ready to pay you a guaranteed total sum of {yellow:{totalValue}} for the exclusive TV rights. Let's fix this deal as soon as possible.`,
          'our channel is planning a major theme week, and "{filmTitle}" would be the ideal highlight for the main evening. We offer you the chance to present your film to an audience of millions on free TV.\n\nThe advertising slots are already reserved; all we need is your signature.\n\nWe offer you a guaranteed total sum of {yellow:{totalValue}} for the TV premiere. A win-win situation for both sides.',
          'we saw "{filmTitle}" and agreed immediately: This is the perfect TV movie of the week. It offers exactly the mix of suspense and emotion, that our viewers love.\n\nWe guarantee a broadcast at prime time and extensive trailers beforehand.\n\nOur offer for the broadcasting rights is a guaranteed total sum of {yellow:{totalValue}}. Secure this source of income.',
          'the market for TV licenses is fiercely competitive, but we absolutely want "{filmTitle}" for our program. We see great potential for high market shares among the relevant target group.\n\nWe offer you a long-term license agreement with attractive conditions.\n\nSpecifically, we offer a guaranteed total sum of {yellow:{totalValue}}. This is a solid foundation for the further exploitation of your film.',
          `we are looking for a strong lead-in for our new season of series, and "{filmTitle}" has exactly the right pace and atmosphere. We want to place the film as a major TV event.

You benefit from our massive cross-promotion on all channels.

For the exclusive TV rights, we offer you a guaranteed total sum of {yellow:{totalValue}}. Let's land ratings hits together.`
        ],
        free_tv_dump: [
          'we are interested in the broadcasting rights for "{filmTitle}" for our late-night program. Even if the film might not be suitable for the big screen, we see a niche in our special interest channel.\n\nWe offer you an uncomplicated acquisition of rights so you can close this project and focus on new tasks.\n\nOur offer of a guaranteed total sum of {yellow:{totalValue}} is calculated fairly and available immediately.',
          `we are constantly looking for solid content to fill our program gaps in the daytime schedule. "{filmTitle}" fits into our grid.

Don't expect miracles in the ratings, but we offer you quick money and unbureaucratic processing.

We pay you a flat guaranteed total sum of {yellow:{totalValue}}. Take the money and invest it in your next project.`,
          'we would like to include "{filmTitle}" in our package for secondary and tertiary exploitation. The film will rotate on various smaller channels.\n\nIt may not be the big breakthrough, but it secures you income for a film that might otherwise gather dust in the archive.\n\nOur offer is a guaranteed total sum of {yellow:{totalValue}}. An honest offer for a difficult title.',
          `let's be honest: The market for "{filmTitle}" is limited. Nevertheless, we offer you a platform in our late-night program.

We cover the technical costs for broadcast preparation and take the distribution risk off your hands.

For this, we offer you a guaranteed total sum of {yellow:{totalValue}}. Better than nothing, right?`,
          `we still have broadcasting slots to fill in the summer slump, and "{filmTitle}" could fit. It's not premium content, but we have a use for it.

We offer you a quick buy-out of all TV rights.

The guaranteed total sum is {yellow:{totalValue}}. Sign, and the money will be in your account tomorrow.`
        ]
      },
      improvedBody: 'after re-examining our calculation and internal consultation, we can submit an improved offer for "{filmTitle}". We have tweaked some parameters to accommodate you.',
      cycleEndBody: [
        "Ladies and Gentlemen,\n\nThe primary commercial exploitation for '{title}' has officially concluded. The title has run through its planned lifecycle in the market.\n\nTotal Revenue: {yellow:{totalRevenue}}\n\nWe will now transfer the project to our back catalog, where it remains available for package sales. Thank you for your trust.\n\nSincerely,\nPortfolio Management",
        "Hello,\n\nWe hereby inform you of the conclusion of the active distribution phase for '{title}'. All contractually agreed exploitation windows have been served.\n\nTotal Revenue Generated: {yellow:{totalRevenue}}\n\nThe accounting is thus finalized. We are pleased to have this title in our library.\n\nBest regards,\nLicensing Department",
        "Valued Partners,\n\nThe distribution cycle for '{title}' is complete. The film has done its duty in the market, and active marketing is hereby ceased.\n\nFinal Settlement Amount: {yellow:{totalRevenue}}\n\nWe thank you for the good cooperation on this project and hope for further shared successes.\n\nWarmly,\nYour Distribution Team",
        "Good day,\n\nAn era comes to an end: The marketing of '{title}' is complete. The title is now switching from active distribution to archive status.\n\nTotal Revenue Generated: {yellow:{totalRevenue}}\n\nFrom now on, the film will mainly generate passive income through catalog licenses. A solid addition to our portfolio.\n\nRegards,\nRights Management",
        "Dear Studio Management,\n\nWe hereby confirm the end of the contract for the active exploitation of '{title}'. The film has passed through all intended market phases.\n\nFinal Result: {yellow:{totalRevenue}}\n\nWe are closing the books for this project and thank you for providing the license rights.\n\nWith best recommendations,\nDistribution Administration"
      ]
    }
  }
};
export {
  marketing
};

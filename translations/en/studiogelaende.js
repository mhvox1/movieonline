const studiogelaende = {
  screen: {
    title: "Studio Lot",
    build: "Build",
    upgrade: "Upgrade",
    cost: "Cost:",
    duration: "Duration:",
    daysRemaining: "{days} days remaining",
    monthlyCost: "Upkeep: {cost}/month",
    level: "Level {level}",
    bonus: "Bonus:",
    underConstruction: "Under Construction...",
    fullyUpgraded: "Fully Upgraded",
    selectBuilding: "Select a Building",
    selectBuildingHint: "Click on a building in the list for details.",
    backToMain: "Back to Main Menu",
    currentBonus: "Current Bonus",
    nextLevel: "Next Level ({level})",
    departmentSlots: "Department Slots",
    slotsUsed: "Used",
    upgrading: "Upgrading",
    tooltip: {
      noCapital: "Not enough capital.",
      constructionActive: "Construction already in progress.",
      researchRequired: "Requires Research: {techName}",
      officeUpgrade: "Office Building needs upgrade.",
      dependencyMissing: "Requires: {requirement}"
    }
  },
  buildings: {
    Burogebaude: {
      name: "Office Building",
      description: "The administrative center. Your employees work here.",
      levels: {
        level1: { desc: "Small Office (3 Employees)", bonus: "Max. 3 Employees" },
        level2: { desc: "Medium Office (6 Employees)", bonus: "Max. 6 Employees" },
        level3: { desc: "Large Office (12 Employees)", bonus: "Max. 12 Employees" },
        level4: { desc: "Headquarters (25 Employees)", bonus: "Max. 25 Employees" }
      }
    },
    Autorenbuero: {
      name: "Writers' Office",
      description: "The creative hub for your screenwriters.",
      levels: {
        level1: { desc: "Basic Equipment", bonus: "Enables Script Development" },
        level2: { desc: "Inspiring Environment", bonus: "Writing Speed +10%" }
      }
    },
    CastingOffice: {
      name: "Casting Office",
      description: "Where tomorrow's stars are discovered.",
      levels: {
        level1: { desc: "Casting Office", bonus: "Enables Casting & Scouting" },
        level2: { desc: "Extended Network", bonus: "Better Casting Results" }
      }
    },
    MarketingDepartment: {
      name: "Marketing Department",
      description: "Planning of advertising campaigns and market analysis.",
      levels: {
        level1: { desc: "Marketing Office", bonus: "Enables Campaigns" },
        level2: { desc: "PR Agency", bonus: "More Effective Campaigns" }
      }
    },
    ResearchLab: {
      name: "Research Lab",
      description: "Where the future of film is created.",
      levels: {
        level1: { desc: "Research Lab", bonus: "Enables Research" },
        level2: { desc: "High-Tech Lab", bonus: "Research Points +5/day" }
      }
    },
    Planungsbuero: {
      name: "Planning Office",
      description: "Optimizes production workflows.",
      levels: {
        level1: { desc: "Planning Office", bonus: "Enables Project Planning" },
        level2: { desc: "Project Management Center", bonus: "Planning Duration -10%" }
      }
    },
    Studio: {
      name: "Studio Halls",
      description: "The central location for your filming. Expand studios to allow multiple or larger productions simultaneously.",
      levels: {
        level1: { desc: "Central management of filming halls", bonus: "Basic Infrastructure" },
        level2: { desc: "Expanded logistics for larger sets", bonus: "Enables Studio 2" },
        level3: { desc: "High-Tech Campus for major productions", bonus: "Enables Studio 3" }
      }
    },
    Studio1: {
      name: "Studio 1",
      description: "The first movie studio for small to medium productions.",
      levels: {
        level1: { desc: "Standard Equipment", bonus: "Enables Filming" },
        level2: { desc: "Modernized tech & soundproofing", bonus: "Improved Quality" },
        level3: { desc: "Fully digital Smart-Studio", bonus: "Maximum Efficiency" }
      }
    },
    Studio2: {
      name: "Studio 2",
      description: "A larger studio for ambitious projects.",
      levels: {
        level1: { desc: "Large scale hall", bonus: "Higher Capacity" },
        level2: { desc: "Expansion with water tank", bonus: "Special effects enabled" },
        level3: { desc: "Monumental production hall", bonus: "For Mega-Blockbusters" }
      }
    },
    Studio3: {
      name: "Studio 3",
      description: "High-End Studio with Green Screen and state-of-the-art technology.",
      levels: {
        level1: { desc: "Green Screen Base", bonus: "VFX Production" },
        level2: { desc: "LED Volume Technology", bonus: "Reduced Post-Production" },
        level3: { desc: "Holo-Deck Studio", bonus: "Maximum VFX Quality" }
      }
    },
    Bauhof: {
      name: "Construction Yard",
      description: "Central hub for all construction projects. Enables running multiple construction projects in parallel.",
      levels: {
        level1: { desc: "Small Construction Yard", bonus: "2 Construction orders simultaneously" },
        level2: { desc: "Large Construction Yard", bonus: "3 Construction orders simultaneously" }
      }
    },
    Kino: {
      name: "Cinema",
      description: "Your own cinema on the studio lot.",
      levels: {
        level1: { desc: "Small Art House", bonus: "Small Monthly Income" },
        level2: { desc: "Multiplex Hall", bonus: "Medium Income" }
      }
    },
    Restaurant: {
      name: "Restaurant",
      description: "Provides for physical well-being.",
      levels: {
        level1: { desc: "Cafeteria", bonus: "Morale +1" },
        level2: { desc: "Gourmet Restaurant", bonus: "Morale +3" }
      }
    },
    Filmmuseum: {
      name: "Movie Museum",
      description: "A place of film history.",
      levels: {
        level1: { desc: "Museum", bonus: "Reputation +1 (Chance)" }
      }
    },
    Backlot: {
      name: "Backlot",
      description: "Modular outdoor sets for faster and more convincing exterior shoots.",
      levels: {
        level1: { desc: "Compact outdoor set park", bonus: "Production -5%, Action/Adventure/Western +2 quality" },
        level2: { desc: "Large set park with streets and nature lots", bonus: "Production -12%, Action/Adventure/Western/Sci-Fi +4 quality" },
        level3: { desc: "Premium backlot with variable mega sets", bonus: "Production -15%, Action/Adventure/Western/Sci-Fi/War +6 quality" }
      }
    },
    Postproduktionshaus: {
      name: "Post Production House",
      description: "Editing, grading and mastering in-house.",
      levels: {
        level1: { desc: "Compact in-house post production", bonus: "Post production -10%, final quality +1" },
        level2: { desc: "Professional finishing center", bonus: "Post production -20%, final quality +2" },
        level3: { desc: "Premium suite for international masters", bonus: "Post production -30%, final quality +3" }
      }
    },
    Sicherheitszentrale: {
      name: "Security Center",
      description: "Protects the studio, data and talent from leaks and sabotage.",
      levels: {
        level1: { desc: "Site security with access control", bonus: "35% fewer security and leak events" },
        level2: { desc: "Control room with cyber security", bonus: "60% fewer security and leak events" }
      }
    },
    KostuemUndMaskenatelier: {
      name: "Costume & Makeup Atelier",
      description: "Specialized in wardrobe, prosthetics and signature looks.",
      levels: {
        level1: { desc: "Solid costume and makeup team", bonus: "Fantasy/Horror/Musical +2 quality" },
        level2: { desc: "Expanded atelier with specialty makeup", bonus: "Fantasy/Horror/Musical/Romance +4 quality" },
        level3: { desc: "Award-winning atelier for prestige productions", bonus: "Fantasy/Horror/Musical/Romance/War +6 quality" }
      }
    },
    Betriebskita: {
      name: "On-Site Daycare",
      description: "Relieves families on staff and improves retention.",
      levels: {
        level1: { desc: "Small daycare with flexible hours", bonus: "Employee satisfaction +4/month" },
        level2: { desc: "Large daycare with holiday program", bonus: "Employee satisfaction +8/month" }
      }
    },
    Studiohotel: {
      name: "Studio Hotel",
      description: "Hosts guests, stars and tourists directly on the lot.",
      levels: {
        level1: { desc: "Business hotel with studio view", bonus: "High monthly income" },
        level2: { desc: "Luxury resort for stars and industry visitors", bonus: "Very high monthly income" }
      }
    },
    Eventhalle: {
      name: "Event Hall",
      description: "For premieres, galas, expos and fan events.",
      levels: {
        level1: { desc: "Flexible hall for premieres and company events", bonus: "Solid event income" },
        level2: { desc: "Prestige venue for awards and major events", bonus: "Strong event income" }
      }
    },
    Fanshop: {
      name: "Fan Shop",
      description: "Sells merch, collectibles and exclusive studio souvenirs.",
      levels: {
        level1: { desc: "Small merch store at the visitor entrance", bonus: "Small monthly income" },
        level2: { desc: "Large flagship store with limited editions", bonus: "Good monthly income" }
      }
    }
  }
};
export {
  studiogelaende
};

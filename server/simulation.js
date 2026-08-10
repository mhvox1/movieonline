function createDeterministicRng(seed) {
  let t = seed >>> 0;

  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(parts) {
  const input = parts.join('|');
  let h = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toDate(value) {
  if (!value) {
    return null;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d;
}

function isDue(dateLike, currentDate) {
  const dueDate = toDate(dateLike);
  if (!dueDate) {
    return false;
  }
  return dueDate.getTime() <= currentDate.getTime();
}

function getNextMonth(year, month) {
  if (month >= 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

function makeProjectQuality(project, seedParts) {
  const seed = hashSeed(seedParts);
  const random = createDeterministicRng(seed);
  const variance = Math.round((random() * 10) - 5);
  const score =
    (toNumber(project.scriptQuality, 50) * 0.35) +
    (toNumber(project.projectPotential, 50) * 0.35) +
    (toNumber(project.productionQualityModifier, 0) * 0.15) +
    (toNumber(project.hype, 0) * 0.15) +
    variance;
  return clamp(Math.round(score), 1, 100);
}

function createBaseState(studioState) {
  return {
    ...studioState,
    capital: toNumber(studioState.capital, 0),
    privateCapital: toNumber(studioState.privateCapital, 0),
    employees: Array.isArray(studioState.employees) ? [...studioState.employees] : [],
    loans: Array.isArray(studioState.loans) ? [...studioState.loans] : [],
    activeProjects: Array.isArray(studioState.activeProjects) ? [...studioState.activeProjects] : [],
    activePlanning: studioState.activePlanning || null,
    completedFilms: Array.isArray(studioState.completedFilms) ? [...studioState.completedFilms] : [],
    pendingNotifications: Array.isArray(studioState.pendingNotifications) ? [...studioState.pendingNotifications] : [],
    savedProjectTemplates: Array.isArray(studioState.savedProjectTemplates) ? [...studioState.savedProjectTemplates] : [],
    monthlyHistory: Array.isArray(studioState.monthlyHistory) ? [...studioState.monthlyHistory] : [],
    transactionLog: Array.isArray(studioState.transactionLog) ? [...studioState.transactionLog] : [],
  };
}

function applyPlanningProgression(nextState, context, events) {
  if (!nextState.activePlanning) {
    return;
  }

  const planning = { ...nextState.activePlanning };
  const title = planning.workingTitle || 'Unbekanntes Projekt';

  if (planning.contract && planning.contractDeadline && isDue(planning.contractDeadline, context.currentDate)) {
    const penalty = toNumber(planning.contract.penalty, 0);
    const upfront = toNumber(planning.contract.upfrontPayment, 0);
    const totalDeduction = penalty + upfront;

    if (totalDeduction > 0) {
      nextState.capital -= totalDeduction;
      nextState.transactionLog.push({
        date: context.transactionDateIso,
        type: 'Ausgabe',
        category: 'Filmproduktion',
        description: `Vertragsstrafe (Frist): \"${title}\"`,
        amount: totalDeduction,
      });
    }

    nextState.activePlanning = null;
    events.push({
      type: 'planning_contract_failed',
      title,
      penalty: totalDeduction,
      month: context.ingameMonth,
      year: context.ingameYear,
    });
    return;
  }

  if (planning.scriptEndDate && isDue(planning.scriptEndDate, context.currentDate)) {
    const nextPhase = planning.projectType === 'series' ? 'CastingSetup' : 'ScriptFinished';
    const finishedPlanning = {
      ...planning,
      phase: nextPhase,
      templateTitle: planning.workingTitle,
    };

    nextState.savedProjectTemplates.push(finishedPlanning);
    nextState.pendingNotifications.push({
      type: 'planningFinished',
      title,
    });
    nextState.activePlanning = null;

    events.push({
      type: 'planning_finished',
      title,
      phase: nextPhase,
      month: context.ingameMonth,
      year: context.ingameYear,
    });
  }
}

function applyActiveProjectProgression(nextState, context, events) {
  if (!Array.isArray(nextState.activeProjects) || nextState.activeProjects.length === 0) {
    return;
  }

  const updatedProjects = [];

  for (const originalProject of nextState.activeProjects) {
    let project = { ...originalProject };
    const title = project.workingTitle || 'Unbekanntes Projekt';

    if (project.contract && project.contractDeadline && isDue(project.contractDeadline, context.currentDate)) {
      events.push({
        type: 'project_contract_failed',
        title,
        month: context.ingameMonth,
        year: context.ingameYear,
      });
      continue;
    }

    if (project.phase === 'Scriptwriting' && project.scriptEndDate && isDue(project.scriptEndDate, context.currentDate)) {
      project.phase = 'CastingSetup';
      events.push({
        type: 'project_phase_changed',
        title,
        from: 'Scriptwriting',
        to: 'CastingSetup',
        month: context.ingameMonth,
        year: context.ingameYear,
      });
    } else if (project.phase === 'Casting' && project.castingEndDate && isDue(project.castingEndDate, context.currentDate)) {
      project.phase = 'CastingFinished';
      nextState.pendingNotifications.push({
        type: 'castingFinished',
        title,
        justifications: null,
      });
      events.push({
        type: 'project_phase_changed',
        title,
        from: 'Casting',
        to: 'CastingFinished',
        month: context.ingameMonth,
        year: context.ingameYear,
      });
    } else if (project.phase === 'Production' && project.productionEndDate && isDue(project.productionEndDate, context.currentDate)) {
      project.phase = 'PostProductionSetup';
      nextState.pendingNotifications.push({
        type: 'productionFinished',
        title,
      });
      events.push({
        type: 'project_phase_changed',
        title,
        from: 'Production',
        to: 'PostProductionSetup',
        month: context.ingameMonth,
        year: context.ingameYear,
      });
    } else if (project.phase === 'PostProduction' && project.postProductionEndDate && isDue(project.postProductionEndDate, context.currentDate)) {
      const finalQuality = makeProjectQuality(project, [
        String(nextState.id || ''),
        String(title),
        String(context.ingameYear),
        String(context.ingameMonth),
        'project-completion',
      ]);
      const nextReleaseWindow = getNextMonth(context.ingameYear, context.ingameMonth);

      const completedProject = {
        ...project,
        phase: 'Completed',
        finalQuality,
        onlineRelease: {
          releaseId: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          releaseYear: nextReleaseWindow.year,
          releaseMonth: nextReleaseWindow.month,
          status: 'scheduled',
          priorityTier: 'normal',
          strategy: 'balanced',
          scheduledAtIso: context.transactionDateIso,
        },
        totalCost:
          toNumber(project.scriptBudget, 0) +
          toNumber(project.movieSizeBudget, 0) +
          toNumber(project.seriesPlanningCost, 0) +
          toNumber(project.castingCost, 0) +
          toNumber(project.directorGage, 0) +
          toNumber(project.mainActorGage, 0) +
          toNumber(project.supportingActorGage, 0) +
          toNumber(project.productionCost, 0) +
          toNumber(project.postProductionCost, 0),
      };

      nextState.completedFilms.push(completedProject);
      nextState.currentProject = completedProject;
      nextState.pendingNotifications.push({
        type: 'completed',
        title,
        quality: finalQuality,
      });

      events.push({
        type: 'project_completed',
        title,
        finalQuality,
        month: context.ingameMonth,
        year: context.ingameYear,
      });
      continue;
    }

    updatedProjects.push(project);
  }

  nextState.activeProjects = updatedProjects;
}

function applyFilmInstallments(nextState, context, events) {
  nextState.completedFilms = nextState.completedFilms.map(film => {
    if (!film || !film.activeDeal) {
      return film;
    }

    const deal = { ...film.activeDeal };
    const monthsPassed = toNumber(deal.monthsPassed, 0);
    const durationMonths = Math.max(0, toNumber(deal.durationMonths, 0));
    const monthlyPayment = Math.max(0, toNumber(deal.monthlyPayment, 0));

    if (monthsPassed < durationMonths && monthlyPayment > 0) {
      nextState.capital += monthlyPayment;
      deal.monthsPassed = monthsPassed + 1;
      deal.totalEarnings = toNumber(deal.totalEarnings, 0) + monthlyPayment;

      nextState.transactionLog.push({
        date: context.transactionDateIso,
        type: 'Einnahme',
        category: 'Filmverleih',
        description: `Rate fuer "${film.workingTitle || 'Unbekannter Titel'}"`,
        amount: monthlyPayment,
      });

      events.push({
        type: 'installment_paid',
        title: film.workingTitle || null,
        amount: monthlyPayment,
        month: context.ingameMonth,
        year: context.ingameYear,
      });

      return { ...film, activeDeal: deal };
    }

    return film;
  });
}

function applySalaries(nextState, context, events) {
  for (const employee of nextState.employees) {
    const salary = Math.max(0, toNumber(employee.salary, 0));
    if (salary <= 0) {
      continue;
    }

    nextState.capital -= salary;
    nextState.transactionLog.push({
      date: context.transactionDateIso,
      type: 'Ausgabe',
      category: 'Personal',
      description: `Gehalt: ${employee.name || 'Unbekannt'}`,
      amount: salary,
    });
  }

  const ceoSalary = Math.max(0, toNumber(nextState.ceoSalary, 0));
  if (ceoSalary > 0) {
    nextState.capital -= ceoSalary;
    nextState.privateCapital += ceoSalary;
    nextState.transactionLog.push({
      date: context.transactionDateIso,
      type: 'Ausgabe',
      category: 'Personal',
      description: `CEO Gehalt: ${nextState.playerName || 'CEO'}`,
      amount: ceoSalary,
    });
    events.push({
      type: 'ceo_salary_paid',
      amount: ceoSalary,
      month: context.ingameMonth,
      year: context.ingameYear,
    });
  }
}

function applyLoanPayments(nextState, context, events) {
  const remainingLoans = [];

  for (const loan of nextState.loans) {
    const totalOwed = Math.max(0, toNumber(loan.totalOwed, 0));
    const monthlyPayment = Math.max(0, toNumber(loan.monthlyPayment, 0));
    if (totalOwed <= 0 || monthlyPayment <= 0) {
      if (totalOwed > 1) {
        remainingLoans.push(loan);
      }
      continue;
    }

    const payment = Math.min(monthlyPayment, totalOwed);
    const nextTotalOwed = Math.max(0, totalOwed - payment);

    nextState.capital -= payment;
    nextState.transactionLog.push({
      date: context.transactionDateIso,
      type: 'Ausgabe',
      category: 'Finanzen',
      description: `Kreditrate: ${loan.name || 'Kredit'}`,
      amount: payment,
    });

    events.push({
      type: 'loan_payment',
      loanName: loan.name || null,
      amount: payment,
      remaining: nextTotalOwed,
      month: context.ingameMonth,
      year: context.ingameYear,
    });

    if (nextTotalOwed > 1) {
      remainingLoans.push({ ...loan, totalOwed: nextTotalOwed });
    }
  }

  nextState.loans = remainingLoans;
}

function applyMonthlyHistory(nextState, context) {
  const transactionDate = toDate(context.transactionDateIso);
  if (!transactionDate) {
    return;
  }

  const reportYear = transactionDate.getUTCFullYear();
  const reportMonth = transactionDate.getUTCMonth();

  const monthTransactions = nextState.transactionLog.filter(entry => {
    const d = toDate(entry.date);
    if (!d) {
      return false;
    }
    return d.getUTCFullYear() === reportYear && d.getUTCMonth() === reportMonth;
  });

  const income = monthTransactions
    .filter(entry => entry.type === 'Einnahme')
    .reduce((sum, entry) => sum + toNumber(entry.amount, 0), 0);

  const expense = monthTransactions
    .filter(entry => entry.type === 'Ausgabe')
    .reduce((sum, entry) => sum + toNumber(entry.amount, 0), 0);

  nextState.monthlyHistory.push({
    year: reportYear,
    month: reportMonth,
    income,
    expense,
    profit: income - expense,
  });
  nextState.lastMonthlyReportDate = transactionDate.toISOString();
}

function simulateMonthlyTick(studioState, context) {
  const nextState = createBaseState(studioState);
  const events = [];
  const currentDate = new Date(Date.UTC(context.ingameYear, context.ingameMonth - 1, 1));
  const transactionDateIso = currentDate.toISOString();

  const fullContext = {
    ...context,
    currentDate,
    transactionDateIso,
  };

  applyPlanningProgression(nextState, fullContext, events);
  applyActiveProjectProgression(nextState, fullContext, events);
  applyFilmInstallments(nextState, fullContext, events);
  applySalaries(nextState, fullContext, events);
  applyLoanPayments(nextState, fullContext, events);

  // Small deterministic market noise keeps prototype simulation non-static.
  const seed = hashSeed([
    String(studioState.id || ''),
    String(context.ingameYear),
    String(context.ingameMonth),
    'monthly-economy',
  ]);
  const random = createDeterministicRng(seed);
  const drift = Math.floor((random() * 5001) - 2500);

  nextState.capital = Math.floor(nextState.capital + drift);
  events.push({
    type: 'monthly_drift_applied',
    value: drift,
    month: context.ingameMonth,
    year: context.ingameYear,
  });

  applyMonthlyHistory(nextState, fullContext);

  return { nextState, events };
}

function runCatchUpMonths(studioState, elapsedMonths, startYear, startMonth) {
  let currentState = { ...studioState };
  const allEvents = [];
  let year = startYear;
  let month = startMonth;

  for (let i = 0; i < elapsedMonths; i += 1) {
    const result = simulateMonthlyTick(currentState, { ingameYear: year, ingameMonth: month });
    currentState = result.nextState;
    allEvents.push(...result.events);

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { nextState: currentState, events: allEvents, processedMonths: elapsedMonths };
}

module.exports = {
  createDeterministicRng,
  hashSeed,
  simulateMonthlyTick,
  runCatchUpMonths,
};

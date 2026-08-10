export const isSameDay = (d1, d2) => {
    if (!d2)
        return false;
    const d1Norm = new Date(d1);
    const d2Norm = new Date(d2);
    d1Norm.setHours(0, 0, 0, 0);
    d2Norm.setHours(0, 0, 0, 0);
    return d1Norm.getTime() === d2Norm.getTime();
};
// Checks if the current date has reached or passed a target date (inclusive).
// This is safer than relying on equality when the game date can jump forward
// by more than one day (e.g. due to speed changes or month advances).
export const dateReached = (current, target) => {
    if (!target)
        return false;
    return new Date(current) >= new Date(target);
};
export const MAX_CEO_SALARY = 7500000;
export const clampCeoSalary = (salary) => {
    return Math.max(0, Math.min(MAX_CEO_SALARY, salary));
};

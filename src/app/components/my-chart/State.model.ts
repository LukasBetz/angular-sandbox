export class State {

    constructor(private boughtValue: number , private winnings: number) {
    }

    private copy(): State {
        return new State(this.boughtValue, this.winnings);
    }

    get currentValue(): number {
        return this.boughtValue + this.winnings;
    }

    get valueAfterTax(): number {
        return this.currentValue - this.winnings * 0.18466;
    }

    public advanceYear(yearlyPercentGrowth: number, monthlyChange: number): State {
        const newState = this.copy();
        for (let i = 0; i < 12; i++) {
            newState.advanceMonth(yearlyPercentGrowth, monthlyChange);
        }
        return newState;
    }

    private advanceMonth(yearlyPercentGrowth: number, monthlyChange: number) {
        const monthlyGrowthFactor = Math.pow(1 + yearlyPercentGrowth / 100, 1/12);
        if (monthlyChange >= 0) {
            this.boughtValue += monthlyChange;
        } else {
            const factorOfWinnings = this.winnings / this.currentValue;
            this.winnings += monthlyChange * factorOfWinnings;
            this.boughtValue += monthlyChange * (1 - factorOfWinnings);
        }
        this.winnings += this.currentValue * (monthlyGrowthFactor - 1);
    }

}
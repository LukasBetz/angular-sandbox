import {Component, Input, OnInit} from '@angular/core';
import {Chart} from "node_modules/chart.js";
import {ChartConfiguration, ChartItem, registerables} from "chart.js";

@Component({
    selector: 'app-my-chart',
    templateUrl: './my-chart.component.html',
    styleUrls: ['./my-chart.component.css']
})
export class MyChartComponent implements OnInit {

    beginningBalance: number = 5000;
    monthlyDeposit: number = 0;
    expectedGrowth: number = 5.00;
    inflation: number = 2.00;
    yearlyIncreaseOfDeposit: number = 0;


    numberOfYears: number = 10;
    chart: Chart | undefined;

    constructor() {

    }

    refresh(): void {
        this.beginningBalance = Number(this.beginningBalance);
        this.monthlyDeposit = Number(this.monthlyDeposit);
        this.expectedGrowth = Number(this.expectedGrowth);
        this.inflation = Number(this.inflation);
        this.yearlyIncreaseOfDeposit = Number(this.yearlyIncreaseOfDeposit);
        this.numberOfYears = Number(this.numberOfYears);

        let balanceWithoutInflationBeforeTax: number[] = [];
        let balanceWithoutInflationAfterTax: number[] = [];
        let balanceWithInflationAfterTax: number[] = []
        for (let i = 0; i <= this.numberOfYears; i++) {
            let balanceForYear = this.getBalanceAfterNYears(i);
            let balanceWithInflationAfterTaxForYear = balanceForYear.balanceAfterTax * Math.pow(1 - this.inflation / 100, i);
            balanceWithoutInflationBeforeTax.push(balanceForYear.balance);
            balanceWithoutInflationAfterTax.push(balanceForYear.balanceAfterTax)
            balanceWithInflationAfterTax.push(balanceWithInflationAfterTaxForYear);
        }

        // Drop old data
        this.chart!.data.labels!.length = 0;
        this.chart?.data.datasets.forEach((dataset) => dataset.data.length = 0)

        // Populate with new data
        this.chart?.data.labels?.push(...this.buildLables())
        this.chart?.data.datasets[0].data.push(...balanceWithoutInflationBeforeTax);
        this.chart?.data.datasets[1].data.push(...balanceWithoutInflationAfterTax);
        this.chart?.data.datasets[2].data.push(...balanceWithInflationAfterTax);
        this.chart?.update();
    }

    private buildLables(): number[] {
        let labels: number[] = [];
        for (let i = 0; i <= this.numberOfYears; i++) {
            labels.push(i);
        }
        return labels;
    }

    ngOnInit(): void {
        Chart.register(...registerables);
        this.buildChart();
    }

    buildChart(): void {
        const data = {
            labels: [],
            datasets: [
                {
                    label: 'Ohne Inflation vor Steuern',
                    backgroundColor: 'rgb(255, 0, 0)',
                    borderColor: 'rgb(255, 0, 0)',
                    data: [],
                },
                {
                    label: 'Ohne Inflation nach Steuern',
                    backgroundColor: 'rgb(0, 0, 255)',
                    borderColor: 'rgb(0, 0, 255)',
                    data: [],
                },
                {
                    label: 'Inflationsbereinigt nach Steuern',
                    backgroundColor: 'rgb(0, 255, 0)',
                    borderColor: 'rgb(0, 255, 0)',
                    data: [],
                },
            ]
        };

        const config: ChartConfiguration = {
            type: 'line',
            data: data,
            options: {
                maintainAspectRatio: false
            }
        };
        this.chart = new Chart(
            document.getElementById('myChart') as ChartItem,
            config
        );
        this.refresh();
    }

    private getBalanceAfterNYears(years: number): { balance: number, balanceAfterTax: number } {
        let depositGrowthPerYear: number = 1 + this.yearlyIncreaseOfDeposit / 100;
        let stockGrowthPerYear: number = 1 + this.expectedGrowth / 100;
        let balanceWithoutStockGrowth: number = this.beginningBalance + this.monthlyDeposit * this.getSummedGrowthFactorForMonthlyGrowthWithYearlyGrowthRate(depositGrowthPerYear, years);
        let balance = this.beginningBalance * Math.pow(stockGrowthPerYear, years)
            + this.monthlyDeposit * Math.pow(stockGrowthPerYear, (12 * years - 1) / 12)
            * this.getSummedGrowthFactorForMonthlyGrowthWithYearlyGrowthRate(depositGrowthPerYear / stockGrowthPerYear, years);

        let winnings = balance - balanceWithoutStockGrowth;
        return {balance: balance, balanceAfterTax: balance - winnings / 4};
    }

    private getSummedGrowthFactorForMonthlyGrowthWithYearlyGrowthRate(growth: number, years: number): number {
        if (growth == 1) {
            return 12 * years;
        }
        let montlyGrowth = Math.pow(growth, 1 / 12);
        return (Math.pow(montlyGrowth, 12 * years) - 1) / (montlyGrowth - 1);
    }

}

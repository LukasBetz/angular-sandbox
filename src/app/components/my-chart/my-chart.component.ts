import {Component, OnInit} from '@angular/core';
import {Chart} from "node_modules/chart.js";
import {ChartConfiguration, ChartItem, registerables} from "chart.js";
import {State} from "./State.model";

@Component({
    selector: 'app-my-chart',
    templateUrl: './my-chart.component.html',
    styleUrls: ['./my-chart.component.css']
})
export class MyChartComponent implements OnInit {

    buyingValue: number = 5000;
    currentValue: number = 5000;
    monthlyDeposit: number = 0;
    expectedGrowth: number = 5.00;
    inflation: number = 2.00;
    yearlyIncreaseOfDeposit: number = 0;
    monthlyWithdrawal: number = 0;
    startOfWithdrawal: number = 10;


    numberOfYears: number = 10;
    chart: Chart | undefined;

    constructor() {

    }

    refresh(): void {
        this.buyingValue = Number(this.buyingValue);
        this.monthlyDeposit = Number(this.monthlyDeposit);
        this.expectedGrowth = Number(this.expectedGrowth);
        this.inflation = Number(this.inflation);
        this.yearlyIncreaseOfDeposit = Number(this.yearlyIncreaseOfDeposit);
        this.numberOfYears = Number(this.numberOfYears);

        let currentState = new State(this.buyingValue, this.currentValue - this.buyingValue);


        let balanceWithoutInflationBeforeTax: number[] = [currentState.currentValue];
        let balanceWithInflationBeforeTax: number[] = [currentState.currentValue];
        let balanceWithoutInflationAfterTax: number[] = [currentState.valueAfterTax];
        let balanceWithInflationAfterTax: number[] = [currentState.valueAfterTax]
        for (let i = 0; i < this.numberOfYears; i++) {
            const monthlyChange = this.startOfWithdrawal > i ? this.monthlyDeposit : -this.monthlyWithdrawal;
            const increaseAdjustedMonthlyChange = monthlyChange * Math.pow(1 + this.yearlyIncreaseOfDeposit / 100, i);
            currentState = currentState.advanceYear(this.expectedGrowth, increaseAdjustedMonthlyChange);

            let inflationRate = Math.pow(1 - this.inflation / 100, i + 1)
            balanceWithoutInflationBeforeTax.push(currentState.currentValue);
            balanceWithInflationBeforeTax.push(currentState.currentValue * inflationRate);
            balanceWithoutInflationAfterTax.push(currentState.valueAfterTax)
            balanceWithInflationAfterTax.push(currentState.valueAfterTax * inflationRate);
        }

        // Drop old data
        this.chart!.data.labels!.length = 0;
        this.chart?.data.datasets.forEach((dataset) => dataset.data.length = 0)

        // Populate with new data
        this.chart?.data.labels?.push(...this.buildLables())
        this.chart?.data.datasets[0].data.push(...balanceWithoutInflationBeforeTax);
        this.chart?.data.datasets[1].data.push(...balanceWithInflationBeforeTax);
        this.chart?.data.datasets[2].data.push(...balanceWithoutInflationAfterTax);
        this.chart?.data.datasets[3].data.push(...balanceWithInflationAfterTax);
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
                    label: 'Inflationsbereinigt vor Steuern',
                    backgroundColor: 'rgb(255, 255, 0)',
                    borderColor: 'rgb(255, 255, 0)',
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

}

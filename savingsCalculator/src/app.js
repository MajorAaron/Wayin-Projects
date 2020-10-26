const axios = require('axios').default;
import Vue from 'vue';

var app; 

var config = {

}

var lang = {

}

var startApp = function(){


		app = new Vue({
			el: '#savingsCalc',
			template: /*html*/`
					<div class="appContainer">
						<div class="column one">
							<div class="inputWrapper">
								<label for="initialDeposit">Initial Deposit</label>
								<input id="initialDeposit" type="text" v-on:keyup="updateValues()">
							</div>

							<div class="inputWrapper">
								<label for="contribution">Monthly Contribution</label>
								<input id="contribution" type="text" v-on:keyup="updateValues()">
							</div>

							<div class="inputWrapper thirds">
								<label for="period">Over a period of: </label>
								<input id="period" type="number" v-on:keyup="updateValues()">

								<button id="periodTypeMonths" class="periodType" data-type="month" @click="togglePeriodType('month')" :disabled="periodType == 'month'">Months</button>
								<button id="periodTypeYears" class="periodType" data-type="year" @click="togglePeriodType('year')" :disabled="periodType == 'year'">Years</button>
							</div>

							<div class="inputWrapper halfs">
								<label for="interestRate">APY%</label>
								<input id="interestRate" type="number" v-on:keyup="updateValues()">

								<button @click="updateValues">Calculate</button>
							</div>

						</div>
						<div class="column two">

							<div class="breakdownWrapper">
								<p>Total savings breakdown</p>
								<ul class='legend'>
									<li><p><span class="pallet grey"></span>Interest Earned = $\{{toUSD(totalInterestEarned)}}</p></li>
									<li><p><span class="pallet black"></span>Total contributions = $\{{toUSD(totalContributions)}}</p></li>
									<li><p><span class="pallet red"></span>Initial deposit = $\{{toUSD(initialDeposit)}}</p></li>
								</ul>
							</div>

							<div class="chartWrapper">
							
								<canvas id="myChart" width="400" height="400"></canvas>

							</div>

							<div class="totalWrapper">

								<div class="inputWrapper">
									<label for="totalSavings">Your total savings:</label>
									<div class="fakeInput">$\{{toUSD(totalSavings)}}</div>
								</div>

							</div>

						</div>
					</div>
			`,
			data: {
				config: config,
				initialDeposit: 0,
				contribution: 0,
				period: 0,
				periodType: "year",
				interestRate: 0,
				chart: {},
				initialDepositInput: {},
				contributionInput: {}
				},
			watch: {

			},
			mounted(){

			
				this.buildChart();


				this.initialDepositInput = new AutoNumeric('#initialDeposit').northAmerican();
				this.contributionInput = new AutoNumeric('#contribution').northAmerican();


				this.initialDepositInput.set(this.config.initialDeposit)
				this.contributionInput.set(this.config.contribution)

				document.getElementById("interestRate").value = this.config.interestRate;
				document.getElementById("period").value = this.config.period;


				this.updateValues();


			},
			updated(){

				


			},
			computed: {
				totalYears: function(){
					if(this.periodType == "month"){
						return this.period / 12 ;
					}else{
						return this.period;
					}

				},
				totalInterestEarned: function(){
					return this.totalSavings - this.totalContributions - this.initialDeposit;
				},
				totalContributions: function(){
					return (this.totalYears * 12 ) * this.contribution;
				},
				totalSavings: function () {// ie FUTURE VALUE

					var r = parseFloat(this.interestRate) / 100 / 365,
					C = parseFloat(this.contribution),
					P = parseFloat(this.initialDeposit),
					y = parseFloat(this.totalYears), // need to update this
					d = 365 * y,
					n = parseFloat(30), // monthly
					nn = Math.floor(365 / n),
					total = P + C,//add initial contribution to account for loss of interest
					ri = 0;

					
				
					var yr = new Date().getFullYear(),
					count = 0,
					initialDeposit = true,
					z,zz;
				
					while (count++ < d) {
					  z = new Date(yr, 0 , count);
					  zz = new Date(yr, 0 , count + 1);
				
					  if (count % n === 0) {
						if (!initialDeposit) {
						  total += C;
						} else {
						  initialDeposit = false;          
						}
					  }
				
					  if (zz.getDate() < z.getDate()) {
						total += ri;
						ri = 0;
					  }
				
					  ri += total * r;
					}
					console.log(total);
					return total;

				  }
			},
			methods: {
				updateValues(){
					this.initialDeposit = this.initialDepositInput.getNumber();
					this.contribution = this.contributionInput.getNumber();
					this.interestRate = document.getElementById("interestRate").value;
					this.period = document.getElementById("period").value;

					this.chart.data.datasets[0].data[0] = this.initialDeposit;
					this.chart.data.datasets[1].data[0] = this.totalContributions;
					this.chart.data.datasets[2].data[0] = this.totalInterestEarned;
	
					this.chart.update();
				},
				togglePeriodType(type){
					this.periodType = type;
					this.updateValues()
				},
				buildChart(){

					var ctx = document.getElementById('myChart');
					var myChart = new Chart(ctx, {
						type: 'bar',
						data: {
							datasets: [
							{
								label: 'Initial Deposit',
								backgroundColor: "#BD001F",
								data: [this.initialDeposit],
							}, {
								label: 'Total Contributions',
								backgroundColor: "#262626",
								data: [this.totalContributions],
							},{
								label: 'Interest Earned',
								backgroundColor: "#E1E1E1",
								data: [this.totalInterestEarned],
							}],
						},
					options: {

						tooltips: { callbacks: { title: function(tooltipItem, data) {
							 return "";
						}}},
						scales: {
						  xAxes: [{
							stacked: true,
							gridLines: {
							  display: false,
							}
						  }],
						  yAxes: [{
							stacked: true,
							ticks: {
							  beginAtZero: true,
							},
							type: 'linear',
						  }]
						},
							responsive: true,
							maintainAspectRatio: false,
							legend:{
								display:false
							}
						}
					});

					this.chart = myChart;

				},
				toUSD: function(num) {
					num = Math.round(num * 100) * 0.01;
					var currstring = num.toString();
					if (currstring.match(/\./)) {
						var curr = currstring.split('.');
					} else {
						var curr = [currstring, "00"];
					}
					curr[1] += "00";
					curr[2] = "";
					var returnval = "";
					var length = curr[0].length;
					
					// add 0 to decimal if necessary
					for (var i = 0; i < 2; i++) 
						curr[2] += curr[1].substr(i, 1);
				 
					// insert commas for readability
					for (i = length; (i - 3) > 0; i = i - 3) {
						returnval = "," + curr[0].substr(i - 3, 3) + returnval;
					}
					returnval = curr[0].substr(0, i) + returnval + "." + curr[2];
					return(returnval);
				}
			}
		  })
		  window.myapp = app;






}



export default function(conf,langItems){

	


	window.jQuery = window.$;

	// Overrides for configuration
	Object.assign(config,conf);

	console.log(config);

	// Overrides for language
	Object.assign(lang,langItems);


	startApp();


	


	

	
}

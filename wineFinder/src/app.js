const axios = require('axios').default;
import Vue from 'vue';



var app; 

var config = {

}

var lang = {

}

var startApp = function(){

	Vue.component("listing", {
		props: {
			info: Object,
		    open: Boolean
		},
		template: /*html*/`
			<div class="listing">	
		  		<div class="details">
					<h3 class="name">{{info.name}}</h3>
					<p class="address" v-html="fullAddress"></p>
					<a :href="mapLink" class="mapLink" target="_blank">
					  <p class="distance"><span>{{info.distance}} mi </span></p>
					  <img :src="config.mapIcon">
					</a>
					
					
					<a class="openLink" @click="open = !open">SHOW WINES</a>
				</div>
				<div class="products" v-if="open">
					<a class="closeLink" @click='open = false'>X</a>
					<h2 class="name">{{info.name}}</h2>
					<ul>
						<li class="product" v-for="(product, index) in sortedWineList" :key="index">
							<p>{{product.description}}</p>
						</li>
					</ul> 
				</div>

		  </div>
		`,
		computed:{
			fullAddress: function(){
				return `${this.info.address} <br> ${this.info.city}, ${this.info.state} ${this.info.zip}`
			},
			mapLink: function(){
				return `http://maps.google.com/?q=${this.info.address},${this.info.name}`;
			},
			sortedWineList: function(){
				return _.sortBy(this.info.products, 'description');
			}
		},
		data(){
			return {
				config: config,
				count: 0,
			}
		},
		methods: {

		}
	  });


	  Vue.component("pagination", {
		  props: {
			  currentPage: Number,
			  totalPages: Number,
			  totalResults: Number
		  },
		  template: /*html*/`
			  <ul class="pager" v-if="totalPages > 1">

				<li class="page-item first" v-if="currentPage != 1">
					<a @click="setPage(1)" class="page-link">First</a>
				</li>

				<li class="page-item previous" v-if="currentPage > 1">
					<a @click="setPage(currentPage - 1)" class="page-link">Previous</a>
				</li>

				<li v-for="(page,index) in pagesToShow" :key="page" class="page-item previous" :class="{active: page === currentPage}">
					<a @click="setPage(page)" class="page-link">{{page}}</a>
				</li>

				<li class="page-item next" v-if="currentPage < totalPages">
		  			<a @click="setPage(currentPage + 1)" class="page-link">Next</a>
				</li>

				<li class="page-item last" v-if="currentPage != totalPages">
					<a @click="setPage(totalPages)" class="page-link">Last</a>
		  		</li>
					  
			  </ul>
		  `,
		  data() {
			  return {
				lowerLimit: 0,
				upperLimit: 0
			  }
		  },
		  methods: {
			  setPage: function(pageNumber){
				this.$emit('changePage', pageNumber);
			  },

			  },
		computed: {
			pagesToShow: function(){

				var pages = [];
				this.lowerLimit = this.currentPage - 2;
				this.upperLimit = this.currentPage + 2;

				for (let i = 1; i < this.totalPages + 1; i++) {
					
					if(i >= this.lowerLimit && i <= this.upperLimit ){
						console.log("lower push")
						pages.push(i);
					}
				}

				return pages;


		}
		  }
	  })


		app = new Vue({
			el: '#wineFinder',
			template: /*html*/`
					<div class="appContainer">

						<div class="searchContainer">
							<h1 v-html="config.headline"></h1>
							<div class="inputContainer">
								<input type="number" placeholder="ZIP CODE" v-model="zip">

								<button v-on:click="search()" class='search'><span>SEARCH</span></button>
							</div>
						</div>

						<div class="filterContainer">

								<h2>FILTER PRODUCTS</h2>

								<div class="filters">
									<select v-model="product" id="products">
										<option value="">Choose Wine (optional)</option>
										<option v-for="product in productList" :key="product.product_key" :value="product.product_key">{{product.description}}</option>

		
									</select>
									<div class="inputContainer">

										<div class="fieldWrapper">
											<input type="checkbox" v-model="retail" id="retail" name="retail" value="true">
											<label for="retail"> Store</label>
										</div>
										<div class="fieldWrapper">
											<input type="checkbox" v-model="restaurant" id="restaurant" name="restaurant" value="true">
											<label for="restaurant"> Restaurant</label>
										</div>
										<div v-show="onPremise == null" class="error">Please select one</div>
									</div>
								<button v-on:click="search()"><span>Filter</span></button>
							</div>
						</div>

						<div class="resultsContainer" :class="{isSubmitting : isSubmitting}" v-show="results.retailers.length > 0">
							<div class="selectWrapper">
								<label for="perPage">Results per page</label>
								<select v-model="perPage" id="perPage" class="resultsPerPage" @change="search()">
									<option value="9">9</option>
									<option value="18">18</option>
									<option value="27">27</option>
								</select>
							</div>
							<div class="countWrapper">
								<h2 class="resultCount">We found {{results.total_results}} results within {{radius}} miles</h2>
								<span class="bullet">&bull;</span>
								<span class="showAll" @click="toggleAllWines">{{showAllWines ? "Hide All Wines" : "Show All Wines"}}</span>
							</div>
							<div class="listings">
								<listing v-for="(item,index) in results.retailers" :info="item" :key="index" :open="showAllWines"></listing>
							</div>
							<pagination @changePage="changePage" :totalPages="results.total_pages" :totalResults="results.total_results" :currentPage="parseInt(results.page)"></pagination>
						</div>
					</div>
			`,
			data: {
				zip: config.defaultZip,
				product: '',
				retail: true,
				restaurant: true,
				config: config,
				currentPage: 1,
				perPage: config.resultsPerPage || 6,
				radius: 50,
				showAllWines: false,
				productList: [],
				checkBoxesInited: false,
				perPageOptions: ["9","18","27"],
				results: {
					retailers: [],
					page: 1,
					total_pages: 1,
					total_results: 1
				},
				isSubmitting: false
			},
			mounted(){

				this.getProductListFromAPI()
			
			},
			updated(){
				console.log("app updated")
				if(!this.checkBoxesInited && this.productList.length > 0){
					this.initSelectBoxes();
				}
			},
			computed: {
				onPremise: function(){
					if(this.retail && this.restaurant){
						return "";
					}else if(this.retail && !this.restaurant){
						return false;
					}else if(!this.retail && this.restaurant) {
						return true;
					}else{
						return null;
					}

				}
			},
			methods: {
				initSelectBoxes(){

					var vue = this;

					var standardOptions = {
						wrapperClass:         'xComboWrapper',
						inputClass:           'xComboInput',
						dropdownClass:        'xComboOptions',
						dropdownContentClass: 'xComboOption',
						selectOnTab:          true,
						allowEmptyOption:     true,
					  };

					var perPageSelect = $('select#perPage').selectize(standardOptions);

					  perPageSelect.on("change", function(e){
						  console.log(e.target.value);
						  vue.perPage = parseInt(e.target.value);
						  vue.search();
					  })

					  var productSelect = $('select#products').selectize(standardOptions);

					  productSelect.on("change", function(e){
						  console.log(e.target.value);
						  vue.product = e.target.value;
						//  vue.search();
					  })

					  vue.checkBoxesInited = true;

				},

				toggleAllWines: function(open){
						this.showAllWines = !this.showAllWines;
				},

				changePage: function(page){
					this.currentPage = page;
					this.getResultsFromAPI();

				},

				search: function(){
					this.currentPage = 1;
					this.getResultsFromAPI();
				},
				getResultsFromAPI: function(){

					this.isSubmitting = true;
						var vue = this;
					var setup = {
						method: 'get',
						url: `https://api.smwe.com/v1/${this.config.brandCode}/retailers?location=${this.zip}&radius=${this.radius}&pagination=true&page=${this.currentPage}&per_page=${this.perPage}&product=${this.product}&on_premise=${this.onPremise}`,
						headers: { 
						  'Authorization': 'Token token="cb17db4a7042b816d4f0686d97b6ad1f"'
						}
					  };
					  
					  axios(setup)
					  .then(function (response) {
						console.log(response.data);
 						vue.results = response.data;
						vue.isSubmitting = false;
						
					  })
					  .catch(function (error) {
						console.log(error);
					  });
					  

				},
				getProductListFromAPI: function(){

					this.isSubmitting = true;
					var vue = this;

					var setup = {
						method: 'get',
						url: `https://api.smwe.com/v1/${this.config.brandCode}/products`,
						headers: { 
						  'Authorization': 'Token token="cb17db4a7042b816d4f0686d97b6ad1f"'
						}
					  };
					  axios(setup)
					  .then(function (response) {
							vue.productList = response.data

							if(vue.config.defaultZip){
								vue.getResultsFromAPI();
							}
							
					

					  })
					  .catch(function (error) {
						console.log(error);
					  });
				}


			

			}
		  })
		  window.myapp = app;






}


export default function(conf,langItems){

	
	console.log("my app ready");


	window.jQuery = window.$;

	// Overrides for configuration
	Object.assign(config,conf);
	// Overrides for language
	Object.assign(lang,langItems);

		startApp();
	

	
}

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
	
	// pretty names for stops
	names = {
		'sama': 'Sama',
		'dtc': 'DTC',
		'cse': 'CSE'
	};
	
	// Our basic **Bus** model has stops
	var Bus = Backbone.Model.extend({

		// Default attributes for the todo item.
		defaults: function() {
			return {
				stops: [
					{
						name: 'sama',
						time: 2145
					},
					{
						name: 'dtc',
						time: 2155
					}
				]
			};
		},
		
		// Return the pretty name for a stop
		prettyName: function( id ) {
			return names[ id ];
		},
		
		// Return the pretty display for a time
		prettyTime: function( time ) {
			return time;
		}
		
	});

	// Bus Collection
	// ---------------
	var BusList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Bus,

		localStorage: new Backbone.LocalStorage("bus-list"),
		
		// check if a bus will be leaving from a certain location (this is the desired stop)
		checkBus: function( bus ) {
			return _.some( bus.get('stops'), Buses.checkStop, this );
		},
		
		// check if a stop matches a given time & location (this is the desired stop)
		checkStop: function( stop ) {
			
			// if asked, check that the stop name matches
			if( this.stop != undefined && this.stop != stop.name ) {
				return false;
			}
			
			// if asked, check that the stop time is after the requested time
			if( this.time != undefined && this.time >= stop.time ) {
				return false;
			}
						
			return true;
		},

		// Filter down the list of buses to those from a certain location
		from: function( stop_name, time ) {
		  return this.filter(this.checkBus, {
				stop: stop_name,
				time: time
			});
		},

	});

	var BusSchedule = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Bus,

		localStorage: new Backbone.LocalStorage("bus-schedule"),

		// Filter down the list to only todo items that are still not finished.
		// remaining: function() {
		//   return this.without.apply(this, this.done());
		// },

		// We keep the Todos in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		// nextOrder: function() {
		//   if (!this.length) return 1;
		//   return this.last().get('order') + 1;
		// },
		// 
		// // Todos are sorted by their original insertion order.
		// comparator: 'order'

	});

	// Create the visible collection buses
	var Schedule = new BusSchedule;
	
	// Create the entire collection buses
	var Buses = new BusList;

	// The DOM element for a bus...
	var BusView = Backbone.View.extend({

		//... is a list tag.
		tagName:  "li",

		// Cache the template function for a single item.
		template: _.template($('#bus-template').html()),

		// The DOM events specific to an item.
		events: {
			// "click .toggle"   : "toggleDone",
			// "dblclick .view"  : "edit",
			// "click a.destroy" : "clear",
			// "keypress .edit"  : "updateOnEnter",
			// "blur .edit"      : "close"
		},

		// The TodoView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Todo** and a **TodoView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			// this.listenTo(this.model, 'destroy', this.remove);
		},

		// Re-render the titles of the todo item.
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		// Remove the item, destroy the model.
		// clear: function() {
		  // this.model.destroy();
		// }

	});

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: $("#bus-app"),
		
		// Our template for the selection of stops
    stopTemplate: _.template($('#stop-template').html()),
		
		// Delegated events for creating new items, and clearing completed ones.
		events: {
			// "keypress #new-todo":  "createOnEnter",
			// "click #clear-completed": "clearCompleted",
			// "click #toggle-all": "toggleAllComplete"
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function() {

			// this.input = this.$("#new-todo");
			// this.allCheckbox = this.$("#toggle-all")[0];
			// 
			this.listenTo(Schedule, 'add', this.addOne);
			this.listenTo(Schedule, 'reset', this.addAll);
			this.listenTo(Schedule, 'all', this.render);
			// 
			this.from = this.$('#from');
			
			this.from.html('');
			_.each( names, function( pretty, key ) {
				this.from.append( this.stopTemplate( { name: pretty, key: key } ) );
			}, this );
			
			this.filter();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			// this.$el.html(this.template(this.model.toJSON()));
						
			return this;
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function(bus) {
			var view = new BusView({model: bus});
			this.$("#schedule").append(view.render().el);
		},

		// Add all items in the **Todos** collection at once.
		addAll: function() {
			Schedule.each(this.addOne, this);
		},

		// Only show relevent buses
		filter: function() {			
			Schedule.reset( Buses.from( 'sama', 1500 ) );
		  return false;
		},
		// 
		// toggleAllComplete: function () {
		//   var done = this.allCheckbox.checked;
		//   Todos.each(function (todo) { todo.save({'done': done}); });
		// }

	});
	
	Buses.create();
	
	Buses.create({
		stops: [
			{
				name: 'sama',
				time: 2230
			},
			{
				name: 'dtc',
				time: 2240
			}
		]
	});
	
	Buses.create({
		stops: [
			{
				name: 'sama',
				time: 1900
			},
			{
				name: 'dtc',
				time: 1950
			}
		]
	});

	// Finally, we kick things off by creating the **App**.
	var App = new AppView;
});
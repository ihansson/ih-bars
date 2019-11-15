let nodes = [],
	last_call = false,
	events = {}
	throttle = 50;

// Custom events

const event_names = ['bars/load', 'bars/before_load', 'bars/update', 'bars/before_update', 'bars/remove'];
for(ev in event_names){
	let event = document.createEvent('Event');
	event.initEvent(event_names[ev], true, true);
	events[event_names[ev]] = event;
}

// Add nodes to update list
function add(selector, options){
	let _nodes = document.querySelectorAll(selector);
	_nodes = Array.prototype.slice.call(_nodes)
	for(i in _nodes) load(_nodes[i], options)
	nodes = nodes.concat(_nodes)
}

// Remove node from list to update
function remove(node){
	node.dispatchEvent(events['bars/remove'])
	if(node.aiv.timeout) window.clearTimeout(node.aiv.timeout)
	nodes = nodes.filter(function(_node){ return _node !== node})
}

// Sets up initial classes on nodes
function load(node, options){

	node.bars = {
		data: [],
		spacing : 0,
		height: 100,
		vertical_align : 'middle',
		color_mode: 'linear',
		colors: ['FF0000','00FF00'],
		pills: false,
		circle: false,
		show_number: false
	}

	if(node.attributes.bars){
		let settings = node.attributes.bars ? extract_settings(node.attributes.bars.nodeValue) : {};
		for(setting in settings){
			node.bars[setting] = settings[setting]
		}
	}

	if(options){
		for(opt in options){
			node.bars[opt] = options[opt]
		}
	}

	node.bars.colors = node.bars.colors.map(function(value){ return hexToRgb(value) })

	node.dispatchEvent(events['bars/load'])

	update(node)

}

function update(node){

	node.dispatchEvent(events['bars/before_update'])

	const width = node.offsetWidth;
	const spacing = node.bars.spacing ? (width / node.bars.data.length) * (node.bars.spacing / 100) : false;
	const bar_width = !spacing ? (width / node.bars.data.length).toFixed(2) : (((width - (node.bars.data.length - 1) * spacing)) / node.bars.data.length).toFixed(2)
	const max_height = width * (node.bars.height / 100);

	node.style["height"] = (node.bars.circles ? bar_width+'px' : max_height+'px');

	let bar_elements = '<div class="ih-bars">';
	let max = 0;
	let min = 0;

	node.bars.data.forEach(function(value){
		if(value > max) max = parseFloat(value)
		if(value < min) min = parseFloat(value)
	})


	node.bars.data.forEach(function(value, index) {
		let background;
		let inner_styles = '';
		let outer_styles = '';
		let bar_height = ((((parseFloat(value) - min) * 100) / (max - min)) / 100) * (node.bars.circles ? bar_width : max_height);
		outer_styles += 'vertical-align:'+node.bars.vertical_align+';';
		if(index + 1 !== node.bars.data.length && spacing) outer_styles += 'margin-right:'+spacing+'px;';
		if(node.bars.pills) inner_styles += 'border-radius:'+(bar_width/2)+'px;';
		if(node.bars.circles) {
			inner_styles += 'width:'+bar_height+'px;';
			outer_styles += 'padding:0 '+((bar_width - bar_height) / 2)+'px;'
			inner_styles += 'border-radius:50%;';
		} else {
			inner_styles += 'width:'+bar_width+'px;';
		}
		if(node.bars.color_mode == 'linear'){
			background = get_color_linear(node.bars.colors, index, node.bars.data.length)
		} else {
			background = get_color_linear(node.bars.colors, value, max)
		}
		inner_styles += 'background:'+background+';';
		inner_styles += 'line-height:'+bar_height+'px;';
		inner_styles += 'height:'+bar_height+'px;';
		bar_elements += '<div class="ih-bar" style="'+outer_styles+'"><div class="ih-bar-inner" style="'+inner_styles+'">'+(node.bars.show_number ? '<span class="ih-bar-number">' + value + '</span>' : '')+'</div></div>'
	})

	bar_elements += '</div>';

	node.innerHTML = bar_elements;

	node.dispatchEvent(events['bars/update'])

}

function update_all(){
	const now = Date.now();
	if(last_call && now - last_call < throttle) return;
	last_call = now;
	for(i in nodes) update(nodes[i])
}

// Extracts setting values
function extract_settings(string){
	let settings = {};
	if(!string) return settings;
	string.split(';').forEach(function(setting){
		let arr = setting.trim().split(':')
		if(!arr[0]) return;
		let key = arr[0].trim();
		let value = arr[1] ? arr[1].trim() : true;
		if(['height', 'spacing'].indexOf(key) !== -1) value = parseInt(value)
		if(['data'].indexOf(key) !== -1) value = value.split(',').map(function(value){ return parseFloat(value) })
		if(['colors'].indexOf(key) !== -1) value = value.split(',').map(function(value){ return value.replace('#','') })
		settings[key] = arr[1] ? value : true
	});
	return settings;
}

// Color helpers
function get_color_linear(colors, index, length){
	const perc = (100 / length) * index
	return 'rgb('+get_color_step(colors, 'r', perc)+','+get_color_step(colors, 'g', perc)+','+get_color_step(colors, 'b', perc)+')';
}

function get_color_step(colors, key, perc){
	const a = colors[0][key]
	const b = colors[1][key]
	return ((((b - a) / 100) * perc) + a).toFixed(0)
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Adds default selector nodes
function init(){
	add('[bars]');
	window.addEventListener('resize', update_all)
}

function destroy(){
	nodes = []
	window.removeEventListener('resize', update_all)
}

module.exports = {
	init: init,
	destroy: destroy,
	add: add,
	remove: remove,
	load: load
};
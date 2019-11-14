let nodes = [],
	last_call = false,
	events = {}
	throttle = 100;

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

	node.dispatchEvent(events['bars/load'])

	update(node)

}

function update(node){

	node.dispatchEvent(events['bars/before_update'])

	const width = node.offsetWidth;
	const spacing = node.bars.spacing ? (width / node.bars.data.length) / node.bars.spacing : false;
	let bar_width;

	if(spacing){
		bar_width = (((width - (node.bars.data.length - 1) * spacing)) / node.bars.data.length).toFixed(2);
	} else {
		bar_width = (width / node.bars.data.length).toFixed(2);
	}

	node.style["height"] = (node.bars.circles ? bar_width+'px' : node.bars.height+'px');

	let bar_elements = '<div class="ih-bars">';
	let max = 0;
	let min = 0;

	node.bars.data.forEach(value => {
		if(value > max) max = parseFloat(value)
		if(value < min) min = parseFloat(value)
	})

	node.bars.data.forEach((value, index) => {
		let inner_styles = '';
		let outer_styles = '';
		let bar_height = ((((parseFloat(value) - min) * 100) / (max - min)) / 100) * (node.bars.circles ? bar_width : node.bars.height);
		outer_styles += 'vertical-align:'+node.bars.vertical_align+';';
		if(index + 1 !== node.bars.data.length && spacing) inner_styles += 'margin-right:'+spacing+'px;';
		if(node.bars.pills) inner_styles += 'border-radius:'+(bar_width/2)+'px;';
		if(node.bars.circles) {
			inner_styles += 'width:'+bar_height+'px;';
			outer_styles += 'padding:0 '+((bar_width - bar_height) / 2)+'px;'
			inner_styles += 'border-radius:50%;';
		} else {
			inner_styles += 'width:'+bar_width+'px;';
		}
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
	console.log('update all')
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
		settings[key] = arr[1] ? value : true
	});
	return settings;
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
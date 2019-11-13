let nodes = [],
	last_call = false,
	events = {};

// Custom events

const event_names = ['bars/load', 'bars/before_load', 'bars/remove'];
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

	node.dispatchEvent(events['bars/before_load'])

	const width = node.offsetWidth;

	node.style["height"] = node.bars.height+'px';

	const bar_width = (((width - (node.bars.data.length - 1) * node.bars.spacing)) / node.bars.data.length).toFixed(2);

	let bar_elements = '';
	let max = 0;
	let min = 0;

	node.bars.data.forEach(value => {
		if(value > max) max = parseFloat(value)
		if(value < min) min = parseFloat(value)
	})

	node.bars.data.forEach((value, index) => {
		let styles = '';
		let bar_height = ((((parseFloat(value) - min) * 100) / (max - min)) / 100) * node.bars.height;
		styles += 'line-height:'+bar_height+'px;';
		styles += 'height:'+bar_height+'px;';
		styles += 'vertical-align:'+node.bars.vertical_align+';';
		if(index + 1 !== node.bars.data.length) styles += 'margin-right:'+node.bars.spacing+'px;';
		if(node.bars.pills) styles += 'border-radius:'+(bar_width/2)+'px;';
		if(node.bars.circles) {
			styles += 'width:'+bar_height+'px;';
			styles += 'padding:'+(bar_width - bar_height)+';'
			styles += 'border-radius:50%;';
		} else {
			styles += 'width:'+bar_width+'px;';
		}
		bar_elements += '<div class="ih-bar" style="'+styles+'">'+(node.bars.show_number ? value : '')+'</div>'
	})

	node.innerHTML = bar_elements;

	node.dispatchEvent(events['bars/load'])

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
}

module.exports = {
	init: init,
	add: add,
	remove: remove,
	load: load
};
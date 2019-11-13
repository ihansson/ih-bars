const Bars = {
	prefix: 'bars',
	throttle: 500,
	last_call: false,
	nodes: false,
	bar_style: 'display:inline-block;text-align:center;background:blue;color:white;',
	init: function(context){
		this.nodes = document.querySelectorAll('['+this.prefix+']');
		if(!this.nodes) return;
		this.render_all_bars();
		return this
	},
	render_all_bars: function(){
		this.nodes.forEach((node) => {
			this.render_bars(node)
		})
	},
	render_bars: function(node){

		const width = node.offsetWidth;

		const data = node.attributes[this.prefix].nodeValue.split(',')
		const spacing = node.attributes[this.prefix+'-spacing'] ? node.attributes[this.prefix+'-spacing'].nodeValue : 0
		const height = node.attributes[this.prefix+'-height'] ? node.attributes[this.prefix+'-height'].nodeValue : 100
		const vertical_align = node.attributes[this.prefix+'-vertical_align'] ? node.attributes[this.prefix+'-vertical_align'].nodeValue : 'center'
		const pills = node.attributes[this.prefix+'-pills']
		const show_number = node.attributes[this.prefix+'-show_number']

		node.style["height"] = height+'px';

		const bar_width = (((width - (data.length - 1) * spacing)) / data.length).toFixed(2);

		let bar_elements = '';
		let max = 0;
		let min = 0;

		data.forEach(value => {
			if(value > max) max = parseFloat(value)
			if(value < min) min = parseFloat(value)
		})

		data.forEach((value, index) => {
			let styles = this.bar_style;
			let bar_height = ((((parseFloat(value) - min) * 100) / (max - min)) / 100) * height;
			styles += 'width:'+bar_width+'px;';
			styles += 'line-height:'+bar_height+'px;';
			styles += 'height:'+bar_height+'px;';
			styles += 'vertical-align:'+vertical_align+';';
			if(index + 1 !== data.length) styles += 'margin-right:'+spacing+'px;';
			if(pills) styles += 'border-radius:'+(bar_width/2)+'px';
			bar_elements += '<div style="'+styles+'">'+(show_number ? value : '')+'</div>'
		})

		node.innerHTML = bar_elements;

	}
}

module.exports = Object.create(Bars);
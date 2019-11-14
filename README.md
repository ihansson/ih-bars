## Under heavy construction. I would not recommend using this library at the moment.

# Bars - [View demo](http://ianhan.com/libraries/ih-bars/demo)

Bars is a library for rendering simple bar visualizations.

## Basic Example

Settings are separated with a comma, data is provided in a comma separated list.

```html
<div bars="data: 25,0,15,10,2; spacing: 25; height: 80; show_number; vertical_align: bottom;"></div>

<!-- Display pills -->
<div bars="data: 25,0,15,10,2,15,5,2,1,2,3,2,2,1; spacing: 5; height: 150; pills;"></div>

<!-- Display circles -->
<div bars="data: 25,0,15,10,2; spacing: 25; height: 80; circles;"></div>
```

### Bars Options

| Command | Default | Description |
| --- | --- | --- |
| data | '' | A comma separated list of numbers |
| spacing | 0 | Space between bars in percentage of bar width |
| height | 100 | Maximum height in pixels |
| show_number | false | Output data number in bar |
| vertical_align | middle | Vertically align the bar top/middle/bottom |
| pills |  false | Render bars as pills with border-radius equal to half of their width |
| circles | false | Render bars as circles. This will ignore the height option and instead use a proportion of width. |

### Events

The following events are triggered for nodes

| Event Name | Action |
| --- | --- |
| bars/load | Node has been loaded |
| bars/before_update | Node is about to be updated |
| bars/update | Node has been updated |
| bars/remove | Node has been removed from the bars watch list |

### Init

Include the library and init using default options.

```html
<link rel="stylesheet" type="text/css" href="bars.css">
```

```html
<script type="text/javascript" src="bars.min.js"></script>
<script type="text/javascript">bars.init()</script>
```

### Todo

* Make responsive properly
* Fix bug with overflowing width
* Add colours
* Circle bars should fill width
* Allow for percentage height
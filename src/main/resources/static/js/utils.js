$.fn.extend({
	righteousToggle: function(show) { // avoids triggering show animation when not necessary
		if ($(this).is(':visible') && !show) {
			$(this).hide();
		} else if ($(this).is(':hidden') && show) {
			$(this).show();
		}
		return this;
	},
	numberChange: async function(newNumber, str, onstep) {
	    if (!document.hidden ) {
            $(this).prop('Counter', $(this).text()).stop().animate({ Counter: newNumber }, {
                duration: 800,
                easing: 'swing',
                step: function (now) {
                    $(this).text((str ? str : '') + Math.ceil(now));
                    if (onstep) onstep($(this), Math.ceil(now));
                }
            });
        }
        return this;
    },
	rgbColor: function(r, g, b) {
		return $(this).css("color", "rgb(" + r + "," + g + "," + b + ")");
	},
	whiteColor: function() {
	    return $(this).rgbColor(255, 255, 255);
	},
	taxColor: function(tax) {
	    if (!tax)
	    {
	        return $(this).whiteColor();
	    }
	    var r = 255;
        var g = 255 - Math.max(5 * tax - 245, 0);
        var b = 255 - Math.min(5 * tax, 255);
        return $(this).rgbColor(r, g, b);
	},
	mouseCoords(event, scaleWidth, scaleHeight) {
        var posX = event.pageX - $(this).position().left;
        var posY = event.pageY - $(this).position().top;

        var myX = Math.floor(posX * scaleWidth / $(this).width());
        var myY = Math.floor(scaleHeight - posY * scaleHeight / $(this).height());
        return {x: myX, y: myY};
    },
	trackClicks: function(valueHolder, valueDisplayFn, valueClipFn, scaleWidth, scaleHeight) {
	    function myClickTrack(event) {
	        if (event.which == 1) {
                var crds = $(this).mouseCoords(event, scaleWidth, scaleHeight);
                valueClipFn(crds);
            }
	    }

	    $(this).mouseout(function(event) {
	        valueHolder.text('');
	    }).mousemove(function(event) {
	        var crds = $(this).mouseCoords(event, scaleWidth, scaleHeight);
	        var str = valueDisplayFn(crds);
	        valueHolder.text(str);
	    }).unbind('click').bind('click', myClickTrack);
	},
	percentWidth: function() {
	    return 100 * $(this).width() / $(window).width();
	},
	percentHeight: function() {
        return 100 * $(this).height() / $(window).height();
    },
    percentLeft: function() {
        return 100 * $(this).position().left / $(window).width();
    },
    percentTop: function() {
        return 100 * $(this).position().top / $(window).height();
    },
    percentValue: function(prop, newVal) {
         return $(this).css(prop, newVal + '%');
    },
	scaleToRatio: function(ratioW2H) { // preserves the center
	    var originalPosition;
        var originalDimensions;
	    if (!$(this).attr('originalPosition')) { // store the original values
	        originalPosition = {left: $(this).percentLeft(), top: $(this).percentTop()};
	        originalDimensions = {width: $(this).percentWidth(), height: $(this).percentHeight()};
	        $(this).attr('originalPosition', JSON.stringify(originalPosition));
	        $(this).attr('originalDimensions', JSON.stringify(originalDimensions));
	    } else { // reset to original dimensions first
            originalPosition = JSON.parse($(this).attr('originalPosition'));
            originalDimensions = JSON.parse($(this).attr('originalDimensions'));
            $(this).percentValue('left', originalPosition.left);
            $(this).percentValue('top', originalPosition.top);
            $(this).percentValue('width', originalDimensions.width);
            $(this).percentValue('height', originalDimensions.height);
        }

        if (ratioW2H > 1) { // apply the ratio thingy
            let originalHeight = originalDimensions.height;
            let newHeight = originalHeight / ratioW2H;
            $(this).percentValue('top', originalPosition.top + ((originalHeight - newHeight) / 2));
            $(this).percentValue('height', newHeight);
        } else if (ratioW2H < 1) {
            let originalWidth = originalDimensions.width;
            let newWidth = originalWidth * ratioW2H;
            $(this).percentValue('left', originalPosition.left + ((originalWidth - newWidth) / 2));
            $(this).percentValue('width', newWidth);
        }

        return $(this);
    },
    tooltip: function(txt) {
        var tooltipEl = $('<span>' + txt + "</span>").addClass('tooltiptext');
        $(this).addClass('tooltip').append(tooltipEl);
    },
    richText: function(text) {
        $(this).addClass("richText").children().remove();
        // changes {className|text} to <span class="className">text</span> and adds icons for resource classes
        // then appends the result to the element
        var tokens = text.split(/\{|\}/g);
        for (var i = 0; i < tokens.length; i++) {
            var tt = tokens[i].split(/\|/);
            if (tt.length > 1) {
                var className = tt[0];
                var parentElement = $('<span/>').addClass(className);

                if (["minerals", "gas", "supply", "terrazine"].includes(className)) {
                    var race = PLAYER_GLOBAL_DATA.race;
                    var iconEl = $('<span/>').addClass("inlineIcon").css("background-position-y", (51 * (race - 1)) + "%");
                    var textClass = (className == "supply") ? RACE_CLASSES[race] : className;
                    var textEl = $('<span/>').addClass(textClass).text(tt[1]);
                    parentElement.append(iconEl).append(textEl);
                } else {
                    parentElement.text(tt[1]); // safe injection, jquery escapes this
                }
                $(this).append(parentElement);
            } else {
                $(this).append($('<span/>').text(tt[0])); // safe injection, jquery escapes this
            }
        }
    }
});

function randomInt(max, min) {
    return min ? min + Math.floor(Math.random() * (max - min)) : Math.floor(Math.random() * max);
}
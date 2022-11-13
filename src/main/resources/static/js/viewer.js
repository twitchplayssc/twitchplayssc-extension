function pollResourcesPeriodically(firstCall)
{
	if(!token) { 
		setTimeout(() => pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		return;
	}
	
	ebsReq({
		url: OVERLAY_API_BASE_URL + '/display?timestamp'
		    + new Date().getTime()
		    + (!isGameDataApplied ? "&fetchGlobalGameData=true" : "")
		    + (SKILLS == null ? "&firstRequest=true" : ""),
		type: 'GET',
		success: function(data) {
            var playerInGameData = data.inGameData;
			$('.resource').righteousToggle(playerInGameData);
            $('.minimap-click-data, .minimap, .command-card-click-data, .command-card').righteousToggle(playerInGameData);
			if (playerInGameData) {
			    if (data.map && $('.minimap').length > 0) {
			        $('.minimap').scaleToRatio(data.map.ratio ? data.map.ratio : 1);
                    isGameDataApplied = true;
			    }
                if (data.commandCard)
                {
                    $('.command-card').css({
                        'border': data.commandCard.debugBorder ? '1px solid white' : 'none',
                        'left': data.commandCard.left,
                        'top': data.commandCard.top,
                        'width': data.commandCard.width,
                        'height': data.commandCard.height
                    }).show().trackClicks($('.command-card-click-data'), crds => {
                            var cell = data.commandCard.cells[crds.x + "," + crds.y];
                            return cell ? cell.tip : '';
                        },
                        crds => {
                            var cell = data.commandCard.cells[crds.x + "," + crds.y];
                            if (cell) {
                                copyToClipboard(cell.copyText, cell.clipToken)
                            }
                        },
                        data.commandCard.widthCells, data.commandCard.heightCells);
                }

                setStanceText(playerInGameData.stance);
			    setFocusText(playerInGameData.focus);

				$('.gas .value').numberChange(playerInGameData.gas);
				$('.minerals .value').numberChange(playerInGameData.minerals);
                $('.supply .value').text(playerInGameData.supply);
                $('.terrazine .value').text(playerInGameData.terrazine);

                $('.feeding').righteousToggle(playerInGameData.feeding);
                $('.resource.income').righteousToggle(!playerInGameData.feeding);

                $('.feeding .value').text(playerInGameData.feeding);
                $('.gas-income .value').taxColor(playerInGameData.gasTax).numberChange(playerInGameData.gasIncome, '+');
                $('.minerals-income .value').taxColor(playerInGameData.mineralsTax).numberChange(playerInGameData.mineralsIncome, '+');

                if (playerInGameData.workers) {
                    $('.workers-minerals .value').numberChange(playerInGameData.workers.minerals);
                    $('.workers-gas .value').numberChange(playerInGameData.workers.gas);
                    $('.workers-moving .value').numberChange(playerInGameData.workers.moving);
                    $('.workers-idle .value').numberChange(playerInGameData.workers.idle, '', function(e, val) {
                        e.toggleClass("value-warn", val > 0);
                    });
                }

                $('.statIcon, .feeding .icon').css("background-position-y", (48 * (playerInGameData.race - 1)) + "%");

                $('.army').righteousToggle(playerInGameData.army);
                if (playerInGameData.army) {
                    updateArmy(playerInGameData.army);
                }

                $('.sellout').righteousToggle(data.sellout);

                if (data.events) {
                    data.events.map(event => renderPersonalEvent(event));
                }
            }
            else
            {
                // reinitialize all the text boxes
                $('.feeding').righteousToggle(false);
                $('.resource .value').text('0').prop('Counter', '0');
                $('.income .value').text('+0').prop('Counter', '0').taxColor(0);
                $('#extension-hint').righteousToggle(data.globalMessage && data.globalMessage.endsWith('elcome'));
                $('.stance, .focus').html('');
                isGameDataApplied = false;
            }

            $('.message').text(data.globalMessage ? data.globalMessage : "");

            if (data.availableSkills) {
                SKILLS = data.availableSkills;
            }

			setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		}
	});
}

function updateArmy(army) {
    var unitsPresent = Object.keys(army);
    var thisIter = Math.random() + '';
    for (var i = 0; i < unitsPresent.length; i++) {
        var unit = unitsPresent[i];
        var count = army[unit];

        var unitDiv = $('#unitcount-' + unit);
        if (unitDiv.length == 0) {
            unitDiv = $('<div/>').addClass('unit');
            unitDiv.attr('id', 'unitcount-' + unit).attr('unitId', unit).attr('title', UNITS[unit]);
            unitDiv.css('background-position', UNIT_TABLE_OFFSET(unit));
            var countEl = $('<span/>').addClass('count');
            unitDiv.append(countEl);
            $('.army').append(unitDiv);
        }
        unitDiv.attr('iter', thisIter);
        unitDiv.find('.count').text(count);
    }

    // units not received on this iteration get purged
    $(".unit[iter!='" + thisIter + "']").each(function() {
        $(this).detach();
    });
}

function setStanceText(stanceString) {
    let stanceElement = $('.stance').html('');
    if (stanceString) {
        $('<span/>').addClass('label').text('stance: ').appendTo(stanceElement);
        stanceElement.append(stanceString).tooltip('Army behavior');;
    }
}

function setFocusText(focusString) {
    let focusElement = $('.focus').html('');
    if (focusString) {
        $('<span/>').addClass('label').text('focus: ').appendTo(focusElement);
        focusElement.append(focusString).tooltip('Attack priority');
    }
}

function toggleMode(joined){
	$('.resource').righteousToggle(joined);
	$('.minimap-click-data, .minimap, .command-card-click-data, .command-card').righteousToggle(joined);
	$('.message').righteousToggle(!joined);
}

$(function () {
    toggleMode(false);
	pollResourcesPeriodically(true);
	startUpdatingInGameEventsLog();
	$("#extension-hint .close").click(() => $("#extension-hint").detach());
    initTips();
});

function initTips()
{
    $('.minerals').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minerals');
    $('.gas').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vespene');
    $('.supply').tooltip('Supply: your/total/limit');
    $('.minerals-income').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minerals income');
    $('.gas-income').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vespene income');
    $('.supply').tooltip('Supply: your/total/limit');
    $('.workers-minerals').tooltip('Workers on minerals');
    $('.workers-gas').tooltip('Workers on vespene');
    $('.workers-moving').tooltip('Moving workers');
    $('.workers-idle').tooltip('Idle<br/>workers');
}


//----------------------------------
//-------AUTH-----------------------
//----------------------------------
twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;
});
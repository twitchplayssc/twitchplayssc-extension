function pollResourcesPeriodically(firstCall) {
    if (!token) {
        setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
        return;
    }

    ebsReq({
        url: OVERLAY_API_BASE_URL + '/display?timestamp'
            + new Date().getTime()
            + (!isGameDataApplied ? "&fetchGlobalGameData=true" : "")
            + (SKILLS == null ? "&firstRequest=true" : ""),
        type: 'GET',
        success: function (data) {
            var playerInGameData = data.inGameData;
            $('.when-user-in-game').righteousToggle(playerInGameData);
            $('.when-game-is-on').righteousToggle(data.inGame);

            $('#control-panel-toggle').toggleClass("ingame", data.inGame);

            if (data.levelProgress) {
                updateControlPanelButtonText(data.availablePoints);
                let levelProgress = data.availablePoints > 0 ? 1 : data.levelProgress;
                updateControlPanelLevelProgress(levelProgress);
            }

            if (playerInGameData) {
                let minimap = $('.minimap');
                if (data.map && minimap.length > 0) {
                    minimap
                        .scaleToRatio(data.map.ratio ? data.map.ratio : 1)
                        .trackClicks(
                            $('.minimap-click-data'),
                            crds => ((crds.x + 1) + " " + crds.y),
                            crds => copyToClipboard("(" + (crds.x + 1) + " " + crds.y + ")", CLIPBOARD_TARGET_C),
                            100, 100
                        );
                    isGameDataApplied = true;
                }
                if (data.commandCard) {
                    $('.command-card').css({
                        'border': data.commandCard.debugBorder ? '1px solid white' : 'none',
                        'left': data.commandCard.left,
                        'top': data.commandCard.top,
                        'width': data.commandCard.width,
                        'height': data.commandCard.height
                    }).show().trackClicks($('.command-card-click-data'), crds => {
                            let x = crds.x;
                            let y = data.commandCard.heightCells - crds.y - 1;
                            var cell = data.commandCard.cells[x + "," + y];
                            return cell ? cell.tip : '';
                        },
                        crds => {
                            let x = crds.x;
                            let y = data.commandCard.heightCells - crds.y - 1;
                            var cell = data.commandCard.cells[x + "," + y];
                            if (cell) {
                                copyToClipboard(cell.copyText, cell.clipToken)
                            }
                        },
                        data.commandCard.widthCells, data.commandCard.heightCells);
                }

                setStanceText(playerInGameData.stance);
                setFocusText(playerInGameData.focus);
                adjustArmyIconsHeight(playerInGameData.stance || playerInGameData.focus)

                $('.gas .value').numberChange(playerInGameData.gas);
                $('.minerals .value').numberChange(playerInGameData.minerals);
                $('.supply .value').text(playerInGameData.supply);
                $('.terrazine .value').text(playerInGameData.terrazine);

                $('.feeding').righteousToggle(playerInGameData.feeding).css("width", data.sellout ? "15%" : "25%");
                $('.resource.income').righteousToggle(!playerInGameData.feeding);

                $('.feeding .value').text(playerInGameData.feeding);
                $('.gas-income .value').taxColor(playerInGameData.gasTax).numberChange(playerInGameData.gasIncome, '+');
                $('.minerals-income .value').taxColor(playerInGameData.mineralsTax).numberChange(playerInGameData.mineralsIncome, '+');

                if (playerInGameData.workers) {
                    $('.workers-minerals .value').numberChange(playerInGameData.workers.minerals);
                    $('.workers-gas .value').numberChange(playerInGameData.workers.gas);
                    $('.workers-moving .value').numberChange(playerInGameData.workers.moving);
                    $('.workers-idle .value').numberChange(playerInGameData.workers.idle, '', function (e, val) {
                        e.toggleClass("value-warn", val > 0);
                    });
                }

                PLAYER_GLOBAL_DATA.race = playerInGameData.race;
                $('.statIcon, .feeding .icon').css("background-position-y", (49 * (playerInGameData.race - 1)) + "%");

                $('.army').righteousToggle(playerInGameData.army);
                if (playerInGameData.army) {
                    updateArmy(playerInGameData.army);
                }

                $('.sellout').righteousToggle(data.sellout);

                if (data.events) {
                    data.events.map(event => renderPersonalEvent(event));
                }
            } else {
                // reinitialize all the text boxes
                $('.resource .value').text('0').prop('Counter', '0');
                $('.income .value').text('+0').prop('Counter', '0').taxColor(0);
                $('#extension-hint').righteousToggle(data.globalMessage && data.globalMessage.endsWith('requires permissions'));
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
            unitDiv.attr('id', 'unitcount-' + unit).attr('unitId', unit).tooltip(UNITS[unit]);
            unitDiv.css('background-position', UNIT_TABLE_OFFSET(unit));
            var countEl = $('<span/>').addClass('count');
            unitDiv.append(countEl);
            $('.army').append(unitDiv);
        }
        unitDiv.attr('iter', thisIter);
        unitDiv.find('.count').text(count);
    }

    // units not received on this iteration get purged
    $(".unit[iter!='" + thisIter + "']").each(function () {
        $(this).detach();
    });
}

function setStanceText(stanceString) {
    let stanceElement = $('.stance').html('');
    if (stanceString) {
        $('<span/>').addClass('label').text('stance: ').appendTo(stanceElement);
        stanceElement.append(stanceString).tooltip('Army behavior');
    }
}

function setFocusText(focusString) {
    let focusElement = $('.focus').html('');
    if (focusString) {
        $('<span/>').addClass('label').text('focus: ').appendTo(focusElement);
        focusElement.append(focusString).tooltip('Attack priority');
    }
}

function adjustArmyIconsHeight(stanceOrFocusPresent) {
    $('.army').css("top", stanceOrFocusPresent ? "16.5%" : "13%");
}

function toggleMode(joined) {
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

function initTips() {
    $('.resource.minerals').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minerals');
    $('.resource.gas').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vespene');
    $('.resource.supply').tooltip('Supply: your/total/limit');
    $('.resource.minerals-income').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minerals income');
    $('.resource.gas-income').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vespene income');
    $('.resource.supply').tooltip('Supply: your/total/limit');
    $('.workers-minerals').tooltip('Workers on minerals');
    $('.workers-gas').tooltip('Workers on vespene');
    $('.workers-moving').tooltip('Moving workers');
    $('.workers-idle').tooltip('Idle<br/>workers');
    $('.feeding').tooltip("Feeding");
    $('.resource.terrazine').tooltip("Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;terrazine");
}


//----------------------------------
//-------AUTH-----------------------
//----------------------------------
twitch.onAuthorized(function (auth) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;
});
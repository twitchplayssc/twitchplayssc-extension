const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
var pollIntervalId = null;
var TABS = [
    {
        //     name: "Polls",
        //     fetchFn: fetchPolls,
        //     fetchIntervalMs: 3000
        // }, {
        name: "Skills",
        fetchFn: fetchSkills,
        fetchIntervalMs: 3000
        // }, {
        //     name: "Achievements",
        //     fetchFn: fetchAchievements,
        //     fetchIntervalMs: 3000
        // }, {
        //     name: "Maps",
        //     fetchFn: fetchMaps,
        //     fetchIntervalMs: 3000
        // }, {
        //     name: "Stats",
        //     fetchFn: fetchStats,
        //     fetchIntervalMs: 3000
        // }, {
        //     name: "Help",
        //     fetchFn: fetchHelp,
        //     fetchIntervalMs: 3000
    }
];
var ACTIVE_TAB = TABS[0];

$(document).ready(function () {
    function stopFetchingAllData() {
        if (pollIntervalId) clearInterval(pollIntervalId);
    }

    for (var i = 0; i < TABS.length; i++) {
        var tabLink = $('<a/>').attr('id', "tab" + i).addClass('inactive').text(TABS[i].name);
        var tab = $('<span/>').addClass("tab").append(tabLink);
        $('#control-panel-content .tab-selector').append(tab);
        TABS[i].link = tabLink;
        TABS[i].activate = function () {
            ACTIVE_TAB = this;
            $('.tab a').addClass('inactive');
            this.link.removeClass('inactive');
            $('.tab-content').hide(); // hides all content
            $("#tab" + this.name).fadeIn('slow');
        };
        TABS[i].open = function () {
            stopFetchingAllData();
            this.activate();
            this.focus();
        };
        TABS[i].focus = function () {
            if (this.fetchFn) {
                this.fetchFn();
                pollIntervalId = setInterval(this.fetchFn, this.fetchIntervalMs);
            }
        };
    }

    var closeLink = $('<a/>').text("close");
    var closeButton = $('<span/>').addClass("close-control-panel").append(closeLink).click(toggleControlPanel);
    $('#control-panel-content .tab-selector').append(closeButton);

    $('.tab a').click(function () {
        var tabIndex = parseInt($(this).attr('id').substring(3));
        if ($(this).hasClass('inactive')) { // this is the start of our condition
            TABS[tabIndex].open();
        }
    });

    function toggleControlPanel() {
        $('#control-panel').toggle();
        stopFetchingAllData();
        var isOpen = $('#control-panel').is(":visible");
        if (isOpen) {
            ACTIVE_TAB.focus();
        }
        updateControlPanelButtonText();
    }

    $('#control-panel-toggle').click(toggleControlPanel);

    ACTIVE_TAB.activate();
});

function updateControlPanelButtonText(availablePoints) {
    let buttonLabel = $('#control-panel-toggle-label');
    if ($('#control-panel').is(":visible")) {
        buttonLabel.text('Close Skill Panel');
        return;
    }

    let defaultText = 'Open Skill Panel';
    if (availablePoints !== undefined) {
        buttonLabel.attr('availablePoints', availablePoints)
    } else {
        let pointsAttrValue = buttonLabel.attr('availablePoints');
        availablePoints = pointsAttrValue ? parseInt(pointsAttrValue) : 0;
    }
    let text = (availablePoints > 0) ? ('( ' + availablePoints + ' ) \u00A0 Unspent Skill Points') : defaultText;
    buttonLabel.text(text);
}

function updateControlPanelLevelProgress(levelProgress) {
    $('#experience-progress-bar').css("left", "-" + (100 - (levelProgress * 100)) + "%");
    $('#control-panel-toggle').toggleClass("levelupComplete", levelProgress >= 1.0)
}

function fetchPolls() {
    console.log("Imma fetch some Polls");
    updatePolls($('#tabPolls'), DEBUG_POLLS());

    ebsReq({
        url: OVERLAY_API_BASE_URL + '/polls',
        type: 'GET',
        success: function (data) {
            updatePolls($('#tabPolls'), data);
        },
        error: function (e) {
            // $('#tabPolls').text(e.status + ' - ' + e.statusText)
        }
    });
}

function updatePolls(tab, data) {
    if (!data.polls) return;
    var thisIter = Math.random() + '';
    for (var i = 0; i < data.polls.length; i++) {
        var poll = data.polls[i];
        var pollContainerId = 'poll-container-' + poll.id;
        var pollContainer = $('#' + pollContainerId);

        if (pollContainer.length == 0) {
            pollContainer = $('<div/>').attr('id', pollContainerId).addClass("poll-container");
            var pollName = $('<span/>').addClass("pollName").text(poll.name);
            if (poll.disabled) {
                pollName.append($('<span class="pollError"/>').text(' - ' + poll.disabled));
            }
            if (poll.votesLeft) {
                pollName.append($('<span class="pollInfo"/>').text(' - ' + poll.votesLeft + ' votes left'));
            }
            var pollTable = $('<table/>');
            for (var j = 0; j < poll.options.length; j++) {
                var option = poll.options[j];
                var optionTr = $('<tr/>');
                var optionValue = $('<span/>').addClass("currentValue");
                optionValue.css('width', 100 * option.progress + "%").text(option.name);
                optionTr.append($('<td/>').append(optionValue));
                var submitEl = createOptionSubmitElements(poll, j)
                optionTr.append(submitEl);
                pollTable.append(optionTr);
            }
            pollContainer.append(pollName).append(pollTable);
            tab.append(pollContainer);
        } else // poll already rendered, just need to update results
        {
            var pollTable = pollContainer.find('table');
            for (var j = 0; j < poll.options.length; j++) {
                var option = poll.options[j];
                var optionEl = pollTable.children(":nth-child(" + (j + 1) + ")");
                optionEl.find(".currentValue").stop().animate({
                    width: 100 * option.progress + "%"
                }, 1000, function () {
                });

            }
        }
        pollContainer.attr('iterId', thisIter);
    }

    var maxTerra = data.availableTerrazine ? data.availableTerrazine : Number.MAX_SAFE_INTEGER;
    $("input.terra").attr('max', maxTerra).change();
    $(".poll-container[iterId!='" + thisIter + "']").fadeOut("slow");
}

function createOptionSubmitElements(poll, optionIndex) {
    var parentEl = $("<td/>")
    if (poll.voteType == 'Terrazine') {
        var terraInput = $("<input class='terra' type='number' step='100' min='0' value='0'/>");
        terraInput.clamp();
        terraInput.keypress(function (e) {
            if (e.which == 13) {
                pollSubmit($(this), poll.id, optionIndex);
            }
        });

        parentEl.append(terraInput);
        var scrollers = $("<div class='scrollers'/>");
        var numberup = $("<div class='numberup'/>").click(function (e) {
            if (e.shiftKey) terraInput[0].value = terraInput[0].max;
            else terraInput[0].stepUp();
        });
        var numberdown = $("<div class='numberdown'/>").click(function (e) {
            terraInput[0].stepDown();
        });
        parentEl.append(scrollers.append(numberup).append(numberdown));
    }
    var submitBtn = $("<input class='submitBtn' type='button' value='Submit'/>");
    var disabledText = poll.disabled || poll.options[optionIndex].disabled;
    submitBtn.toggleClass('disabled', disabledText !== undefined);
    submitBtn.attr('title', disabledText);
    submitBtn.click(function () {
        pollSubmit($(this), poll.id, optionIndex);
    });
    parentEl.append(submitBtn);
    return parentEl;
}

function pollSubmit(element, pollId, optionIndex) {
    var terraEl = element.parent().find('.terra');
    if (terraEl && terraEl.val() <= 0) {
        return;
    }

    ebsReq({
        url: OVERLAY_API_BASE_URL + '/polls/vote',
        data: {
            pollId: pollId,
            optionIndex: optionIndex,
            terrazine: terraEl ? terraEl.val() : null,
            timestamp: new Date().getTime()
        },
        type: 'POST',
        success: function (data) {
            terraEl.val(0);
            updatePolls($('#tabPolls'), data);
            console.log(element);
            console.log("Cool, you voted with " + terraEl.val());
        },
        error: function (data) {
            updatePolls($('#tabPolls'), data);
            console.log(element);
            console.log("ERROR, you voted with " + terraEl.val());
        }
    });
}

function fetchHelp() {
    console.log("Imma fetch some Help");
}

function fetchStats() {
    console.log("Imma fetch some Stats");
}

function fetchAchievements() {
    // console.log("Imma fetch some Achievements");
}

function fetchSkills() {
    // console.log("fetching skills")
    ebsReq({
        url: OVERLAY_API_BASE_URL + '/playerstatsglobal',
        type: 'GET',
        success: function (data) {
            updateSkills(data);
        },
        error: function (e) {
            console.log(e);
            // $('#tabPolls').text(e.status + ' - ' + e.statusText)
        }
    });
}

function updateSkills(playerGlobalState) {
    if (SKILLS == null) {
        return;
    }

    extendSkills(playerGlobalState);

    rebuildSkillsUI([
        mapSkillGroup("General", SKILLS_GENERAL),
        mapSkillGroup("Protoss", SKILLS_PROTOSS),
        mapSkillGroup("Terran", SKILLS_TERRAN),
        mapSkillGroup("Zerg", SKILLS_ZERG)
    ]);
}

function extendSkills(playerGlobalState) {
    let probablyOutdatedState = false;
    for (let skillId = 0; skillId < PLAYER_GLOBAL_DATA.skills.length; skillId++) {
        let newValueIsSmaller = playerGlobalState.skills[skillId] < PLAYER_GLOBAL_DATA.skills[skillId]
        if (newValueIsSmaller && PLAYER_GLOBAL_DATA.updatedRecently(skillId)) {
            probablyOutdatedState = true;
            break;
        }
    }
    if (!probablyOutdatedState) { // can replace
        PLAYER_GLOBAL_DATA = $.extend(PLAYER_GLOBAL_DATA, playerGlobalState);
    }
}

function mapSkillGroup(groupName, idArray) {
    var group = {name: groupName};
    group.skills = idArray.map(id => ({
        id: id,
        playerLevel: Math.min(PLAYER_GLOBAL_DATA.skills[id], SKILLS[id].maxPoints)
    }));
    return group;
}


function rebuildSkillsUI(skillGroups) {
    $('#skillContainer .skillGroup').detach();
    $('#experience').text(PLAYER_GLOBAL_DATA.level);
    $('.skillHintBox').righteousToggle(false);
    $('#availablePoints').text('-');

    var mainSkillsEl = $('#skillContainer');
    for (var i = 0; i < skillGroups.length; i++) {
        var skillGroup = skillGroups[i];
        var skillGroupEl = $('<div/>').addClass("skillGroup");
        skillGroupEl.append($('<span/>').addClass("skillName").text(skillGroup.name));
        for (var j = 0; j < skillGroup.skills.length; j++) {
            var skillViewInfo = skillGroup.skills[j];
            var playerLevel = skillViewInfo.playerLevel;
            var skillId = skillViewInfo.id;
            var skill = SKILLS[skillId];


            var skillElement = $('<div/>').addClass("skillControls").attr("skillId", skillId)
                .append($('<div/>').addClass("skillIcon").css({
                    "background-position-x": (skillId % 6) * 20 + "%",
                    "background-position-y": Math.floor(skillId / 6) * 33.3 + "%",
                }));

            var progressbar = $('<div/>').addClass("skillProgressbar").tpscprogressbar({
                value: playerLevel,
                max: skill.maxPoints
            });
            skillElement.append(progressbar);

            var skillPlus = $('<div/>').addClass("skillPlus").attr("skillId", skillId)
                .toggleClass("disabled", playerLevel == skill.maxPoints || PLAYER_GLOBAL_DATA.availablePoints == 0);
            skillElement.append(skillPlus)

            skillElement.mouseover(function () {
                var skillId = parseInt($(this).attr("skillId"));
                var skill = SKILLS[skillId];
                var skillLevel = PLAYER_GLOBAL_DATA.skills[skillId];
                $('#skillHintSkillName').text(skill.name + " Level ");
                var skillLevelString = skillLevel + " / " + skill.maxPoints
                $('#currentSkillLevel').text(skillLevelString);
                $("#skillHint").richText(skill.description);
                $('#skillHintContainer').children().righteousToggle(true);
            }).mouseout(function () {
                $('#skillHintContainer').children().righteousToggle(false);
            });
            skillGroupEl.append(skillElement);
        }
        mainSkillsEl.append(skillGroupEl);
    }

    $('#availablePoints').text(PLAYER_GLOBAL_DATA.availablePoints);

    $('.skillPlus').click(function () {
        if (PLAYER_GLOBAL_DATA.availablePoints === 0) return;

        var _this = $(this);
        var skillId = _this.attr("skillId");
        var progressBar = _this.prev();
        var max = parseInt(progressBar.attr('max'));
        var expectedNewValue = PLAYER_GLOBAL_DATA.skills[skillId];
        if (expectedNewValue < max) {
            PLAYER_GLOBAL_DATA.levelupSkill(skillId);
            adjustPlayerGlobalDataUI();
            skillLevelUp(skillId, max, function () {
                _this.mouseover();
            }, function () {
                PLAYER_GLOBAL_DATA.leveldownSkill(skillId);
                adjustPlayerGlobalDataUI();
                _this.mouseover();
            });
        }
    });
}

function adjustPlayerGlobalDataUI() {
    $('.skillControls').each(function () {
        var skillId = parseInt($(this).attr("skillId"));
        var skillMaxLevel = SKILLS[skillId].maxPoints;
        var skillLevel = PLAYER_GLOBAL_DATA.skills[skillId];

        // update plus
        $(this).find('.skillPlus').toggleClass("disabled", PLAYER_GLOBAL_DATA.availablePoints === 0 || skillLevel >= skillMaxLevel);
        // update progress bar
        $(this).find('.skillProgressbar').adjustProgressbar(skillLevel, skillMaxLevel);
    });
    $('#availablePoints').text(PLAYER_GLOBAL_DATA.availablePoints);
    updateControlPanelButtonText(PLAYER_GLOBAL_DATA.availablePoints);
}

function skillLevelUp(skillId, max, onsuccess, onerror) {
    ebsReq({
        url: OVERLAY_API_BASE_URL + '/skills/levelup?timestamp' + new Date().getTime(),
        type: 'POST',
        data: {
            skillId: skillId
        },
        success: function (data) {
            onsuccess();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            onerror();
        }
    });
}


function fetchMaps() {
    console.log("Imma fetch some Maps");
}

(function ($) {

    $.fn.tpscprogressbar = function (options) {
        var opts = $.extend({
            value: 0,
            max: 10,
            name: "skill name"
        }, options);
        this.addClass("progressbarContainer");
        this.attr('max', opts.max);
        this.append($("<div/>").addClass("progressbar"));
        this.append($("<div/>").addClass("skillBarMask"));
//        this.append($("<span/>").addClass("progressbarLabel").text(opts.name));
        return this.adjustProgressbar(opts.value, opts.max);
    };

    $.fn.adjustProgressbar = function (newVal, max) {
        newVal = Math.min(newVal, max);
        var progressPercents = 100.0 * newVal / max;
        this.find('.progressbar').css('left', (progressPercents - 100) + "%");
        var maskStretch = 100 * 20.0 / max; // dynamic max
        this.find('.skillBarMask').css('background-size', maskStretch + '% 100%');
        return this;
    };

    $.fn.clamp = function () {
        function doet() {
            var myMin = parseInt($(this).attr('min'));
            var myMax = parseInt($(this).attr('max'));
            $(this).val(clamp(myMin, $(this).val(), myMax));
        }

        $(this).change(doet);
        return this;
    };
}(jQuery));
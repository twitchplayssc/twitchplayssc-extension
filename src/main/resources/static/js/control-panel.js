const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
var pollIntervalId = null;
var TABS = [
    {
        name: "Polls",
        fetchFn: fetchPolls,
        fetchIntervalMs: 3000
    },{
        name: "Skills",
        fetchFn: fetchSkills,
        fetchIntervalMs: 10000000
    },{
        name: "Achievements",
        fetchFn: fetchAchievements,
        fetchIntervalMs: 1000
    },{
        name: "Maps",
        fetchFn: fetchMaps,
        fetchIntervalMs: 1000
    },{
        name: "Stats",
        fetchFn: fetchStats,
        fetchIntervalMs: 1000
    },{
        name: "Help",
        fetchFn: fetchHelp,
        fetchIntervalMs: 1000
    }
];
var ACTIVE_TAB = TABS[01];

$(document).ready(function() {
    function stopFetchingAllData() {
        if (pollIntervalId) clearInterval(pollIntervalId);
    }

    for (var i = 0; i < TABS.length; i++) {
        var tabLink = $('<a/>').attr('id', "tab" + i).addClass('inactive').text(TABS[i].name);
        var tab = $('<span/>').addClass("tab").append(tabLink);
        $('#control-panel-content .tab-selector').append(tab);
        TABS[i].link = tabLink;
        TABS[i].activate = function() {
            ACTIVE_TAB = this;
            $('.tab a').addClass('inactive');
            this.link.removeClass('inactive');
            $('.tab-content').hide(); // hides all content
            $("#tab" + this.name).fadeIn('slow');
        };
        TABS[i].open = function() {
            stopFetchingAllData();
            this.activate();
            this.focus();
        };
        TABS[i].focus = function() {
            if (this.fetchFn) {
                this.fetchFn();
                pollIntervalId = setInterval(this.fetchFn, this.fetchIntervalMs);
            }
        };
    }

    $('.tab a').click(function(){
        var tabIndex = parseInt($(this).attr('id').substring(3));
        if ($(this).hasClass('inactive')) { // this is the start of our condition
            TABS[tabIndex].open();
        }
    });

    $('#control-panel-toggle').click(function() {
        $('#control-panel').toggle();
        stopFetchingAllData();
        var isOpen = $('#control-panel').is(":visible");
        if (isOpen) {
            ACTIVE_TAB.focus();
        }
        $(this).text(isOpen ? 'Close Control Panel' : 'Open Control Panel');
    });

    ACTIVE_TAB.activate();
});

function fetchPolls() {
    console.log("Imma fetch some Polls");
    updatePolls($('#tabPolls'), DEBUG_POLLS());

    ebsReq({
    	url: OVERLAY_API_BASE_URL + '/polls',
    	type: 'GET',
    	success: function(data) {
       	    updatePolls($('#tabPolls'), data);
        },
        error: function(e) {
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

        if (pollContainer.length == 0)
        {
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
        }
        else // poll already rendered, just need to update results
        {
            var pollTable = pollContainer.find('table');
            for (var j = 0; j < poll.options.length; j++) {
                var option = poll.options[j];
                var optionEl = pollTable.children(":nth-child(" + (j + 1) + ")");
                optionEl.find(".currentValue").stop().animate({
                    width: 100 * option.progress + "%"
                }, 1000, function() {});

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
        terraInput.keypress(function(e) {
            if (e.which == 13) {
                pollSubmit($(this), poll.id, optionIndex);
            }
        });

        parentEl.append(terraInput);
        var scrollers = $("<div class='scrollers'/>");
        var numberup = $("<div class='numberup'/>").click(function(e) {
            if (e.shiftKey) terraInput[0].value = terraInput[0].max;
            else terraInput[0].stepUp();
        });
        var numberdown = $("<div class='numberdown'/>").click(function(e) {
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
    	    pollId : pollId,
    	    optionIndex : optionIndex,
    	    terrazine: terraEl ? terraEl.val() : null,
    	    timestamp: new Date().getTime()
    	},
    	type: 'POST',
    	success: function(data) {
    	    terraEl.val(0);
       	    updatePolls($('#tabPolls'), data);
       	    console.log(element);
            console.log("Cool, you voted with " + terraEl.val());
        },
        error: function(data) {
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
    console.log("Imma fetch some Achievements");
}

function fetchSkills() {
    console.log("Imma fetch some Skills");
    var skillJson = { groups: [] };
    var playerSkills = {
        availablePoints: 5,
        levels: [1, 2, 5, 15, 17, 15, 6, 8, 12, 5, 15, 17, 15 ,15 ,15 ,20, 15, 15, 18, 20, 14, 15]
    };
    skillJson.groups[0] = mapSkillGroup("General", SKILLS_GENERAL, playerSkills.levels);
    skillJson.groups[1] = mapSkillGroup("Protoss", SKILLS_PROTOSS, playerSkills.levels);
    skillJson.groups[2] = mapSkillGroup("Terran", SKILLS_TERRAN, playerSkills.levels);
    skillJson.groups[3] = mapSkillGroup("Zerg", SKILLS_ZERG, playerSkills.levels);
    updateSkills($('#tabSkills'), skillJson, playerSkills);
}

function mapSkillGroup(groupName, idArray, skillLevels) {
    var group = {
        name: groupName
    };

    group.skills = idArray.map(id => ({
        id: id,
        name: SKILLS[id].name,
        shortName: SKILLS[id].shortName,
        hint: SKILLS[id].description,
        playerLevel: skillLevels[id],
        max: SKILLS[id].maxPoints
    }));
    return group;
}

function updateSkills(tab, skills, skillLevels) {
    $('#skillContainer').children().detach();
    $('.skillHintBox').righteousToggle(false);
    $('#availablePoints').text('-');

    var mainSkillsEl = $('#skillContainer');
    for (var i = 0; i < skills.groups.length; i++) {
        var skillGroup = skills.groups[i];
        var skillGroupEl = $('<div/>').addClass("skillGroup");
        skillGroupEl.append($('<span/>').addClass("skillName").text(skillGroup.name));
        for (var j = 0; j < skillGroup.skills.length; j++) {
            var skill = skillGroup.skills[j];

            var skillElement = $('<div/>').attr({
                skillHint: skill.hint,
                skillName: skill.shortName,
                skillLevel: skill.playerLevel + "/" + skill.max
            });
            var progressbar = $('<div/>').addClass("skillProgressbar").append("");
            progressbar.tpscprogressbar({
                name: skill.name,
                value: skill.playerLevel,
                max: skill.max
            });
            skillElement.append(progressbar);
            var skillPlus = $('<div/>').addClass("skillPlus").attr("skillId", skill.id).text("+");
            skillElement.append(skillPlus)
            skillElement.mouseover(function() {
                $('#skillHintSkillName').text($(this).attr("skillName") + " Level ");
                $('#currentSkillLevel').text($(this).attr("skillLevel"));
                $("#skillHint").text($(this).attr("skillHint"));
                $('#skillHintBox').righteousToggle(true);
            }).mouseout(function() {
                $('#skillHintBox').righteousToggle(false);
            });
            skillGroupEl.append(skillElement);
        }
        mainSkillsEl.append(skillGroupEl);
    }
    $('#availablePoints').text(skillLevels.availablePoints);

    $('.skillPlus').click(function() {
        var skillId = $(this).attr("skillId");
        skillLevelUp(skillId);
    });
}

function skillLevelUp(skillId) {
    ebsReq({
        url: OVERLAY_API_BASE_URL + '/skill/levelup?timestamp' + new Date().getTime(),
        type: 'POST',
        data: {
            skillId: skillId
        },
        success: function(data) {

        }
    });
}


function fetchMaps() {
    console.log("Imma fetch some Maps");
}

(function ( $ ) {

    $.fn.tpscprogressbar = function(options) {
        var opts = $.extend( {
            value: 0,
            max: 10,
            name: "skill name"
        }, options );
        this.addClass( "progressbarContainer" );

        this.append($("<div/>").addClass("progressbar"));
        this.append($("<div/>").addClass("skillBarMask"));
//        this.append($("<span/>").addClass("progressbarLabel").text(opts.name));
        return this.adjustProgressbar(opts.value, opts.max);
    };

    $.fn.adjustProgressbar = function( newVal, max ) {
        newVal = Math.min(newVal, max);
        var progressPercents = 100.0 * newVal / max;
        this.find('.progressbar').css('left', (progressPercents - 100) + "%");
        var maskStretch = 100 * 20.0 / max; // dynamic max
        this.find('.skillBarMask').css('background-size', maskStretch + '% 100%');
        return this;
    };

    $.fn.clamp = function() {
        function doet() {
            var myMin = parseInt($(this).attr('min'));
            var myMax = parseInt($(this).attr('max'));
            $(this).val(clamp(myMin, $(this).val(), myMax));
        }
        $(this).change(doet);
        return this;
    };
}( jQuery ));
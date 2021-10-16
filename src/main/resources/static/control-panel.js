var pollIntervalId = null;
var TABS = [
    {
        name: "Polls",
        fetchFn: fetchPolls,
        fetchIntervalMs: 1000
    },{
        name: "Skills",
        fetchFn: fetchSkills,
        fetchIntervalMs: 1000
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
var ACTIVE_TAB = TABS[0];

$(document).ready(function() {
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
            this.activate();
            console.log("opened " + this.name);
            this.focus();
        };
        TABS[i].focus = function() {
            if (pollIntervalId) clearInterval(pollIntervalId);
            pollIntervalId = setInterval(this.fetchFn, this.fetchIntervalMs)
        };
    }

    $('.tab a').click(function(){
        var tabIndex = parseInt($(this).attr('id').substring(3));
        if ($(this).hasClass('inactive')) { //this is the start of our condition
            TABS[tabIndex].open();
        }
    });

    $('#control-panel-toggle').click(function() {
        $('#control-panel').toggle();
        if (pollIntervalId) clearInterval(pollIntervalId);
        if ($('#control-panel').is(":visible")) {
            ACTIVE_TAB.focus();
        }
    });

    ACTIVE_TAB.activate();
});

function fetchPolls() {
    console.log("Imma fetch some Polls");
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
}

function fetchMaps() {
    console.log("Imma fetch some Maps");
}
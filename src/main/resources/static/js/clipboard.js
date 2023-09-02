let $clipboard = $("<input id='clipboard'>").appendTo('body').righteousToggle(false);
let CLIPBOARD_ATTR_T = 't'; // command text
let CLIPBOARD_ATTR_C = 'c'; // coords, meaning minimap
let CLIPBOARD_ATTR_M = 'm';  // multiplier
let CLIPBOARD_TARGET_C = { attr: 'c' };  // minimap target

// key - any object of type CLIPBOARD_BUFFER_PART (including ones coming from the server)
// the ones coming from the server will have attr=t and one of these combos: (tcm, tc, tm, t)
function copyToClipboard(text, key) {
    var oldValue = $clipboard.attr(key.attr);
    $clipboard.attr(key.attr, text);

    if (key.combo) {
        $clipboard.attr("combo", JSON.stringify(key.combo));
    }

    let comboJson = $clipboard.attr("combo")
    var combo = comboJson === undefined ? undefined : JSON.parse(comboJson);

    var newVal;
    var shouldForgetCombo = combo && (key === CLIPBOARD_TARGET_C && !combo.includes(CLIPBOARD_ATTR_C));
    if (!combo || shouldForgetCombo) {
        forgetCombo();
        newVal = text;
    } else {
        // if combo allows multiplier, increment it
        if (combo.includes(CLIPBOARD_ATTR_M) && oldValue === text) {
            var multiplierText = $clipboard.attr(CLIPBOARD_ATTR_M);
            var multiplier = multiplierText ? parseInt(multiplierText) : 1;
            $clipboard.attr(CLIPBOARD_ATTR_M, multiplier + 1);
        }

        newVal = combo.map(a => $clipboard.attr(a)).join(" ").replace(/\s+/g, ' ');
    }

    // clipboard stuff and periodic clear

    if (key.timeoutHandle) clearTimeout(key.timeoutHandle);
    key.timeoutHandle = setTimeout(forgetCombo, 3000); // keep last timeout handle for each type of token

    $clipboard.righteousToggle(true).val(newVal.trim()).select();
    document.execCommand("copy");
    $clipboard.righteousToggle(false);
}

function forgetCombo() {
    $clipboard.attr(CLIPBOARD_ATTR_T, null);
    $clipboard.attr(CLIPBOARD_ATTR_C, null);
    $clipboard.attr(CLIPBOARD_ATTR_M, null);
    $clipboard.attr("combo", null);
}

$(function () {
	$('.minimap').trackClicks($('.minimap-click-data'), crds => ((crds.x + 1) + " " + crds.y),
	    crds => copyToClipboard("(" + (crds.x + 1) + " " + crds.y + ")", CLIPBOARD_TARGET_C), 100, 100);
});
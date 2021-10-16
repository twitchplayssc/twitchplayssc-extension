var UNITS = [];

/*
var UNIT_TABLE_OFFSET = function(idx, scale) {
    return 'right ' + 76 * scale * (idx % 20)  + 'px bottom ' +  (76 * scale * (Math.ceil(idx / 20))) + 'px';
};*/

var UNIT_TABLE_OFFSET = function(idx) {
    return 'right ' + 100 * (idx % 20)  + '% bottom ' +  (99.8 * (Math.ceil(idx / 20))) + '%'; // SUCH MAGIC
};

UNITS[1] = "Probe";
UNITS[2] = "Probe" ;
UNITS[3] = "Zealot" ;
UNITS[4] = "Stalker" ;
UNITS[5] = "Adept" ;
UNITS[6] = "Sentry" ;
UNITS[7] = "Dark Templar" ;
UNITS[8] = "High Templar" ;
UNITS[9] = "Immortal" ;
UNITS[10] = "Warp Prism" ;
UNITS[11] = "Disruptor" ;
UNITS[12] = "Observer" ;
UNITS[13] = "Phoenix" ;
UNITS[14] = "Void Ray" ;
UNITS[15] = "Oracle" ;
UNITS[16] = "Tempest" ;
UNITS[17] = "Carrier" ;
UNITS[18] = "Archon" ;
UNITS[19] = "Colossus" ;
UNITS[20] = "Mothership" ;

UNITS[100] = "Chonky Boi" ;

UNITS[201] = "SCV" ;
UNITS[202] = "SCV" ;
UNITS[203] = "Marine" ;
UNITS[204] = "Reaper" ;
UNITS[205] = "Marauder" ;
UNITS[206] = "Ghost" ;
UNITS[207] = "Hellion" ;
UNITS[208] = "Widow Mine" ;
UNITS[209] = "Cyclone" ;
UNITS[210] = "Siege Tank" ;
UNITS[211] = "Thor" ;
UNITS[212] = "Medivac" ;
UNITS[213] = "Viking" ;
UNITS[214] = "Liberator" ;
UNITS[215] = "Banshee" ;
UNITS[216] = "Raven" ;
UNITS[217] = "Battlecruiser" ;

UNITS[250] = "Medic" ;
UNITS[251] = "Firebat" ;
UNITS[252] = "Spectre" ;
UNITS[253] = "Goliath" ;
UNITS[254] = "Diamondback" ;
UNITS[255] = "Vulture" ;
UNITS[256] = "Predator" ;
UNITS[257] = "Science Vessel" ;
UNITS[258] = "Wraith" ;
UNITS[259] = "Hercules" ;

UNITS[301] = "Drone" ;
UNITS[302] = "Drone" ;
UNITS[303] = "Queen" ;
UNITS[304] = "Zergling" ;
UNITS[305] = "Baneling" ;
UNITS[306] = "Roach" ;

UNITS[308] = "Hydralisk";
UNITS[309] = "Lurker";
UNITS[310] = "Infestor";
UNITS[311] = "Swarmhost";
UNITS[312] = "Ultralisk";
UNITS[313] = "Overlord";
UNITS[314] = "Overseer";
UNITS[315] = "Mutalisk";
UNITS[316] = "Corruptor";
UNITS[317] = "Broodlord";
UNITS[318] = "Viper";
UNITS[319] = "Dropperlord";



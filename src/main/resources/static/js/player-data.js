var PLAYER_GLOBAL_DATA = {
    skills: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    availablePoints: 0,
    levelupSkill: function(skillId) {
        this.availablePoints -= 1;
        this.skills[skillId] += 1;
    }
}
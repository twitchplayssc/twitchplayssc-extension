var PLAYER_GLOBAL_DATA = {
    skills: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    lastSkillUpdates: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    availablePoints: 0,
    levelupSkill: function (skillId) {
        this.availablePoints -= 1;
        this.skills[skillId] += 1;
        this.lastSkillUpdates[skillId] = Date.now()
    },
    leveldownSkill: function (skillId) {
        this.availablePoints += 1;
        this.skills[skillId] -= 1;
        this.lastSkillUpdates[skillId] = Date.now()
    },
    updatedRecently: function (skillId) {
        // at least a minute ago
        return this.lastSkillUpdates[skillId] > Date.now() - 60 * 1000;
    }
}
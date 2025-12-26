const mongoose = require('mongoose');

const triviaStatsSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	score: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('TriviaStats', triviaStatsSchema);


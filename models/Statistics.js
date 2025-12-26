const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
	key: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	value: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	}
});

module.exports = mongoose.model('Statistics', statisticsSchema);


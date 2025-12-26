const mongoose = require('mongoose');

const linkedSchema = new mongoose.Schema({
	nametag: {
		type: String,
		required: true,
		unique: true,
		index: true,
		lowercase: true
	},
	discordId: {
		type: String,
		required: true
	},
	private: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Linked', linkedSchema);


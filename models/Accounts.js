const mongoose = require('mongoose');

const accountsSchema = new mongoose.Schema({
	nametag: {
		type: String,
		required: true,
		unique: true,
		index: true,
		lowercase: true
	},
	region: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Accounts', accountsSchema);


class MongoDBMap {
	constructor(Model, keyField = '_id') {
		this.Model = Model;
		this.keyField = keyField;
		this.cache = new Map();
		this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
	}

	async get(key) {
		if (this.cache.has(key)) {
			const cached = this.cache.get(key);
			if (Date.now() - cached.timestamp < this.cacheTimeout) {
				return cached.value;
			}
			this.cache.delete(key);
		}

		const doc = await this.Model.findOne({ [this.keyField]: key });
		if (!doc) return undefined;
		
		const value = doc.value !== undefined ? doc.value : doc;
		this.cache.set(key, { value, timestamp: Date.now() });
		return value;
	}

	async set(key, value, field = null) {
		const updateData = field ? { [field]: value } : { [this.keyField]: key, value };
		const doc = await this.Model.findOneAndUpdate(
			{ [this.keyField]: key },
			updateData,
			{ upsert: true, new: true }
		);
		const resultValue = doc.value !== undefined ? doc.value : (doc[this.keyField] === key && doc.value === undefined ? doc : doc.value || doc);
		this.cache.set(key, { value: resultValue, timestamp: Date.now() });
	}

	async has(key) {
		const cached = this.cache.get(key);
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return true;
		}
		const count = await this.Model.countDocuments({ [this.keyField]: key });
		return count > 0;
	}

	async delete(key) {
		await this.Model.deleteOne({ [this.keyField]: key });
		this.cache.delete(key);
	}

	async ensure(key, defaultValue) {
		const exists = await this.has(key);
		if (!exists) {
			await this.set(key, defaultValue);
		}
		return await this.get(key);
	}

	async entries() {
		const docs = await this.Model.find({});
		return docs.map(doc => {
			const key = doc[this.keyField];
			const value = doc.value !== undefined ? doc.value : doc;
			return [key.toString(), value];
		});
	}

	async map(callback) {
		const entries = await this.entries();
		return entries.map(callback);
	}
}

class TriviaStatsMap extends MongoDBMap {
	constructor(Model) {
		super(Model, 'userId');
	}

	async get(key) {
		const cached = this.cache.get(key);
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return cached.value;
		}

		const doc = await this.Model.findOne({ userId: key });
		if (!doc) return undefined;
		
		this.cache.set(key, { value: doc.score, timestamp: Date.now() });
		return doc.score;
	}

	async set(key, value) {
		await this.Model.findOneAndUpdate(
			{ userId: key },
			{ userId: key, score: value },
			{ upsert: true, new: true }
		);
		this.cache.set(key, { value, timestamp: Date.now() });
	}

	async math(key, operation, value) {
		const doc = await this.Model.findOne({ userId: key });
		let currentScore = doc ? doc.score : 0;
		
		switch (operation) {
			case '+':
				currentScore += value;
				break;
			case '-':
				currentScore -= value;
				break;
			case '*':
				currentScore *= value;
				break;
			case '/':
				currentScore /= value;
				break;
			default:
				throw new Error(`Unknown math operation: ${operation}`);
		}
		
		await this.set(key, currentScore);
		return currentScore;
	}

	async entries() {
		const docs = await this.Model.find({});
		return docs.map(doc => [doc.userId, doc.score]);
	}
}

class AccountsMap extends MongoDBMap {
	constructor(Model) {
		super(Model, 'nametag');
	}

	async get(key) {
		const cached = this.cache.get(key.toLowerCase());
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return cached.value;
		}

		const doc = await this.Model.findOne({ nametag: key.toLowerCase() });
		if (!doc) return undefined;
		
		this.cache.set(key.toLowerCase(), { value: doc.region, timestamp: Date.now() });
		return doc.region;
	}

	async set(key, value) {
		await this.Model.findOneAndUpdate(
			{ nametag: key.toLowerCase() },
			{ nametag: key.toLowerCase(), region: value },
			{ upsert: true, new: true }
		);
		this.cache.set(key.toLowerCase(), { value, timestamp: Date.now() });
	}

	async has(key) {
		const cached = this.cache.get(key.toLowerCase());
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return true;
		}
		const count = await this.Model.countDocuments({ nametag: key.toLowerCase() });
		return count > 0;
	}

	async delete(key) {
		await this.Model.deleteOne({ nametag: key.toLowerCase() });
		this.cache.delete(key.toLowerCase());
	}

	async map(callback) {
		const docs = await this.Model.find({});
		return docs.map(doc => callback(doc.region, doc.nametag));
	}
}

class LinkedMap extends MongoDBMap {
	constructor(Model) {
		super(Model, 'nametag');
	}

	async get(key) {
		const cached = this.cache.get(key.toLowerCase());
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return cached.value;
		}

		const doc = await this.Model.findOne({ nametag: key.toLowerCase() });
		if (!doc) return undefined;
		
		const value = { id: doc.discordId, private: doc.private };
		this.cache.set(key.toLowerCase(), { value, timestamp: Date.now() });
		return value;
	}

	async set(key, value) {
		// Set entire object { id, private }
		if (typeof value === 'object' && value.id !== undefined) {
			await this.Model.findOneAndUpdate(
				{ nametag: key.toLowerCase() },
				{ nametag: key.toLowerCase(), discordId: value.id, private: value.private || false },
				{ upsert: true, new: true }
			);
			this.cache.set(key.toLowerCase(), { value, timestamp: Date.now() });
		}
	}

	async setPrivate(key, isPrivate) {
		const doc = await this.Model.findOne({ nametag: key.toLowerCase() });
		if (doc) {
			doc.private = isPrivate;
			await doc.save();
			const updatedValue = { id: doc.discordId, private: doc.private };
			this.cache.set(key.toLowerCase(), { value: updatedValue, timestamp: Date.now() });
		}
	}

	async setDiscordId(key, discordId) {
		const doc = await this.Model.findOne({ nametag: key.toLowerCase() });
		if (doc) {
			doc.discordId = discordId;
			await doc.save();
			const updatedValue = { id: doc.discordId, private: doc.private };
			this.cache.set(key.toLowerCase(), { value: updatedValue, timestamp: Date.now() });
		}
	}

	async has(key) {
		const cached = this.cache.get(key.toLowerCase());
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return true;
		}
		const count = await this.Model.countDocuments({ nametag: key.toLowerCase() });
		return count > 0;
	}

	async delete(key) {
		await this.Model.deleteOne({ nametag: key.toLowerCase() });
		this.cache.delete(key.toLowerCase());
	}
}

module.exports = { MongoDBMap, TriviaStatsMap, AccountsMap, LinkedMap };


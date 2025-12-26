module.exports = async (map, key, field = null) => {
    if (!field) {
        const current = await map.get(key) || 0;
        await map.set(key, current + 1);
        return;
    }
    const obj = await map.get(key) || {};
    obj[field] = (obj[field] || 0) + 1;
    await map.set(key, obj);
};